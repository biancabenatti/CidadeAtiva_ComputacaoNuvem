const { connectMongo } = require('./nao-relacional/mongo');
const { connectRelational } = require('./relacional');

module.exports = {
  connectMongo,
  connectRelational,
};
