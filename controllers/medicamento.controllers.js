const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGO_URI);

async function getCollection(collectionName) {
  try {
    await client.connect();
    const database = client.db('farmaciaCampus');
    const collection = database.collection(collectionName);
    return collection;
  } catch (error) {
    console.log(error);
  }
}

const getMedicamentosStock = async (req, res) => {
  try {
    const collection = await getCollection('Medicamentos');
    const data = await collection.find({ stock: { $lt: 50 } }).toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'No funciona :C' });
  }
};

const getProveedores = async (req, res) => {
  try {
    const collection = await getCollection('Medicamentos');
    const data = await collection.find({}, { projection: { 'proveedor.nombre': 1, 'proveedor.contacto': 1, _id: 0 } }).toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'No funciona :C' });
  }
};

const getProveedorA = async (req, res) => {
  try {
    const collection = await getCollection('Medicamentos');
    const data = await collection.find({ 'proveedor.nombre': 'ProveedorA' }).toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'No funciona :C' });
  }
};

const getVentasAfter = async (req, res) => {
  try {
    const collection = await getCollection('Ventas');
    const data = await collection.find({ fechaVenta: { $gte: new Date('2023-01-02') } }).toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'No funciona :C' });
  }
};

const getVentasParacetamol = async (req, res) => {
  try {
    const collection = await getCollection('Ventas');
    const data = await collection.find({ 'medicamentosVendidos.nombreMedicamento': 'Paracetamol' }).toArray();

    let ventas = 0;
    data.forEach((data) => {
      data.medicamentosVendidos.forEach((medicamentoVendido) => {
        if (medicamentoVendido.nombreMedicamento === 'Paracetamol') {
          ventas += medicamentoVendido.cantidadVendida;
        }
      });
    });
    
    res.json({
      ventas,
      data,
    });
  } catch (error) {
    res.status(500).json({ error: 'No funciona :C' });
  }
};

module.exports = {
  getMedicamentosStock,
  getProveedores,
  getProveedorA,
  getVentasAfter,
  getVentasParacetamol,
};
