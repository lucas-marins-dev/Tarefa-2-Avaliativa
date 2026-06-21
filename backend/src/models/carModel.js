const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
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
    }
}, {
    timestamps: true,
    versionKey: false
});

const Car = mongoose.model('Car', carSchema);

module.exports = Car;
