const express = require('express');
const router = express.Router();

const carController = require("../controllers/carController");
const userController = require("../controllers/userController");
const validateUser = require('../middlewares/validateuser');

// Car Routes (MongoDB)
router.get('/cars', carController.listCars);
router.get('/cars/:id', carController.getCar);
router.post('/cars', carController.createCar);
router.put('/cars/:id', carController.updateCar);
router.delete('/cars/:id', carController.deleteCar);

// User Routes (MySQL)
router.get('/users', userController.listUsers);
router.get('/users/:id', userController.getUser);
router.post('/users', validateUser, userController.createUser);
router.put('/users/:id', validateUser, userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

module.exports = router;