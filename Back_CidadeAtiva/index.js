require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const { connectMongo, connectRelational } = require('./database');

const app = express();
app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
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
const uploadRoutes = require('./routes/upload');
app.use('/api/ocorrencias', ocorrenciasRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
    res.send('Servidor Cidade Ativa rodando!');
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectMongo();
  } catch (error) {
    console.error('Falha ao conectar MongoDB:', error.message);
    process.exit(1);
  }

  try {
    await connectRelational();
  } catch (error) {
    console.warn('PostgreSQL indisponivel (imagens no Postgres desativadas):', error.message);
  }

  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
}

startServer();