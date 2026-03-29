const express = require('express');
const router = express.Router();

const carController = require("../controllers/carController");
const validateCar = require('../middlewares/validateuser'); // Renomear middleware se necessário

//GET Listar Todos
router.get('/cars', carController.listCars);

//GET Listar carros por ID (req.params)
router.get('/cars/:id', carController.getCar);

//POST - Criação de um carro
router.post('/cars', validateCar, carController.createCar);

//PUT - Atualizar carro
router.put('/cars/:id', carController.updateCar);

//DELETE
router.delete('/cars/:id', carController.deleteCar);

module.exports = router;