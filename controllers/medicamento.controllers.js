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
        $match:{
           stock: { $lt: 50 }
        } 
      },
      {
        $project : {
          proveedor: 0,
          _id: 0
        }
      }
    ]).toArray();
    res.json({
      stockMenor50: data
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
      provedores: data
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
          'proveedor.nombre': 'ProveedorA'
        } 
      }, 
      {
        $project : {
          proveedor: 0,
          _id: 0
        }
      }
    ]).toArray();

    res.json({
      comprasProveedorA: data
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
      { $match: {
        fechaVenta: { $gte: new Date('2023-01-02')} 
        } 
      },
      {
        $project : {
          _id: 0
        }
      }
    ]).toArray();
    res.json({
      ventasEmitidas: data
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
      medicamentosCaducados: data
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
      ventasTotales: data[0].total 
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
      medicamentosNoVendidos: data 
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
          $sort: { precio: -1 } 
        },
        { 
          $limit: 1 
        }
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
    const collection = await getCollection('Medicamentos')
    const data = await collection.find().toArray();

    let totales = [0,0,0]

    data.map((e)=>{
        if(e.proveedor.nombre == 'ProveedorA'){
            totales[0]++;
        }
        if(e.proveedor.nombre == 'ProveedorB'){
            totales[1]++
        }
        else if(e.proveedor.nombre == 'ProveedorC'){totales[2]++}
      })

    const totalMedProv = [
        {proveedorA: totales[0]},
        {proveedorB: totales[1]},
        {proveedorC: totales[2]},
    ]

    res.json({
        CantidadMedicamentos: totalMedProv
    })
  } catch (error) {
    res.status(500).json({ error: 'No funciona :C'})
  }
}

// 12. Pacientes que han comprado Paracetamol.
const getPacientesParacetamol = async (req, res) => {
  try {
    const collection = await getCollection('Ventas');
    const data = await collection
    .aggregate([
      {
        $unwind: "$medicamentosVendidos"
      },
      {
        $match: { "medicamentosVendidos.nombreMedicamento": "Paracetamol" }
      },
      {
        $project: {
          _id: 0
        }
      }
    ]).toArray();
    
    res.json({
      pacientesParacetamol: data
    })
  } catch (error) {
    res.status(500).json({ error: 'No funciona :C' });
  }
}

// 13. Proveedores que no han vendido medicamentos en el último año.
const getNoVendidoProvAño = async (req, res) => {
  try {
    const collection = await getCollection('Compras');
    const data = await collection.find({fechaCompra:{$lt: new Date("2023-01-01")}}).toArray();
    
    res.json({
      noVentasProveedores: data
    })
  } catch (error) {
    res.status(500).json({ error: 'No funciona :C' });
  }
}

// 14. Obtener el total de medicamentos vendidos en marzo de 2023.
const getMedVendidosMarzo = async (req, res) => {
  try {
    const collection = await getCollection('Ventas');
    const data = await collection.find({fechaVenta: {$gte: new Date('2023-03-01'), $lt: new Date('2023-04-01')}}).toArray()
    
    res.json({
      total: data.length, 
      medicamentos: data
    })
  } catch (error) {
    res.status(500).json({ error: 'No funciona :C' });
  }
}

// 15. Obtener el medicamento menos vendido en 2023.
const getMedMenosVendido = async (req, res) => {
  try {
    const collection = await getCollection('Ventas');
    const data = await collection.find({fechaVenta: {$gte: new Date('2023-01-01'), $lt: new Date('2024-01-01')}}).sort([["medicamentosVendidos.cantidadVendida", 1]]).limit(1).toArray();
    
    res.json({
      menosVendido2023: data
    })
  } catch (error) {
    res.status(500).json({ error: 'No funciona :C' });
  }
}

// 16. Ganancia total por proveedor en 2023 (asumiendo un campo precioCompra en Compras).
const getGananciaTotalProv = async (req, res)=>{
  try {
    const collection = await getCollection('Compras');
    const data = await collection.find().toArray();

    let total = [0, 0, 0]

    data.map((e)=>{
      if(e.proveedor.nombre == 'ProveedorA'){
        total[0] = total[0]+(e.medicamentosComprados[0].cantidadComprada*e.medicamentosComprados[0].precioCompra);
      }
      if(e.proveedor.nombre == 'ProveedorB'){
        total[1] = total[1]+(e.medicamentosComprados[0].cantidadComprada*e.medicamentosComprados[0].precioCompra);
      }
      else if(e.proveedor.nombre == 'ProveedorC'){
        total[2] = total[2]+(e.medicamentosComprados[0].cantidadComprada*e.medicamentosComprados[0].precioCompra);
      }
    })

    res.json({
      ganancias: [
        {"ProveedorA":total[0]},
        {"ProveedorB":total[1]},
        {"ProveedorC":total[2]}]
      });
  } catch (error) {
    res.status(500).json({ error: 'No funciona :C' });
  }
}

// 17. Promedio de medicamentos comprados por venta.
const getPromedioMedicamentos = async (req, res) => {
  try {
    const collection = await getCollection('Ventas');
    const data = await collection
    .aggregate([
      {
        $unwind: "$medicamentosVendidos"
      },
      {
        $group: {
          _id: 0,
          cantidad: {
            $sum: "$medicamentosVendidos.cantidadVendida"
          },
          price: {
            $sum: "$medicamentosVendidos.precio"
          }
        }
      },
      {
        $project: {
          _id: 0,
          promedioVentas: {
            $divide: [ "$price","$cantidad" ]
          }
        }
      }
    ]).toArray();

    res.json({
      promedio: data
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No funciona :C" });
  }
};

// 18. Cantidad de ventas realizadas por cada empleado en 2023.
const getVentasEmpleado = async (req, res) => {
  try {
    const collection = await getCollection('Ventas')
    const data = await collection
    .aggregate([
      {
        $unwind: "$medicamentosVendidos"
      },
      {
        $group:{
          _id: "$empleado.nombre",
          nombre: {
            $first: "$empleado.nombre"
          },
          total: {
            $sum: "$medicamentosVendidos.cantidadVendida"
          }
        }
      },
      {
        $project:{
          _id: 0,
        }
      }
    ]).toArray();
    

    res.json({
      ventasEmpleado: data
    });
  } catch (error) {
    res.status(500).json({ error: "No funciona :C" });
  }
}

// 19. Obtener todos los medicamentos que expiren en 2024.
const getMedicamentoExp = async (req,res)=>{
  try {
    const collection = await getCollection('Medicamentos');
    const data = await collection
    .aggregate([
      {
        $match:{fechaExpiracion: {$gte: new Date('2024-01-01')}}
      },
      {
        $project:{
          _id: 0,
          proveedor: 0
        }
      }
      ]).toArray()
    res.json({
      medicamentosExpiran2024: data
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errooooooor :(" });
  }
}

// 20. Empleados que hayan hecho más de 5 ventas en total.
const getEmpleadosMas5 = async (req,res)=>{
  try {
    const collection = await getCollection('Ventas')
    const data = await collection
    .aggregate([
      {
        $unwind: "$medicamentosVendidos"
      },
      {
        $group:{
          _id: "$empleado.nombre",
          total: {
            $sum: "$medicamentosVendidos.cantidadVendida"
          }
        }
      }
    ]).toArray();
    const data2 = []
    data.map(e=>{
      if(e.total > 5){
        data2.push({"empleado": e._id, "ventas": e.total})
      }
    })

    res.json({
      empleadosMas5Ventas: data2
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errooooooor :(" });
  }
}

module.exports = {
  getMedicamentosStock,                /* 1  */
  getProveedores,                      /* 2  */
  getProveedorA,                       /* 3  */
  getVentasAfter,                      /* 4  */
  getVentasParacetamol,                /* 5  */
  getMedicamentosCaducados,            /* 6  */
  getMedicamentosVproveedor,           /* 7  */
  getDineroVentas,                     /* 8  */
  getMedicamentosNoVendidos,           /* 9  */
  getMedicamentoCaro,                  /* 10 */
  getNroMedicamentosProveedor,         /* 11 */
  getPacientesParacetamol,             /* 12 */
  getNoVendidoProvAño,                 /* 13 */
  getMedVendidosMarzo,                 /* 14 */
  getMedMenosVendido,                  /* 15 */
  getGananciaTotalProv,                /* 16 */
  getPromedioMedicamentos,             /* 17 */
  getVentasEmpleado,                   /* 18 */
  getMedicamentoExp,                   /* 19 */
  getEmpleadosMas5,                    /* 20 */
};
