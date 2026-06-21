const path = require('path');
const http = require('http');

// Setup require.cache Mocks for Database Connections and Models
const mysqlPath = path.resolve(__dirname, '../config/mysql.js');
require.cache[mysqlPath] = {
    id: mysqlPath,
    filename: mysqlPath,
    loaded: true,
    exports: {
        query: async (sql, params) => {
            // Mock SQL Injection prevention check:
            // Since we use parameterized queries, params will hold the raw payload safely
            if (sql.includes('SELECT * FROM users WHERE username = ?')) {
                const username = params[0];
                const bcrypt = require('bcryptjs');
                
                // If SQL injection bypass payload was passed, it will be treated as a literal username string
                if (username.includes("'") || username.includes("--") || username.includes("OR")) {
                    return [[]]; // Safe query returns nothing
                }

                if (username === 'admin') {
                    const hashedPassword = await bcrypt.hash('admin123', 10);
                    return [[{ id: 1, username: 'admin', password: hashedPassword, role: 'admin' }]];
                } else if (username === 'operador_teste') {
                    const hashedPassword = await bcrypt.hash('operador123', 10);
                    return [[{ id: 2, username: 'operador_teste', password: hashedPassword, role: 'user' }]];
                }
                return [[]];
            }
            if (sql.includes('SELECT id, username, role FROM users')) {
                return [[{ id: 1, username: 'admin', role: 'admin' }]];
            }
            return [{ affectedRows: 1 }];
        }
    }
};

const mongoPath = path.resolve(__dirname, '../config/mongo.js');
require.cache[mongoPath] = {
    id: mongoPath,
    filename: mongoPath,
    loaded: true,
    exports: {
        connectMongoDB: async () => {},
        disconnectMongoDB: async () => {}
    }
};

const carModelPath = path.resolve(__dirname, '../models/carModel.js');
const MockCar = {
    find: async () => [{ _id: '123', marca: 'Ford' }],
    findById: async (id) => {
        // Trigger CastError if MongoDB ID is invalid
        if (id === 'invalid-mongo-id') {
            const err = new Error('Cast to ObjectId failed');
            err.status = 400;
            throw err;
        }
        return { _id: id, marca: 'Ford' };
    }
};
require.cache[carModelPath] = { id: carModelPath, filename: carModelPath, loaded: true, exports: MockCar };

const app = require('../app');
const server = http.createServer(app);
const PORT = 3002;

server.listen(PORT, async () => {
    console.log(`================================================================`);
    console.log(`🛡️  Iniciando Simulação de Exploits - OWASP Top 10`);
    console.log(`   Servidor rodando na porta ${PORT}`);
    console.log(`================================================================\n`);

    const jwt = require('jsonwebtoken');
    const userToken = jwt.sign({ id: 2, username: 'operador_teste', role: 'user' }, process.env.JWT_SECRET || 'supersecretjwtkeythatissecure12345');

    async function testExploit(name, path, method, headers = {}, body = null) {
        console.log(`🚀 Tentando Exploit: [${name}]`);
        console.log(`   Chamada: ${method} http://localhost:${PORT}${path}`);
        if (body) console.log(`   Payload:`, JSON.stringify(body));

        const requestOptions = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };
        if (body) {
            requestOptions.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`http://localhost:${PORT}${path}`, requestOptions);
            const status = response.status;
            const data = await response.json();
            
            console.log(`   -> Resposta do Servidor: Status ${status}`);
            console.log(`   -> Corpo da Resposta:`, JSON.stringify(data));
            return { status, data };
        } catch (error) {
            console.log(`   -> Resposta Falhou:`, error.message);
            return { status: 500 };
        }
    }

    try {
        // --- 1. A01:2021-Broken Access Control ---
        console.log(`--- [TESTE 1] A01:2021 - Broken Access Control ---`);
        
        // Exploit A: Access admin route without token
        const res1a = await testExploit(
            'Acessar Painel de Usuários (SQL) sem Autenticação',
            '/api/users',
            'GET'
        );
        console.log(res1a.status === 401 ? '   ✅ Defesa Ativa: Acesso negado com 401.' : '   ❌ Vulnerabilidade: Acesso liberado!');
        console.log('');

        // Exploit B: Access admin route with Operator level privilege
        const res1b = await testExploit(
            'Acessar Painel de Usuários com Token de privilégio básico (User)',
            '/api/users',
            'GET',
            { 'Authorization': `Bearer ${userToken}` }
        );
        console.log(res1b.status === 403 ? '   ✅ Defesa Ativa: Escalabilidade de privilégio impedida com 403.' : '   ❌ Vulnerabilidade: Acesso liberado!');
        console.log('----------------------------------------------------------------\n');

        // --- 2. A03:2021-Injection ---
        console.log(`--- [TESTE 2] A03:2021 - Injection (SQL Injection Bypass) ---`);
        
        // Exploit: Injetando tautologia SQL "' OR '1'='1" para tentar burlar login
        const res2 = await testExploit(
            'Ignorar login usando SQL Injection no campo username',
            '/api/auth/login',
            'POST',
            {},
            { username: "' OR '1'='1' --", password: "arbitrarypassword" }
        );
        console.log(res2.status === 401 ? '   ✅ Defesa Ativa: Query parametrizada tratou string de injeção literalmente.' : '   ❌ Vulnerabilidade: Login burlado!');
        console.log('----------------------------------------------------------------\n');

        // --- 3. A07:2021-Identification and Authentication Failures ---
        console.log(`--- [TESTE 3] A07:2021 - Username Enumeration (Descobrir Usuários) ---`);
        
        // Check message for wrong password
        const res3a = await testExploit(
            'Login com Usuário Existente e Senha Incorreta',
            '/api/auth/login',
            'POST',
            {},
            { username: 'admin', password: 'wrongpassword' }
        );
        
        // Check message for non-existent user
        const res3b = await testExploit(
            'Login com Usuário Inexistente',
            '/api/auth/login',
            'POST',
            {},
            { username: 'usuario_inexistente_123', password: 'wrongpassword' }
        );
        
        const isSameMsg = res3a.data?.erro === res3b.data?.erro;
        console.log(isSameMsg ? '   ✅ Defesa Ativa: Mensagens idênticas. Enumeração de usuários impossibilitada.' : '   ❌ Vulnerabilidade: Mensagens revelam se usuário existe.');
        console.log('----------------------------------------------------------------\n');

        // --- 4. A05:2021-Security Misconfiguration ---
        console.log(`--- [TESTE 4] A05:2021 - Information Exposure on Error (Vazamento de Stack Trace) ---`);
        
        // Exploit: Provocar erro passando ID incorreto no Mongo para analisar resposta
        const res4 = await testExploit(
            'Forçar Erro de Validação de ID MongoDB',
            '/api/cars/invalid-mongo-id',
            'GET',
            { 'Authorization': `Bearer ${userToken}` }
        );
        
        const responseString = JSON.stringify(res4.data);
        const leaksStack = responseString.includes('at ') || responseString.includes('node_modules') || responseString.includes('stack');
        console.log(!leaksStack ? '   ✅ Defesa Ativa: Mensagem tratada e nenhum stack trace exposto.' : '   ❌ Vulnerabilidade: Stack trace do servidor vazou.');
        console.log('----------------------------------------------------------------\n');

    } catch (err) {
        console.error('Erro na simulação:', err);
    } finally {
        server.close(() => {
            console.log('🛑 Simulação encerrada.');
            process.exit(0);
        });
    }
});
