const Moto = require('../models/motoModel');

async function listMotos(req, res, next) {
    try {
        const motos = await Moto.find({});
        res.json(motos);
    } catch (error) {
        next(error);
    }
}

async function getMoto(req, res, next) {
    try {
        const moto = await Moto.findById(req.params.id);
        if (!moto) {
            return res.status(404).json({ erro: 'Moto não encontrada' });
        }
        res.json(moto);
    } catch (error) {
        next(error);
    }
}

async function createMoto(req, res, next) {
    try {
        const { marca, modelo, ano, preco, cilindrada } = req.body;
        if (!marca || !modelo || !ano || !preco || !cilindrada) {
            return res.status(400).json({ erro: 'Todos os campos (marca, modelo, ano, preco, cilindrada) são obrigatórios' });
        }

        const moto = new Moto({ marca, modelo, ano, preco, cilindrada });
        await moto.save();
        res.status(201).json(moto);
    } catch (error) {
        next(error);
    }
}

async function updateMoto(req, res, next) {
    try {
        const { marca, modelo, ano, preco, cilindrada } = req.body;
        if (!marca || !modelo || !ano || !preco || !cilindrada) {
            return res.status(400).json({ erro: 'Todos os campos (marca, modelo, ano, preco, cilindrada) são obrigatórios' });
        }

        const moto = await Moto.findByIdAndUpdate(
            req.params.id,
            { marca, modelo, ano, preco, cilindrada },
            { new: true, runValidators: true }
        );

        if (!moto) {
            return res.status(404).json({ erro: 'Moto não encontrada' });
        }
        res.json(moto);
    } catch (error) {
        next(error);
    }
}

async function deleteMoto(req, res, next) {
    try {
        const moto = await Moto.findByIdAndDelete(req.params.id);
        if (!moto) {
            return res.status(404).json({ erro: 'Moto não encontrada' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

module.exports = { listMotos, getMoto, createMoto, updateMoto, deleteMoto };
