const Car = require("../models/carModel");

//GET All Cars
async function listCars(req, res) {
    try {
        const cars = await Car.find();
        res.json(cars);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
}

//GET Car by ID
async function getCar(req, res) {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ erro: "Carro não encontrado" });
        }
        res.json(car);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
}

//POST Create Car
async function createCar(req, res) {
    try {
        const car = new Car({
            marca: req.body.marca,
            modelo: req.body.modelo,
            ano: req.body.ano,
            preco: req.body.preco
        });
        await car.save();
        res.status(201).json(car);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
}

//PUT Update Car
async function updateCar(req, res) {
    try {
        const car = await Car.findByIdAndUpdate(
            req.params.id,
            {
                marca: req.body.marca,
                modelo: req.body.modelo,
                ano: req.body.ano,
                preco: req.body.preco
            },
            { new: true }
        );
        if (!car) {
            return res.status(404).json({ erro: "Carro não encontrado" });
        }
        res.json(car);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
}

//DELETE Car
async function deleteCar(req, res) {
    try {
        const car = await Car.findByIdAndDelete(req.params.id);
        if (!car) {
            return res.status(404).json({ erro: "Carro não encontrado" });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
}

module.exports = {
    listCars,
    getCar,
    createCar,
    updateCar,
    deleteCar
};