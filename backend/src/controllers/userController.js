const User = require('../models/userModel');

async function listUsers(req, res, next) {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        next(error);
    }
}

async function getUser(req, res, next) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }
        res.json(user);
    } catch (error) {
        next(error);
    }
}

async function createUser(req, res, next) {
    try {
        const { username, password, role } = req.body;
        if (!username || !password) {
            return res.status(400).json({ erro: 'Usuário e senha são obrigatórios' });
        }

        const existing = await User.findByUsername(username);
        if (existing) {
            return res.status(400).json({ erro: 'Nome de usuário já está em uso' });
        }

        try {
            const user = await User.create({ username, password, role });
            res.status(201).json(user);
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
                return res.status(400).json({ erro: 'Nome de usuário já está em uso' });
            }
            throw err;
        }
    } catch (error) {
        next(error);
    }
}

async function updateUser(req, res, next) {
    try {
        const { username, role, password } = req.body;
        if (!username) {
            return res.status(400).json({ erro: 'Nome de usuário é obrigatório' });
        }

        const existing = await User.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }

        try {
            const updated = await User.update(req.params.id, { username, role, password });
            res.json(updated);
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
                return res.status(400).json({ erro: 'Nome de usuário já está em uso' });
            }
            throw err;
        }
    } catch (error) {
        next(error);
    }
}

async function deleteUser(req, res, next) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }

        await User.delete(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser };
