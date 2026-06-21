const request = require('supertest');
const app = require('../app');
const pool = require('../config/mysql');
const Car = require('../models/carModel');
const Moto = require('../models/motoModel');
const Brand = require('../models/brandModel');
const jwt = require('jsonwebtoken');

// Mock MySQL config pool
jest.mock('../config/mysql', () => {
    return {
        query: jest.fn()
    };
});

// Mock Mongoose models
jest.mock('../models/carModel', () => {
    const mockConstructor = jest.fn().mockImplementation((data) => {
        const obj = { ...data, _id: '123' };
        obj.save = jest.fn().mockResolvedValue(obj);
        return obj;
    });
    mockConstructor.find = jest.fn();
    mockConstructor.findById = jest.fn();
    mockConstructor.findByIdAndUpdate = jest.fn();
    mockConstructor.findByIdAndDelete = jest.fn();
    return mockConstructor;
});

jest.mock('../models/motoModel', () => {
    const mockConstructor = jest.fn().mockImplementation((data) => {
        const obj = { ...data, _id: '456' };
        obj.save = jest.fn().mockResolvedValue(obj);
        return obj;
    });
    mockConstructor.find = jest.fn();
    mockConstructor.findById = jest.fn();
    mockConstructor.findByIdAndUpdate = jest.fn();
    mockConstructor.findByIdAndDelete = jest.fn();
    return mockConstructor;
});

jest.mock('../models/brandModel', () => {
    const mockConstructor = jest.fn().mockImplementation((data) => {
        const obj = { ...data, _id: '789' };
        obj.save = jest.fn().mockResolvedValue(obj);
        return obj;
    });
    mockConstructor.find = jest.fn();
    mockConstructor.findById = jest.fn();
    mockConstructor.findByIdAndUpdate = jest.fn();
    mockConstructor.findByIdAndDelete = jest.fn();
    return mockConstructor;
});

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkeythatissecure12345';
const adminToken = 'Bearer ' + jwt.sign({ id: 1, username: 'admin', role: 'admin' }, JWT_SECRET);
const userToken = 'Bearer ' + jwt.sign({ id: 2, username: 'user', role: 'user' }, JWT_SECRET);

describe('Integration Tests - API Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Authentication Endpoints', () => {
        test('POST /api/auth/register - Success', async () => {
            pool.query.mockResolvedValueOnce([[]]); // check existing username -> empty
            pool.query.mockResolvedValueOnce([{ insertId: 3 }]); // insert user query

            const res = await request(app)
                .post('/api/auth/register')
                .send({ username: 'testuser', password: 'password123' });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('id', 3);
            expect(res.body).toHaveProperty('username', 'testuser');
        });

        test('POST /api/auth/register - User already exists', async () => {
            pool.query.mockResolvedValueOnce([[{ id: 1, username: 'admin' }]]); // existing user

            const res = await request(app)
                .post('/api/auth/register')
                .send({ username: 'admin', password: 'adminpassword' });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('erro', 'Nome de usuário já está em uso');
        });

        test('POST /api/auth/login - Success', async () => {
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            pool.query.mockResolvedValueOnce([[{ id: 1, username: 'admin', password: hashedPassword, role: 'admin' }]]);

            const res = await request(app)
                .post('/api/auth/login')
                .send({ username: 'admin', password: 'admin123' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user).toHaveProperty('username', 'admin');
        });

        test('POST /api/auth/login - Invalid Credentials', async () => {
            pool.query.mockResolvedValueOnce([[]]); // user not found

            const res = await request(app)
                .post('/api/auth/login')
                .send({ username: 'nonexistent', password: 'wrongpassword' });

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('erro', 'Usuário ou senha incorretos');
        });
    });

    describe('User SQL CRUD (Admin Only)', () => {
        test('GET /api/users - Success with Admin token', async () => {
            pool.query.mockResolvedValueOnce([[{ id: 1, username: 'admin', role: 'admin' }]]);

            const res = await request(app)
                .get('/api/users')
                .set('Authorization', adminToken);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body[0]).toHaveProperty('username', 'admin');
        });

        test('GET /api/users - Denied with User token', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', userToken);

            expect(res.statusCode).toBe(403);
            expect(res.body).toHaveProperty('erro', 'Acesso negado: permissões insuficientes');
        });

        test('POST /api/users - Success with Admin token', async () => {
            pool.query.mockResolvedValueOnce([[]]); // check existing -> empty
            pool.query.mockResolvedValueOnce([{ insertId: 4 }]); // insert query

            const res = await request(app)
                .post('/api/users')
                .set('Authorization', adminToken)
                .send({ username: 'newUser', password: 'password1', role: 'user' });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('id', 4);
        });
    });

    describe('Car NoSQL CRUD (All Authenticated Users)', () => {
        test('GET /api/cars - Success with authenticated token', async () => {
            const mockCars = [{ _id: '123', marca: 'Ford', modelo: 'Mustang', ano: 2020, preco: 150000 }];
            Car.find.mockResolvedValueOnce(mockCars);

            const res = await request(app)
                .get('/api/cars')
                .set('Authorization', userToken);

            expect(res.statusCode).toBe(200);
            expect(res.body[0]).toHaveProperty('marca', 'Ford');
        });

        test('GET /api/cars - Denied if token is missing', async () => {
            const res = await request(app)
                .get('/api/cars');

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('erro');
        });

        test('POST /api/cars - Success', async () => {
            const carData = { marca: 'Ford', modelo: 'Mustang', ano: 2020, preco: 150000 };

            const res = await request(app)
                .post('/api/cars')
                .set('Authorization', userToken)
                .send(carData);

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('marca', 'Ford');
        });
    });

    describe('Moto NoSQL CRUD (All Authenticated Users)', () => {
        test('GET /api/motos - Success', async () => {
            const mockMotos = [{ _id: '456', marca: 'Honda', modelo: 'CB500', ano: 2022, preco: 35000, cilindrada: 500 }];
            Moto.find.mockResolvedValueOnce(mockMotos);

            const res = await request(app)
                .get('/api/motos')
                .set('Authorization', userToken);

            expect(res.statusCode).toBe(200);
            expect(res.body[0]).toHaveProperty('modelo', 'CB500');
        });

        test('POST /api/motos - Success', async () => {
            const motoData = { marca: 'Honda', modelo: 'CB500', ano: 2022, preco: 35000, cilindrada: 500 };

            const res = await request(app)
                .post('/api/motos')
                .set('Authorization', userToken)
                .send(motoData);

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('cilindrada', 500);
        });
    });

    describe('Clothing Brand NoSQL CRUD (All Authenticated Users)', () => {
        test('GET /api/clothing-brands - Success', async () => {
            const mockBrands = [{ _id: '789', nome: 'Zara', pais: 'Espanha', categoria: 'Moda' }];
            Brand.find.mockResolvedValueOnce(mockBrands);

            const res = await request(app)
                .get('/api/clothing-brands')
                .set('Authorization', userToken);

            expect(res.statusCode).toBe(200);
            expect(res.body[0]).toHaveProperty('nome', 'Zara');
        });

        test('POST /api/clothing-brands - Success', async () => {
            const brandData = { nome: 'Zara', pais: 'Espanha', categoria: 'Moda' };

            const res = await request(app)
                .post('/api/clothing-brands')
                .set('Authorization', userToken)
                .send(brandData);

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('nome', 'Zara');
        });
    });
});
