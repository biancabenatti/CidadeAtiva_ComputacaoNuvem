const mongoose = require('mongoose');

const ocorrenciaSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    localizacao: { type: String, required: true },
    descricao: { type: String, required: true },
    imagem: { type: String },
    criadoEm: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ocorrencia', ocorrenciaSchema);