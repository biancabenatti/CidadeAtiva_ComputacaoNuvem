const mongoose = require('mongoose');

async function connectMongo() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('Variavel MONGO_URI nao definida no ambiente.');
  }

  await mongoose.connect(mongoUri);
  console.log('MongoDB conectado!');
}

module.exports = {
  connectMongo,
};
