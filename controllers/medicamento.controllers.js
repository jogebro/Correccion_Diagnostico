const { MongoClient } = require('mongodb');
require('dotenv').config();

//base de datos mongo
const url = process.env.MONGO_URI;
const client = new MongoClient(url);
const bdname = 'farmaciaCampus';
//Conexion
client.connect();
const db = client.db(bdname);

//consultas
const get1Medicamentos50 = async (req, res) => {
  const collection = db.collection('Medicamentos');
  const findResult = await collection.find().toArray();
  res.json(findResult);
};

module.exports = {
  get1Medicamentos50,
};
