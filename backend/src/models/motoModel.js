const mongoose = require('mongoose');

const motoSchema = new mongoose.Schema({
    marca: {
        type: String,
        required: true,
        trim: true
    },
    modelo: {
        type: String,
        required: true,
        trim: true
    },
    ano: {
        type: Number,
        required: true
    },
    preco: {
        type: Number,
        required: true
    },
    cilindrada: {
        type: Number,
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
});

const Moto = mongoose.model('Moto', motoSchema);

module.exports = Moto;
