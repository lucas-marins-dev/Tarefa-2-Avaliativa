const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true
    },
    pais: {
        type: String,
        required: true,
        trim: true
    },
    categoria: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true,
    versionKey: false
});

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand;
