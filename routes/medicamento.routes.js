const { Router } = require('express');
const {
  getMedicamentosStock,
  getProveedores,
  getProveedorA,
  getVentasAfter,
  getVentasParacetamol,
  getMedicamentosCaducados,
  getMedicamentosVproveedor,
  getDineroVentas,
  getMedicamentosNoVendidos,
  getMedicamentoCaro,
  getNroMedicamentosProveedor,
  getPacientesParacetamol,
  getNoVendidoProvAño,
  getMedVendidosMarzo,
  getMedMenosVendido,
  getGananciaTotalProv,
  getPromedioMedicamentos,
  getVentasEmpleado,
  getMedicamentoExp,
  getEmpleadosMas5,
} = require('../controllers/medicamento.controllers.js');
const router = Router();

// 1):
router.get('/stock', getMedicamentosStock);
// 2):
router.get('/proveedores', getProveedores);
// 3):
router.get('/proveedorA', getProveedorA);
// 4):
router.get('/ventas', getVentasAfter);
// 5):
router.get('/ventas-paracetamol', getVentasParacetamol);
// 6):
router.get('/caducacion', getMedicamentosCaducados);
// 7):
router.get('/total-proveedor', getMedicamentosVproveedor);
// 8):
router.get('/total-ventas', getDineroVentas);
// 9):
router.get('/no-vendidos', getMedicamentosNoVendidos);
// 10):
router.get('/mas-caro', getMedicamentoCaro);
// 11):
router.get('/x-proveedor', getNroMedicamentosProveedor);
// 12):
router.get('/paciente-paracetamol', getPacientesParacetamol);
// 13):
router.get('/prov-no-vendido', getNoVendidoProvAño);
// 14):
router.get('/venta-marzo', getMedVendidosMarzo);
// 15):
router.get('/menos-vendido', getMedMenosVendido);
// 16):
router.get('/ganancia-total', getGananciaTotalProv);
// 17):
router.get('/venta-promedio', getPromedioMedicamentos);
// 18):
router.get('/venta-empleado', getVentasEmpleado);
// 19):
router.get('/expiran', getMedicamentoExp);
// 20):
router.get('/empleados-max5', getEmpleadosMas5);

module.exports = router;
