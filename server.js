const app = require('./src/app');
const connectmongo = require('./src/config/mongo');
const mysqlPool = require('./src/config/mysql');

const PORT = 3000;

async function startServer() {
    try {
        // Conecta ao MongoDB
        await connectmongo();

        // Verifica conexão com MySQL e garante tabela
        await mysqlPool.query('CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, nome VARCHAR(255))');
        console.log("MySQL Conectado e Tabela 'users' verificada");

        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta: ${PORT}`);
        });
    } catch (error) {
        console.error("Erro ao iniciar o servidor:", error);
    }
}

startServer()