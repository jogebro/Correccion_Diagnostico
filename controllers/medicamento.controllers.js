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

// 1. Obtener todos los medicamentos con menos de 50 unidades en stock.
const getMedicamentosStock = async (req, res) => {
  try {
    const collection = await getCollection('Medicamentos');
    const data = await collection
      .aggregate([
        {
          $match: {
            stock: { $lt: 50 },
          },
        },
        {
          $project: {
            proveedor: 0,
            _id: 0,
          },
        },
      ])
      .toArray();
    res.json({
      stockMenor50: data,
    });
  } catch (error) {
    res.status(500).json({ error: 'No funciona :C' });
  }
};

// 2. Listar los proveedores con su información de contacto en medicamentos.
const getProveedores = async (req, res) => {
  try {
    const collection = await getCollection('Medicamentos');
    const data = await collection.distinct('proveedor');
    res.json({
      provedores: data,
    });
  } catch (error) {
    res.status(500).json({ error: 'No funciona :C' });
  }
};

// 3. Medicamentos comprados al ‘Proveedor A’.
const getProveedorA = async (req, res) => {
  try {
    const collection = await getCollection('Medicamentos');
    const data = await collection
      .aggregate([
        {
          $match: {
            'proveedor.nombre': 'ProveedorA',
          },
        },
        {
          $project: {
            proveedor: 0,
            _id: 0,
          },
        },
      ])
      .toArray();

    res.json({
      comprasProveedorA: data,
    });
  } catch (error) {
    res.status(500).json({ error: 'No funciona :C' });
  }
};

// 4. Obtener recetas médicas emitidas después del 1 de enero de 2023.
const getVentasAfter = async (req, res) => {
  try {
    const collection = await getCollection('Ventas');
    const data = await collection
      .aggregate([
        {
          $match: {
            fechaVenta: { $gte: new Date('2023-01-02') },
          },
        },
        {
          $project: {
            _id: 0,
          },
        },
      ])
      .toArray();
    res.json({
      ventasEmitidas: data,
    });
  } catch (error) {
    res.status(500).json({ error: 'No funciona :C' });
  }
};

// 5. Total de ventas del medicamento ‘Paracetamol’.
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

// 6. Medicamentos que caducan antes del 1 de enero de 2024.
const getMedicamentosCaducados = async (req, res) => {
  try {
    const collection = await getCollection('Medicamentos');
    const data = await collection.find({ fechaExpiracion: { $lt: new Date('2024-01-01') } }).toArray();
    res.json({
      medicamentosCaducados: data,
    });
  } catch (error) {
    res.status(500).json({ error: 'No funciona :C' });
  }
};

// 7. Total de medicamentos vendidos por cada proveedor.
const getMedicamentosVproveedor = async (req, res) => {
  try {
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

    const dataComprasP = [{ proveedorA: totales[0] }, { proveedorB: totales[1] }, { proveedorC: totales[2] }];

    res.json({
      CantidadVendida: dataComprasP,
    });
  } catch (error) {
    res.status(500).json({ error: 'No funciona :C' });
  }
};

// 8. Cantidad total de dinero recaudado por las ventas de medicamentos.
const getDineroVentas = async (req, res) => {
  try {
    const collection = await getCollection('Ventas');
    const data = await collection
      .aggregate([
        {
          $unwind: '$medicamentosVendidos',
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$medicamentosVendidos.precio' },
          },
        },
      ])
      .toArray();

    res.json({
      ventasTotales: data[0].total,
    });
  } catch (error) {
    res.status(500).json({ error: 'No funciona :C' });
  }
};

// 9. Medicamentos que no han sido vendidos.
const getMedicamentosNoVendidos = async (req, res) => {
  try {
    const collection = await getCollection('Medicamentos');
    const data = await collection
      .aggregate([
        {
          $lookup: {
            from: 'Ventas',
            localField: 'nombre',
            foreignField: 'medicamentosVendidos.nombreMedicamento',
            as: 'diferencia',
          },
        },
        {
          $match: {
            diferencia: [],
          },
        },
      ])
      .toArray();

    res.json({
      medicamentosNoVendidos: data,
    });
  } catch (error) {
    res.status(500).json({ error: 'No funciona :C' });
  }
};

// 10. Obtener el medicamento más caro.
const getMedicamentoCaro = async (req, res) => {
  try {
    const collection = await getCollection('Medicamentos');
    const data = await collection
      .aggregate([
        {
          $sort: { precio: -1 },
        },
        {
          $limit: 1,
        },
      ])
      .toArray();

    res.json({
      medicamentoMasCaro: data,
    });
  } catch (error) {
    res.status(500).json({ error: 'No funciona :C' });
  }
};

// 11. Número de medicamentos por proveedor.
const getNroMedicamentosProveedor = async (req, res) => {
  try {
    const collection = await getCollection('Medicamentos');
    const data = await collection.find().toArray();

    let totales = [0, 0, 0];

    data.map((e) => {
      if (e.proveedor.nombre == 'ProveedorA') {
        totales[0]++;
      }
      if (e.proveedor.nombre == 'ProveedorB') {
        totales[1]++;
      } else if (e.proveedor.nombre == 'ProveedorC') {
        totales[2]++;
      }
    });

    const totalMedProv = [{ proveedorA: totales[0] }, { proveedorB: totales[1] }, { proveedorC: totales[2] }];

    res.json({
      CantidadMedicamentos: totalMedProv,
    });
  } catch (error) {
    res.status(500).json({ error: 'No funciona :C' });
  }
};

// 12. Pacientes que han comprado Paracetamol.
const getPacientesParacetamol = async (req, res) => {
  try {
    const collection = await getCollection('Ventas');
    const data = await collection
      .aggregate([
        {
          $unwind: '$medicamentosVendidos',
        },
        {
          $match: { 'medicamentosVendidos.nombreMedicamento': 'Paracetamol' },
        },
        {
          $project: {
            _id: 0,
          },
        },
      ])
      .toArray();

    res.json({
      pacientesParacetamol: data,
    });
  } catch (error) {
    res.status(500).json({ error: 'No funciona :C' });
  }
};

// 13. Proveedores que no han vendido medicamentos en el último año.
const getNoVendidoProvAño = async (req, res) => {
  try {
    const collection = await getCollection('Compras');
    const data = await collection.find({ fechaCompra: { $lt: new Date('2023-01-01') } }).toArray();

    res.json({
      noVentasProveedores: data,
    });
  } catch (error) {
    res.status(500).json({ error: 'No funciona :C' });
  }
};

// 14. Obtener el total de medicamentos vendidos en marzo de 2023.
const getMedVendidosMarzo = async (req, res) => {
  try {
    const collection = await getCollection('Ventas');
    const data = await collection.find({ fechaVenta: { $gte: new Date('2023-03-01'), $lt: new Date('2023-04-01') } }).toArray();

    res.json({
      total: data.length,
      medicamentos: data,
    });
  } catch (error) {
    res.status(500).json({ error: 'No funciona :C' });
  }
};

// 15. Obtener el medicamento menos vendido en 2023.
const getMedMenosVendido = async (req, res) => {
  try {
    const collection = await getCollection('Ventas');
    const data = await collection
      .find({ fechaVenta: { $gte: new Date('2023-01-01'), $lt: new Date('2024-01-01') } })
      .sort([['medicamentosVendidos.cantidadVendida', 1]])
      .limit(1)
      .toArray();

    res.json({
      menosVendido2023: data,
    });
  } catch (error) {
    res.status(500).json({ error: 'No funciona :C' });
  }
};

// 16. Ganancia total por proveedor en 2023 (asumiendo un campo precioCompra en Compras).
const getGananciaTotalProv = async (req, res) => {
  try {
    const collection = await getCollection('Compras');
    const data = await collection.find().toArray();

    let total = [0, 0, 0];

    data.map((e) => {
      if (e.proveedor.nombre == 'ProveedorA') {
        total[0] = total[0] + e.medicamentosComprados[0].cantidadComprada * e.medicamentosComprados[0].precioCompra;
      }
      if (e.proveedor.nombre == 'ProveedorB') {
        total[1] = total[1] + e.medicamentosComprados[0].cantidadComprada * e.medicamentosComprados[0].precioCompra;
      } else if (e.proveedor.nombre == 'ProveedorC') {
        total[2] = total[2] + e.medicamentosComprados[0].cantidadComprada * e.medicamentosComprados[0].precioCompra;
      }
    });

    res.json({
      ganancias: [{ ProveedorA: total[0] }, { ProveedorB: total[1] }, { ProveedorC: total[2] }],
    });
  } catch (error) {
    res.status(500).json({ error: 'No funciona :C' });
  }
};

// 17. Promedio de medicamentos comprados por venta.
const getPromedioMedicamentos = async (req, res) => {
  try {
    const collection = await getCollection('Ventas');
    const data = await collection
      .aggregate([
        {
          $unwind: '$medicamentosVendidos',
        },
        {
          $group: {
            _id: 0,
            cantidad: {
              $sum: '$medicamentosVendidos.cantidadVendida',
            },
            price: {
              $sum: '$medicamentosVendidos.precio',
            },
          },
        },
        {
          $project: {
            _id: 0,
            promedioVentas: {
              $divide: ['$price', '$cantidad'],
            },
          },
        },
      ])
      .toArray();

    res.json({
      promedio: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No funciona :C' });
  }
};

// 18. Cantidad de ventas realizadas por cada empleado en 2023.
const getVentasEmpleado = async (req, res) => {
  try {
    const collection = await getCollection('Ventas');
    const data = await collection
      .aggregate([
        {
          $unwind: '$medicamentosVendidos',
        },
        {
          $group: {
            _id: '$empleado.nombre',
            nombre: {
              $first: '$empleado.nombre',
            },
            total: {
              $sum: '$medicamentosVendidos.cantidadVendida',
            },
          },
        },
        {
          $project: {
            _id: 0,
          },
        },
      ])
      .toArray();

    res.json({
      ventasEmpleado: data,
    });
  } catch (error) {
    res.status(500).json({ error: 'No funciona :C' });
  }
};

// 19. Obtener todos los medicamentos que expiren en 2024.
const getMedicamentoExp = async (req, res) => {
  try {
    const collection = await getCollection('Medicamentos');
    const data = await collection
      .aggregate([
        {
          $match: { fechaExpiracion: { $gte: new Date('2024-01-01') } },
        },
        {
          $project: {
            _id: 0,
            proveedor: 0,
          },
        },
      ])
      .toArray();

    res.json({
      medicamentosExpiran2024: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errooooooor :(' });
  }
};

// 20. Empleados que hayan hecho más de 5 ventas en total.
const getEmpleadosMas5 = async (req, res) => {
  try {
    const collection = await getCollection('Ventas');
    const data = await collection
      .aggregate([
        {
          $unwind: '$medicamentosVendidos',
        },
        {
          $group: {
            _id: '$empleado.nombre',
            total: {
              $sum: '$medicamentosVendidos.cantidadVendida',
            },
          },
        },
      ])
      .toArray();
    const data2 = [];
    data.map((e) => {
      if (e.total > 5) {
        data2.push({ empleado: e._id, ventas: e.total });
      }
    });

    res.json({
      empleadosMas5Ventas: data2,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errooooooor :(' });
  }
};

// 21. Medicamentos que no han sido vendidos nunca.
const getMedicNuncaVendido = async (req, res) => {
  try {
    const collection = await getCollection("Medicamentos");
    const data = await collection
      .aggregate([
        {
          $lookup: {
            from: "Ventas",
            localField: "nombre",
            foreignField: "medicamentosVendidos.nombreMedicamento",
            as: "noVendidos",
          },
        },
        {
          $match: { noVendidos: [] },
        },
      ])
      .toArray();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errooooooor :(" });
  }
};

// 22. Paciente que ha gastado más dinero en 2023.
const getPacienteMasGasto = async (req, res) => {
  try {
    const collection = await getCollection("Ventas");
    const data = await collection
      .aggregate([
        { $unwind: "$medicamentosVendidos" },
        {
          $match: {
            fechaVenta: {
              $gte: new Date("2023-01-01"),
              $lt: new Date("2024-01-01"),
            },
          },
        },
        {
          $group: {
            _id: "$paciente.nombre",
            total: {
              $sum: {
                $multiply: [
                  "$medicamentosVendidos.cantidadVendida",
                  "$medicamentosVendidos.precio",
                ], // multiplica
              },
            },
          },
        },
        { $sort: { total: -1 } },
      ])
      .limit(1)
      .toArray();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errooooooor :(" });
  }
};

// 23. Empleados que no han realizado ninguna venta en 2023.
const getEmpleadoNuncaVenta = async (req, res) => {
  try {
    const collection = await getCollection("Empleados");
    const data = await collection
      .aggregate([
        {
          $lookup: {
            from: "Ventas",
            localField: "nombre",
            foreignField: "empleado.nombre",
            as: "ventas",
          },
        },
        {
          $match: { ventas: [] },
        },
      ])
      .toArray();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errooooooor :(" });
  }
};

// 24. Proveedor que ha suministrado más medicamentos en 2023.
const getProvedorMasMedic = async (req, res) => {
  try {
    const collection = await getCollection("Proveedores");
    const data = await collection
      .aggregate([
        {
          $lookup: {
            from: "Compras",
            localField: "nombre",
            foreignField: "proveedor.nombre",
            as: "provee",
          },
        },
        {
          $unwind: "$provee",
        },
        {
          $unwind: "$provee.medicamentosComprados",
        },
        {
          $match: {
            "provee.fechaCompra": {
              $gte: new Date("2023-01-01"),
              $lt: new Date("2024-01-01"),
            },
          },
        },
        {
          $group: {
            _id: "$_id",
            nombre: { $first: "$nombre" },
            direccion: { $first: "$direccion" },
            totalCantidadComprada: {
              $sum: "$provee.medicamentosComprados.cantidadComprada",
            },
          },
        },
        {
          $sort: { totalCantidadComprada: -1 },
        },
      ])
      .limit(1)
      .toArray();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errooooooor :(" });
  }
};

// 25. Pacientes que compraron el medicamento “Paracetamol” en 2023.
const getPacCompraParacetamol = async (req, res) => {
  try {
    const collection = await getCollection("Ventas");
    const data = await collection
      .aggregate([
        {
          $unwind: "$medicamentosVendidos",
        },
        {
          $match: {
            fechaVenta: {
              $gte: new Date("2023-01-01"),
              $lt: new Date("2024-01-01"),
            },
          },
        },
        {
          $match: { "medicamentosVendidos.nombreMedicamento": "Paracetamol" }, // filtra
        },
      ])
      .toArray();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errooooooor :(" });
  }
};

// 26. Total de medicamentos vendidos por mes en 2023.
const getMedicVendidosMes = async (req, res) => {
  try {
    const collection = await getCollection("Ventas");
    const data = await collection
      .aggregate([
        {
          $project: {
            mesVenta: { $month: "$fechaVenta" },
          },
        },
        {
          $group: {
            _id: "$mesVenta",
            totalVentas: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray();
    res.json(data);
  } catch (error) {}
};


// 27. Empleados con menos de 5 ventas en 2023.
const getEmpleadosMenos5 = async (req, res) => {
  try {
    const collection = await getCollection("Empleados");
    const data = await collection
      .aggregate([
        {
          $lookup: {
            from: "Ventas",
            localField: "nombre",
            foreignField: "empleado.nombre",
            as: "ventas",
          },
        },
        {
          $project: {
            nombre: 1,
            cantidadVentas: { $size: "$ventas" },
          },
        },
        {
          $match: {
            cantidadVentas: { $lt: 5 },
          },
        },
      ])
      .toArray();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errooooooor :(" });
  }
};

// 28. Número total de proveedores que suministraron medicamentos en 2023.
const getProvSuministraMedic = async (req, res) => {
  try {
    const collection = await getCollection("Medicamentos");
    const data = await collection.distinct("proveedor.nombre");
    res.json({ TotalProveedores: data.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errooooooor :(" });
  }
};


// 29. Proveedores de los medicamentos con menos de 50 unidades en stock.
const getProvMedicMenos50Stock = async (req, res) => {
  try {
    const collection = await getCollection("Medicamentos");
    const data = await collection
      .aggregate([
        {
          $match: {
            stock: { $lt: 50 },
          },
        },
        {
          $group: {
            _id: "$proveedor.nombre",
          },
        },
        {
          $project: {
            _id: 0,
            nombreProveedor: "$_id",
          },
        },
      ])
      .toArray();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errooooooor :(" });
  }
};

// 30. Pacientes que no han comprado ningún medicamento en 2023.
const getPacienteNuncaCompro = async (req, res) => {
  try {
    const collection = await getCollection("Pacientes");
    const data = await collection
      .aggregate([
        {
          $lookup: {
            from: "Ventas",
            localField: "nombre",
            foreignField: "paciente.nombre",
            as: "ventas",
          },
        },
        {
          $match: {
            ventas: { $size: 0 },
          },
        },
      ])
      .toArray();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errooooooor :(" });
  }
};

// 31. Medicamentos que han sido vendidos cada mes del año 2023.
const getMedicamentosMes = async (req, res) => {
  try {
    const coleccion = await getCollection("Ventas");
    const Resultado = await coleccion
      .aggregate([
        {
          $project: {
            mesVenta: { $month: "$fechaVenta" },
          },
        },
        {
          $group: {
            _id: "$mesVenta",
            totalVentas: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            mes: "$_id",
            totalVentas: 1,
          },
        },
        {
          $sort: { mes: 1 },
        },
      ])
      .toArray();
    res.json(Resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errooooooor :(" });
  }
};

// 32. Empleado que ha vendido la mayor cantidad de medicamentos distintos en 2023.
const getEmpleadoMayorCantidad = async (req, res) => {
  try {
    const coleccion = await getCollection("Ventas");
    const Resultado = await coleccion
      .aggregate([
        {
          $match: {
            fechaVenta: {
              $gte: new Date("2023-01-01T00:00:00.000Z"),
              $lt: new Date("2024-01-01T00:00:00.000Z"),
            },
          },
        },
        {
          $unwind: "$medicamentosVendidos",
        },
        {
          $group: {
            _id: {
              empleado: "$empleado.nombre",
              medicamento: "$medicamentosVendidos.nombreMedicamento",
            },
          },
        },
        {
          $group: {
            _id: "$_id.empleado",
            totalMedicamentos: { $sum: 1 },
          },
        },
        {
          $sort: { totalMedicamentos: -1 },
        },
        {
          $limit: 1,
        },
        {
          $project: {
            _id: 0,
            empleado: "$_id",
            totalMedicamentos: 1,
          },
        },
      ])
      .toArray();
    res.json(Resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errooooooor :(" });
  }
};

// 33. Total gastado por cada paciente en 2023.
const getTotalGastosPaciente = async (req, res) => {
  try {
    const coleccion = await getCollection("Ventas");
    const Resultado = await coleccion
      .aggregate([
        {
          $project: {
            mesVenta: { $month: "$fechaVenta" },
          },
        },
        {
          $group: {
            _id: "$mesVenta",
            totalVentas: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray();
    res.json(Resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errooooooor :(" });
  }
};

// 34. Medicamentos que no han sido vendidos en 2023.
const getMedicNoVendidos = async (req, res) => {
  try {
    const collection = await getCollection("Medicamentos");
    const data = await collection
      .aggregate([
        {
          $lookup: {
            from: "Ventas",
            localField: "nombre",
            foreignField: "medicamentosVendidos.nombreMedicamento",
            as: "ventas",
          },
        },
        {
          $match: {
            ventas: { $eq: [] },
            fechaVenta: {
              $gte: new Date("2023-01-01T00:00:00.000Z"),
              $lt: new Date("2023-04-01T00:00:00.000Z"),
            },
          },
        },
      ])
      .toArray();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errooooooor :(" });
  }
};

// 35. Proveedores que han suministrado al menos 5 medicamentos diferentes en 2023.
const getProveedoresMasCinco = async (req, res) => {
  try {
    const collection = await getCollection("Compras");
    const data = await collection
      .aggregate([
        {
          $match: {
            fechaCompra: {
              $gte: new Date("2023-01-01T00:00:00.000Z"),
              $lt: new Date("2024-01-01T00:00:00.000Z"),
            },
          },
        },
        {
          $unwind: "$medicamentosComprados",
        },
        {
          $group: {
            _id: {
              proveedor: "$proveedor.nombre",
              producto: "$medicamentosComprados.nombreMedicamento",
            },
          },
        },
        {
          $group: {
            _id: "$_id.proveedor",
            totalProductos: { $sum: 1 },
          },
        },
        {
          $match: {
            totalProductos: { $gte: 5 },
          },
        },
        {
          $project: {
            _id: 0,
            proveedor: "$_id",
          },
        },
      ])
      .toArray();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "f" });
  }
};

// 36. Total de medicamentos vendidos en el primer trimestre de 2023.
const getMedicamentosTrimestre = async (req, res) => {
  try {
    const collection = await getCollection("Ventas");
    const data = await collection
      .aggregate([
        {
          $match: {
            fechaVenta: {
              $gte: new Date("2023-01-01T00:00:00.000Z"),
              $lt: new Date("2023-04-01T00:00:00.000Z"),
            },
          },
        },
        {
          $unwind: "$medicamentosVendidos",
        },
        {
          $group: {
            _id: null,
            totalMedicamentosTrimestre: {
              $sum: "$medicamentosVendidos.cantidadVendida",
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalMedicamentosTrimestre: 1,
          },
        },
      ])
      .toArray();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "f" });
  }
};

// 37. Empleados que no realizaron ventas en abril de 2023.
const getEmpleadosNoVentasAbril = async (req, res) => {
  try {
    const collection = await getCollection("Empleados");
    const data = await collection
      .aggregate([
        {
          $lookup: {
            from: "Ventas",
            localField: "nombre",
            foreignField: "empleado.nombre",
            as: "ventas",
          },
        },
        {
          $addFields: {
            ventasEnAbril: {
              $filter: {
                input: "$ventas",
                as: "venta",
                cond: {
                  $and: [
                    {
                      $gte: [
                        "$$venta.fechaVenta",
                        new Date("2023-04-01T00:00:00.000Z"),
                      ],
                    },
                    {
                      $lt: [
                        "$$venta.fechaVenta",
                        new Date("2023-05-01T00:00:00.000Z"),
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
        {
          $match: {
            ventasEnAbril: { $size: 0 },
          },
        },
        {
          $project: {
            _id: 0,
            nombre: 1,
          },
        },
      ])
      .toArray();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "f" });
  }
};

// 38. Medicamentos con un precio mayor a 50 y un stock menor a 100.
const getMedicamentosMaxStock = async (req, res) => {
  try {
    const coleccion = await getCollection("Medicamentos");
    const Resultado = await coleccion
      .find({ precio: { $gt: 50 }, stock: { $lt: 100 } })
      .toArray();
    res.json(Resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errooooooor :(" });
  }
};

module.exports = {
  /* 1  */ getMedicamentosStock,
  /* 2  */ getProveedores,
  /* 3  */ getProveedorA,
  /* 4  */ getVentasAfter,
  /* 5  */ getVentasParacetamol,
  /* 6  */ getMedicamentosCaducados,
  /* 7  */ getMedicamentosVproveedor,
  /* 8  */ getDineroVentas,
  /* 9  */ getMedicamentosNoVendidos,
  /* 10 */ getMedicamentoCaro,
  /* 11 */ getNroMedicamentosProveedor,
  /* 12 */ getPacientesParacetamol,
  /* 13 */ getNoVendidoProvAño,
  /* 14 */ getMedVendidosMarzo,
  /* 15 */ getMedMenosVendido,
  /* 16 */ getGananciaTotalProv,
  /* 17 */ getPromedioMedicamentos,
  /* 18 */ getVentasEmpleado,
  /* 19 */ getMedicamentoExp,
  /* 20 */ getEmpleadosMas5,
  /* 21 */ getMedicNuncaVendido,
  /* 22 */ getPacienteMasGasto,
  /* 23 */ getEmpleadoNuncaVenta,
  /* 24 */ getProvedorMasMedic,
  /* 25 */ getPacCompraParacetamol,
  /* 26 */ getMedicVendidosMes,
  /* 27 */ getEmpleadosMenos5,
  /* 28 */ getProvSuministraMedic,
  /* 29 */ getProvMedicMenos50Stock,
  /* 30 */ getPacienteNuncaCompro,
  /* 31 */ getMedicamentosMes,
  /* 32 */ getEmpleadoMayorCantidad,
  /* 33 */ getTotalGastosPaciente,
  /* 34 */ getMedicNoVendidos,
  /* 35 */ getProveedoresMasCinco,
  /* 36 */ getMedicamentosTrimestre,
  /* 37 */ getEmpleadosNoVentasAbril,
  /* 38 */ getMedicamentosMaxStock,
};
