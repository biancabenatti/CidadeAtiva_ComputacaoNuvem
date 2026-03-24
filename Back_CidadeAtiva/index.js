require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const app = express();
app.use(cors());
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cidade Ativa API',
      version: '1.0.0',
      description: 'API para gerenciamento de ocorrências na cidade',
    },
    servers: [
      { url: 'http://localhost:5000' }
    ],
  },
  apis: ['./routes/*.js'], 
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado!'))
  .catch(err => console.log(err));

// Rotas
const ocorrenciasRoutes = require('./routes/ocorrencias');
app.use('/api/ocorrencias', ocorrenciasRoutes);

app.get('/', (req, res) => {
    res.send('Servidor Cidade Ativa rodando!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));