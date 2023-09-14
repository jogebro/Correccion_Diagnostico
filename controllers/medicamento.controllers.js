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
    const data = await collection.distinct('proveedor');
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

    data.forEach((elemento) => {
      ventas += elemento.medicamentosVendidos.reduce((total, medicamentoVendido) => total + medicamentoVendido.cantidadVendida, 0);
    });

    res.json({
      totalVentas: {
        paracetamol: ventas,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'No funciona :C' });
  }
};

const getMedicamentosCaducados = async (req, res) => {
  try {
    const collection = await getCollection('Medicamentos');
    const data = await collection.find({ fechaExpiracion: { $lt: new Date('2024-01-01') } }).toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'No funciona :C' });
  }
};

const getMedicamentosVproveedor = async (req, res) => {
  const collection = await getCollection('Compras');
  const data = await collection.find().toArray();
  let totales = [0, 0, 0];
  data.map((e) => {
    if (e.proveedor.nombre == 'ProveedorA') {
      totales[0] += e.medicamentosComprados[0].cantidadComprada;
    }
    if (e.proveedor.nombre == 'ProveedorB') {
      totales[1] += e.medicamentosComprados[0].cantidadComprada;
    }
    if (e.proveedor.nombre == 'ProveedorC') {
      totales[2] += e.medicamentosComprados[0].cantidadComprada;
    }
  });

  const dataComprasP = [
    { proveedorA: totales[0] }, 
    { proveedorB: totales[1] }, 
    { proveedorC: totales[2] }
  ];
  
  res.json({
    CantidadVendida: dataComprasP,
  });
};

module.exports = {
  getMedicamentosStock,
  getProveedores,
  getProveedorA,
  getVentasAfter,
  getVentasParacetamol,
  getMedicamentosCaducados,
  getMedicamentosVproveedor,
};
