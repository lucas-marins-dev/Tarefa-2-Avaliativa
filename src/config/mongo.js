const mongoose = require("mongoose");

async function connectionMongoDB() {
    try {
        await mongoose.connect('mongodb://localhost:27019/loja_de_carros')
        console.log("MongoDB Conectado");
        console.log(mongoose.connection.client.s.url);
    } catch (error) {
        console.error(error);
    }
}

module.exports = connectionMongoDB;