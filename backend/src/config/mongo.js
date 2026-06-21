const mongoose = require('mongoose');

async function connectMongoDB() {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27019/loja_de_carros';
    try {
        await mongoose.connect(uri);
        console.log('MongoDB Conectado com sucesso');
    } catch (error) {
        console.error('Erro ao conectar ao MongoDB:', error.message);
        if (process.env.NODE_ENV !== 'test') {
            process.exit(1);
        }
    }
}

async function disconnectMongoDB() {
    try {
        await mongoose.connection.close();
    } catch (error) {
        console.error('Erro ao desconectar do MongoDB:', error.message);
    }
}

module.exports = { connectMongoDB, disconnectMongoDB };
