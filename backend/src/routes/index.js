const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const carController = require('../controllers/carController');
const motoController = require('../controllers/motoController');
const brandController = require('../controllers/brandController');

const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Registrar um novo usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 default: user
 *     responses:
 *       201:
 *         description: Criado com sucesso
 *       400:
 *         description: Parâmetros inválidos
 */
router.post('/auth/register', authController.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login de usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login com sucesso
 *       401:
 *         description: Credenciais incorretas
 */
router.post('/auth/login', authController.login);

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Listar todos os usuários (Admin apenas)
 *     tags: [Usuários SQL]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *   post:
 *     summary: Criar novo usuário (Admin apenas)
 *     tags: [Usuários SQL]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Criado com sucesso
 */
router.get('/users', authMiddleware, roleMiddleware(['admin']), userController.listUsers);
router.get('/users/:id', authMiddleware, roleMiddleware(['admin']), userController.getUser);
router.post('/users', authMiddleware, roleMiddleware(['admin']), userController.createUser);
router.put('/users/:id', authMiddleware, roleMiddleware(['admin']), userController.updateUser);
router.delete('/users/:id', authMiddleware, roleMiddleware(['admin']), userController.deleteUser);

/**
 * @openapi
 * /api/cars:
 *   get:
 *     summary: Listar todos os carros (Autenticado)
 *     tags: [Carros NoSQL]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sucesso
 *   post:
 *     summary: Criar novo carro (Autenticado)
 *     tags: [Carros NoSQL]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - marca
 *               - modelo
 *               - ano
 *               - preco
 *             properties:
 *               marca:
 *                 type: string
 *               modelo:
 *                 type: string
 *               ano:
 *                 type: number
 *               preco:
 *                 type: number
 *     responses:
 *       201:
 *         description: Criado
 */
router.get('/cars', authMiddleware, carController.listCars);
router.get('/cars/:id', authMiddleware, carController.getCar);
router.post('/cars', authMiddleware, carController.createCar);
router.put('/cars/:id', authMiddleware, carController.updateCar);
router.delete('/cars/:id', authMiddleware, carController.deleteCar);

/**
 * @openapi
 * /api/motos:
 *   get:
 *     summary: Listar todas as motos (Autenticado)
 *     tags: [Motos NoSQL]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sucesso
 *   post:
 *     summary: Criar nova moto (Autenticado)
 *     tags: [Motos NoSQL]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - marca
 *               - modelo
 *               - ano
 *               - preco
 *               - cilindrada
 *             properties:
 *               marca:
 *                 type: string
 *               modelo:
 *                 type: string
 *               ano:
 *                 type: number
 *               preco:
 *                 type: number
 *               cilindrada:
 *                 type: number
 *     responses:
 *       201:
 *         description: Criado
 */
router.get('/motos', authMiddleware, motoController.listMotos);
router.get('/motos/:id', authMiddleware, motoController.getMoto);
router.post('/motos', authMiddleware, motoController.createMoto);
router.put('/motos/:id', authMiddleware, motoController.updateMoto);
router.delete('/motos/:id', authMiddleware, motoController.deleteMoto);

/**
 * @openapi
 * /api/clothing-brands:
 *   get:
 *     summary: Listar todas as marcas de roupas (Autenticado)
 *     tags: [Roupas NoSQL]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sucesso
 *   post:
 *     summary: Criar nova marca de roupa (Autenticado)
 *     tags: [Roupas NoSQL]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - pais
 *               - categoria
 *             properties:
 *               nome:
 *                 type: string
 *               pais:
 *                 type: string
 *               categoria:
 *                 type: string
 *     responses:
 *       201:
 *         description: Criado
 */
router.get('/clothing-brands', authMiddleware, brandController.listBrands);
router.get('/clothing-brands/:id', authMiddleware, brandController.getBrand);
router.post('/clothing-brands', authMiddleware, brandController.createBrand);
router.put('/clothing-brands/:id', authMiddleware, brandController.updateBrand);
router.delete('/clothing-brands/:id', authMiddleware, brandController.deleteBrand);

module.exports = router;
