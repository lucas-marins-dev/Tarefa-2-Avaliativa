const Car = require('../models/carModel');

async function listCars(req, res, next) {
    try {
        const cars = await Car.find({});
        res.json(cars);
    } catch (error) {
        next(error);
    }
}

async function getCar(req, res, next) {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ erro: 'Carro não encontrado' });
        }
        res.json(car);
    } catch (error) {
        next(error);
    }
}

async function createCar(req, res, next) {
    try {
        const { marca, modelo, ano, preco } = req.body;
        if (!marca || !modelo || !ano || !preco) {
            return res.status(400).json({ erro: 'Todos os campos (marca, modelo, ano, preco) são obrigatórios' });
        }

        const car = new Car({ marca, modelo, ano, preco });
        await car.save();
        res.status(201).json(car);
    } catch (error) {
        next(error);
    }
}

async function updateCar(req, res, next) {
    try {
        const { marca, modelo, ano, preco } = req.body;
        if (!marca || !modelo || !ano || !preco) {
            return res.status(400).json({ erro: 'Todos os campos (marca, modelo, ano, preco) são obrigatórios' });
        }

        const car = await Car.findByIdAndUpdate(
            req.params.id,
            { marca, modelo, ano, preco },
            { new: true, runValidators: true }
        );

        if (!car) {
            return res.status(404).json({ erro: 'Carro não encontrado' });
        }
        res.json(car);
    } catch (error) {
        next(error);
    }
}

async function deleteCar(req, res, next) {
    try {
        const car = await Car.findByIdAndDelete(req.params.id);
        if (!car) {
            return res.status(404).json({ erro: 'Carro não encontrado' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

module.exports = { listCars, getCar, createCar, updateCar, deleteCar };
