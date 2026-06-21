const path = require('path');
const http = require('http');

// Setup require.cache Mocks
const mysqlPath = path.resolve(__dirname, '../config/mysql.js');
require.cache[mysqlPath] = {
    id: mysqlPath,
    filename: mysqlPath,
    loaded: true,
    exports: {
        query: async () => [[]]
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
    find: async () => []
};
require.cache[carModelPath] = { id: carModelPath, filename: carModelPath, loaded: true, exports: MockCar };

const app = require('../app');
const server = http.createServer(app);
const PORT = 3003;

server.listen(PORT, async () => {
    console.log(`================================================================`);
    console.log(`🛡️  Iniciando Simulação de Proteção contra DoS e Brute Force`);
    console.log(`   Servidor rodando na porta ${PORT}`);
    console.log(`================================================================\n`);

    // Helper to perform requests
    async function sendRequest(name, path, method, headers = {}, body = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };
        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`http://localhost:${PORT}${path}`, options);
            return {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers
            };
        } catch (error) {
            return { status: 500, error: error.message };
        }
    }

    try {
        // --- 1. Heavy Request Protection (Payload Size Limiting) ---
        console.log(`👉 [TESTE 1] Enviando Requisição com Payload Pesado (>50KB)...`);
        
        // Generate a heavy payload (~60KB)
        const heavyString = 'A'.repeat(60 * 1024);
        const heavyBody = { data: heavyString };

        const res1 = await sendRequest(
            'Enviar Payload Gigante',
            '/api/cars',
            'POST',
            {},
            heavyBody
        );

        console.log(`   -> Resposta do Servidor: Status ${res1.status} (${res1.statusText})`);
        if (res1.status === 413) {
            console.log(`   ✅ Defesa Ativa: Servidor barrou o payload grande e evitou exaustão de memória.`);
        } else {
            console.log(`   ❌ Vulnerabilidade: O servidor aceitou o payload pesado.`);
        }
        console.log('----------------------------------------------------------------\n');

        // --- 2. Brute Force Protection (Rate Limiter Validation) ---
        console.log(`👉 [TESTE 2] Simulando Ataque de Brute Force (Várias Requisições Rápidas)...`);
        console.log(`   Disparando 350 requisições para a rota /api/cars...`);

        let rateLimited = false;
        let blockedAt = -1;

        for (let i = 1; i <= 350; i++) {
            const res = await sendRequest(`Request #${i}`, '/api/cars', 'GET');
            if (res.status === 429) {
                rateLimited = true;
                blockedAt = i;
                break;
            }
        }

        if (rateLimited) {
            console.log(`   ✅ Defesa Ativa: O rate limiter bloqueou as requisições a partir do envio de número #${blockedAt}.`);
            console.log(`   -> Resposta final: Status 429 (Too Many Requests).`);
        } else {
            console.log(`   ❌ Vulnerabilidade: O servidor aceitou todas as 350 requisições seguidas sem bloquear.`);
        }
        console.log('----------------------------------------------------------------\n');

    } catch (err) {
        console.error('Erro durante a execução do teste:', err);
    } finally {
        server.close(() => {
            console.log('🛑 Simulação finalizada.');
            process.exit(0);
        });
    }
});
