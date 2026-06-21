const path = require('path');
const http = require('http');

// Setup require.cache Mocks simulating a concurrent race condition
let registeredUsernames = new Set();

const mysqlPath = path.resolve(__dirname, '../config/mysql.js');
require.cache[mysqlPath] = {
    id: mysqlPath,
    filename: mysqlPath,
    loaded: true,
    exports: {
        query: async (sql, params) => {
            if (sql.includes('SELECT * FROM users WHERE username = ?')) {
                const username = params[0];
                if (registeredUsernames.has(username)) {
                    return [[{ id: 1, username }]];
                }
                return [[]];
            }
            if (sql.includes('INSERT INTO users')) {
                const username = params[0];
                
                // Simulate DB UNIQUE constraint check during insert
                if (registeredUsernames.has(username)) {
                    const err = new Error(`Duplicate entry '${username}' for key 'users.username'`);
                    err.code = 'ER_DUP_ENTRY';
                    throw err;
                }
                
                // Save user
                registeredUsernames.add(username);
                return [{ insertId: Math.floor(Math.random() * 1000) }];
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

const app = require('../app');
const server = http.createServer(app);
const PORT = 3004;

server.listen(PORT, async () => {
    console.log(`================================================================`);
    console.log(`🛡️  Iniciando Simulação de Concorrência e Race Condition`);
    console.log(`   Servidor rodando na porta ${PORT}`);
    console.log(`================================================================\n`);

    async function registerUser(username) {
        try {
            const response = await fetch(`http://localhost:${PORT}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password: 'password123' })
            });
            const status = response.status;
            const data = await response.json();
            return { status, data };
        } catch (err) {
            return { status: 500, error: err.message };
        }
    }

    try {
        console.log(`👉 Enviando 2 requisições de cadastro idênticas SIMULTANEAMENTE...`);
        
        // Fire both registration requests concurrently
        const [res1, res2] = await Promise.all([
            registerUser('joao_concorrente'),
            registerUser('joao_concorrente')
        ]);

        console.log(`   [REQ 1] Status: ${res1.status} | Resposta:`, JSON.stringify(res1.data));
        console.log(`   [REQ 2] Status: ${res2.status} | Resposta:`, JSON.stringify(res2.data));

        const oneSucceeded = (res1.status === 201 && res2.status === 400) || (res1.status === 400 && res2.status === 201);
        
        if (oneSucceeded) {
            console.log(`\n   ✅ Defesa Ativa: Apenas uma requisição foi aceita.`);
            console.log(`      A restrição UNIQUE do banco barrou a inserção duplicada na segunda requisição.`);
        } else {
            console.log(`\n   ❌ Falha: Ambas requisições retornaram sucesso ou falharam incorretamente.`);
        }
        console.log('----------------------------------------------------------------\n');

    } catch (err) {
        console.error('Erro na simulação:', err);
    } finally {
        server.close(() => {
            console.log('🛑 Simulação de concorrência finalizada.');
            process.exit(0);
        });
    }
});
