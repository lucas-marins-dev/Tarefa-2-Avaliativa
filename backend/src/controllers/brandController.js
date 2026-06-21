const Brand = require('../models/brandModel');

async function listBrands(req, res, next) {
    try {
        const brands = await Brand.find({});
        res.json(brands);
    } catch (error) {
        next(error);
    }
}

async function getBrand(req, res, next) {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ erro: 'Marca de roupa não encontrada' });
        }
        res.json(brand);
    } catch (error) {
        next(error);
    }
}

async function createBrand(req, res, next) {
    try {
        const { nome, pais, categoria } = req.body;
        if (!nome || !pais || !categoria) {
            return res.status(400).json({ erro: 'Todos os campos (nome, pais, categoria) são obrigatórios' });
        }

        const brand = new Brand({ nome, pais, categoria });
        await brand.save();
        res.status(201).json(brand);
    } catch (error) {
        next(error);
    }
}

async function updateBrand(req, res, next) {
    try {
        const { nome, pais, categoria } = req.body;
        if (!nome || !pais || !categoria) {
            return res.status(400).json({ erro: 'Todos os campos (nome, pais, categoria) são obrigatórios' });
        }

        const brand = await Brand.findByIdAndUpdate(
            req.params.id,
            { nome, pais, categoria },
            { new: true, runValidators: true }
        );

        if (!brand) {
            return res.status(404).json({ erro: 'Marca de roupa não encontrada' });
        }
        res.json(brand);
    } catch (error) {
        next(error);
    }
}

async function deleteBrand(req, res, next) {
    try {
        const brand = await Brand.findByIdAndDelete(req.params.id);
        if (!brand) {
            return res.status(404).json({ erro: 'Marca de roupa não encontrada' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

module.exports = { listBrands, getBrand, createBrand, updateBrand, deleteBrand };
