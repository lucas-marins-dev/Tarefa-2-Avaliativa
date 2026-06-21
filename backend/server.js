require('dotenv').config();
const app = require('./src/app');
const { connectMongoDB } = require('./src/config/mongo');
const User = require('./src/models/userModel');

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Connect to NoSQL Database
        await connectMongoDB();

        // Connect to SQL Database, verify schema and seed admin
        await User.init();
        console.log('Banco de dados Relacional Inicializado com Sucesso.');

        app.listen(PORT, () => {
            console.log(`Servidor rodando em http://localhost:${PORT}`);
            console.log(`Swagger Docs disponíveis em http://localhost:${PORT}/api-docs`);
        });
    } catch (error) {
        console.error('Falha crítica ao iniciar servidor:', error);
        process.exit(1);
    }
}

startServer();
