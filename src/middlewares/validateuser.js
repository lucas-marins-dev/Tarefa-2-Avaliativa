function validateUser(req, res, next) {
    if (!req.body.nome) {
        return res.status(400).json({ erro: "Nome é Obrigatório" });
    }
    next();
}

module.exports = validateUser;