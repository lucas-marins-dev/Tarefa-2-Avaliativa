const User = require("../models/userModel");

//GET All Users
async function listUsers(req, res) {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
}
//GET User by ID
async function getUser(req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
}

//POST CreateUser
async function createUser(req, res) {
    try {
        const user = await User.create(req.body.nome);
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
}

//PUT UpdateUser
async function updateUser(req, res) {
    try {
        const user = await User.update(req.params.id, req.body.nome);
        res.json(user);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
}
//Delete User
async function deleteUser(req,res) {
    try {
        await User.delete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
}

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser };