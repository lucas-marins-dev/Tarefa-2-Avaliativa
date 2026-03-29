const User = require("../models/userModel");

//GET All Users
async function listUsers(req, res) {
    const users = await User.find();
    res.json(users);
}
//GET User by ID
async function getUser(req, res) {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({ erro: "Usuário não encontrado" });
    }
    res.json(user);
}

//POST CreateUser

async function createUser(req, res) {
    const user = new User({
        nome: req.body.nome
    });
    await user.save();

    res.status(201).json(user);
}

//PUT UpdateUser

async function updateUser(req, res) {
    const user = await User.findByIdAndUpdate(
        req.params.id,
        { nome: req.body.nome },
        { new: true }
    );
    
    res.json(user);
}
//Delete User

async function deleteUser(req,res) {
    await User.findByIdAndDelete(req.params.id);

    res.status(204).send();
}

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser };