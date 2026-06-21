const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ erro: 'Token não fornecido ou formato inválido' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkeythatissecure12345');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ erro: 'Token inválido ou expirado' });
    }
}

function roleMiddleware(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ erro: 'Usuário não autenticado' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ erro: 'Acesso negado: permissões insuficientes' });
        }
        next();
    };
}

module.exports = { authMiddleware, roleMiddleware };
