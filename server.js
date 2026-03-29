const app = require('./src/app');
const connectmongo = require("./src/config/mongo");

const PORT = 3000;

async function startServer() {
    await connectmongo();

    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta: ${PORT}`);
    });
}

startServer()