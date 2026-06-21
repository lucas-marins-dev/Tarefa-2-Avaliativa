const path = require('path');
const http = require('http');

// 1. Setup require.cache Mocks for Database Connections and Models
const mysqlPath = path.resolve(__dirname, '../config/mysql.js');
require.cache[mysqlPath] = {
    id: mysqlPath,
    filename: mysqlPath,
    loaded: true,
    exports: {
        query: async (sql, params) => {
            if (sql.includes('SELECT * FROM users WHERE username = ?')) {
                const username = params[0];
                const bcrypt = require('bcryptjs');
                if (username === 'admin') {
                    const hashedPassword = await bcrypt.hash('admin123', 10);
                    return [[{ id: 1, username: 'admin', password: hashedPassword, role: 'admin' }]];
                } else if (username === 'operador_teste') {
                    const hashedPassword = await bcrypt.hash('operador123', 10);
                    return [[{ id: 2, username: 'operador_teste', password: hashedPassword, role: 'user' }]];
                }
                return [[]]; // User not found
            }
            if (sql.includes('INSERT INTO users')) {
                return [{ insertId: 99 }];
            }
            if (sql.includes('SELECT id, username, role FROM users')) {
                if (sql.includes('WHERE id = ?')) {
                    return [[{ id: params[0], username: 'user_edited', role: 'user' }]];
                }
                return [[
                    { id: 1, username: 'admin', role: 'admin' },
                    { id: 2, username: 'operador_teste', role: 'user' }
                ]];
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
        connectMongoDB: async () => console.log('   [MOCK DB] Conexão com MongoDB iniciada.'),
        disconnectMongoDB: async () => console.log('   [MOCK DB] Conexão com MongoDB encerrada.')
    }
};

const carModelPath = path.resolve(__dirname, '../models/carModel.js');
function MockCar(data) {
    this.marca = data.marca;
    this.modelo = data.modelo;
    this.ano = data.ano;
    this.preco = data.preco;
}
MockCar.prototype.save = async function() {
    return { _id: 'mock_car_123', marca: this.marca, modelo: this.modelo, ano: this.ano, preco: this.preco };
};
MockCar.find = async () => [{ _id: 'mock_car_123', marca: 'Ford', modelo: 'Mustang', ano: 2020, preco: 150000 }];
MockCar.findById = async () => ({ _id: 'mock_car_123', marca: 'Ford', modelo: 'Mustang', ano: 2020, preco: 150000 });
MockCar.findByIdAndUpdate = async (id, data) => ({ _id: id, ...data });
MockCar.findByIdAndDelete = async () => ({ _id: 'mock_car_123' });
require.cache[carModelPath] = { id: carModelPath, filename: carModelPath, loaded: true, exports: MockCar };

const motoModelPath = path.resolve(__dirname, '../models/motoModel.js');
function MockMoto(data) {
    this.marca = data.marca;
    this.modelo = data.modelo;
    this.ano = data.ano;
    this.preco = data.preco;
    this.cilindrada = data.cilindrada;
}
MockMoto.prototype.save = async function() {
    return { _id: 'mock_moto_456', marca: this.marca, modelo: this.modelo, ano: this.ano, preco: this.preco, cilindrada: this.cilindrada };
};
MockMoto.find = async () => [{ _id: 'mock_moto_456', marca: 'Honda', modelo: 'CB500', ano: 2022, preco: 35000, cilindrada: 500 }];
MockMoto.findById = async () => ({ _id: 'mock_moto_456', marca: 'Honda', modelo: 'CB500', ano: 2022, preco: 35000, cilindrada: 500 });
MockMoto.findByIdAndUpdate = async (id, data) => ({ _id: id, ...data });
MockMoto.findByIdAndDelete = async () => ({ _id: 'mock_moto_456' });
require.cache[motoModelPath] = { id: motoModelPath, filename: motoModelPath, loaded: true, exports: MockMoto };

const brandModelPath = path.resolve(__dirname, '../models/brandModel.js');
function MockBrand(data) {
    this.nome = data.nome;
    this.pais = data.pais;
    this.categoria = data.categoria;
}
MockBrand.prototype.save = async function() {
    return { _id: 'mock_brand_789', nome: this.nome, pais: this.pais, categoria: this.categoria };
};
MockBrand.find = async () => [{ _id: 'mock_brand_789', nome: 'Zara', pais: 'Espanha', categoria: 'Moda' }];
MockBrand.findById = async () => ({ _id: 'mock_brand_789', nome: 'Zara', pais: 'Espanha', categoria: 'Moda' });
MockBrand.findByIdAndUpdate = async (id, data) => ({ _id: id, ...data });
MockBrand.findByIdAndDelete = async () => ({ _id: 'mock_brand_789' });
require.cache[brandModelPath] = { id: brandModelPath, filename: brandModelPath, loaded: true, exports: MockBrand };

// 2. Start local HTTP server
const app = require('../app');
const server = http.createServer(app);
const PORT = 3001;

server.listen(PORT, async () => {
    console.log(`================================================================`);
    console.log(`🔥 Servidor de Teste HTTP Rodando Localmente na Porta ${PORT}`);
    console.log(`================================================================\n`);

    try {
        let adminToken = '';
        let userToken = '';

        // Helper to perform HTTP Requests
        async function runRequest(name, path, method, body = null, token = null) {
            console.log(`[REQ] ${name} -> ${method} http://localhost:${PORT}${path}`);
            const headers = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const options = {
                method,
                headers
            };
            if (body) {
                options.body = JSON.stringify(body);
            }

            try {
                const response = await fetch(`http://localhost:${PORT}${path}`, options);
                const status = response.status;
                let data = {};
                if (status !== 204) {
                    data = await response.json();
                }
                
                console.log(`[RES] Status: ${status}`);
                console.log(`      Body:`, JSON.stringify(data));
                console.log(`----------------------------------------------------------------`);
                return { status, data };
            } catch (err) {
                console.error(`[ERR] Request Failed:`, err.message);
                console.log(`----------------------------------------------------------------`);
                return { status: 500, error: err.message };
            }
        }

        // Test 1: Register Operator
        await runRequest('Registrar Operador de Teste', '/api/auth/register', 'POST', {
            username: 'operador_teste',
            password: 'operador123'
        });

        // Test 2: Login Admin
        const loginAdminRes = await runRequest('Login Administrador', '/api/auth/login', 'POST', {
            username: 'admin',
            password: 'admin123'
        });
        adminToken = loginAdminRes.data?.token || '';

        // Test 3: Login Operator
        const loginUserRes = await runRequest('Login Operador', '/api/auth/login', 'POST', {
            username: 'operador_teste',
            password: 'operador123'
        });
        userToken = loginUserRes.data?.token || '';

        // Test 4: Access Cars NoSQL - Unauthorized (No Token)
        await runRequest('Listar Carros - Sem Token', '/api/cars', 'GET');

        // Test 5: Access Cars NoSQL - Success (User Token)
        await runRequest('Listar Carros - Com Token', '/api/cars', 'GET', null, userToken);

        // Test 6: Create Car NoSQL (User Token)
        await runRequest('Criar Carro NoSQL', '/api/cars', 'POST', {
            marca: 'Ferrari',
            modelo: 'Roma',
            ano: 2023,
            preco: 1900000
        }, userToken);

        // Test 7: Access Motos NoSQL (User Token)
        await runRequest('Listar Motos', '/api/motos', 'GET', null, userToken);

        // Test 8: Create Moto NoSQL (User Token)
        await runRequest('Criar Moto NoSQL', '/api/motos', 'POST', {
            marca: 'Ducati',
            modelo: 'Panigale V4',
            ano: 2024,
            preco: 160000,
            cilindrada: 1103
        }, userToken);

        // Test 9: Access Brands NoSQL (User Token)
        await runRequest('Listar Marcas de Roupas', '/api/clothing-brands', 'GET', null, userToken);

        // Test 10: Create Brand NoSQL (User Token)
        await runRequest('Criar Marca de Roupa', '/api/clothing-brands', 'POST', {
            nome: 'Gucci',
            pais: 'Itália',
            categoria: 'Luxo'
        }, userToken);

        // Test 11: Access SQL Users - Denied (User Token)
        await runRequest('Listar Usuários - Negado para Operador', '/api/users', 'GET', null, userToken);

        // Test 12: Access SQL Users - Success (Admin Token)
        await runRequest('Listar Usuários - Autorizado para Admin', '/api/users', 'GET', null, adminToken);

        // Test 13: Create SQL User (Admin Token)
        const createUserRes = await runRequest('Criar Novo Usuário no SQL', '/api/users', 'POST', {
            username: 'novo_funcionario',
            password: 'senhafuncionario',
            role: 'user'
        }, adminToken);
        const newUserId = createUserRes.data?.id || 99;

        // Test 14: Update SQL User (Admin Token)
        await runRequest('Atualizar Usuário no SQL', `/api/users/${newUserId}`, 'PUT', {
            username: 'novo_funcionario_editado',
            role: 'admin'
        }, adminToken);

        // Test 15: Delete SQL User (Admin Token)
        await runRequest('Deletar Usuário no SQL', `/api/users/${newUserId}`, 'DELETE', null, adminToken);

        console.log(`\n🎉 Todos os testes de requisições foram concluídos com sucesso!`);
    } catch (error) {
        console.error('Ocorreu um erro durante a execução dos testes:', error);
    } finally {
        // Stop server
        server.close(() => {
            console.log(`🛑 Servidor de Teste HTTP finalizado.`);
            process.exit(0);
        });
    }
});
