const Car = require("../models/carModel");

//GET All Cars
async function listCars(req, res) {
    const cars = await Car.find();
    res.json(cars);
}

//GET Car by ID
async function getCar(req, res) {
    const car = await Car.findById(req.params.id);

    if (!car) {
        return res.status(404).json({ erro: "Carro não encontrado" });
    }
    res.json(car);
}

//POST Create Car
async function createCar(req, res) {
    const car = new Car({
        marca: req.body.marca,
        modelo: req.body.modelo,
        ano: req.body.ano,
        preco: req.body.preco
    });
    await car.save();

    res.status(201).json(car);
}

//PUT Update Car
async function updateCar(req, res) {
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

    res.json(car);
}

//DELETE Car
async function deleteCar(req, res) {
    await Car.findByIdAndDelete(req.params.id);
    res.status(204).send();
}

module.exports = {
    listCars,
    getCar,
    createCar,
    updateCar,
    deleteCar
};