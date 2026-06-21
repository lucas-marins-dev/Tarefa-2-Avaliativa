const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function register(req, res, next) {
    try {
        const { username, password, role } = req.body;
        if (!username || !password) {
            return res.status(400).json({ erro: 'Usuário e senha são obrigatórios' });
        }
        
        const existing = await User.findByUsername(username);
        if (existing) {
            return res.status(400).json({ erro: 'Nome de usuário já está em uso' });
        }
        
        // Prevent users from self-registering as admin
        const finalRole = role === 'admin' ? 'user' : (role || 'user');

        try {
            const user = await User.create({ username, password, role: finalRole });
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

async function login(req, res, next) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ erro: 'Usuário e senha são obrigatórios' });
        }

        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(401).json({ erro: 'Usuário ou senha incorretos' });
        }

        const matches = await bcrypt.compare(password, user.password);
        if (!matches) {
            return res.status(401).json({ erro: 'Usuário ou senha incorretos' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'supersecretjwtkeythatissecure12345',
            { expiresIn: '2h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { register, login };
