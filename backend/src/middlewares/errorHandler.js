function errorHandler(err, req, res, next) {
    console.error('Unhandled Error:', err);
    const status = err.status || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'Erro interno do servidor'
        : err.message || 'Erro inesperado';

    res.status(status).json({ erro: message });
}

module.exports = errorHandler;
