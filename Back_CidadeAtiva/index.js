require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const { connectMongo } = require('./database');

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

// Rotas
const ocorrenciasRoutes = require('./routes/ocorrencias');
app.use('/api/ocorrencias', ocorrenciasRoutes);

app.get('/', (req, res) => {
    res.send('Servidor Cidade Ativa rodando!');
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectMongo();
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  } catch (error) {
    console.error('Falha ao iniciar servidor:', error.message);
    process.exit(1);
  }
}

startServer();