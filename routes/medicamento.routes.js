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
  getMedicNuncaVendido,
  getPacienteMasGasto,
  getEmpleadoNuncaVenta,
  getProvedorMasMedic,
  getPacCompraParacetamol,
  getMedicVendidosMes,
  getEmpleadosMenos5,
  getProvSuministraMedic,
  getProvMedicMenos50Stock,
  getPacienteNuncaCompro,
  getMedicamentosMes,
  getEmpleadoMayorCantidad,
  getTotalGastosPaciente,
  getMedicNoVendidos,
  getProveedoresMasCinco,
  getMedicamentosTrimestre,
  getEmpleadosNoVentasAbril,
  getMedicamentosMaxStock,
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
// 21):
router.get('/nunca-vendido', getMedicNuncaVendido);
// 22):
router.get('/paciente-max-gasto', getPacienteMasGasto);
// 23):
router.get('/empleado-nunca-venta', getEmpleadoNuncaVenta);
// 24):
router.get('/provedor-max', getProvedorMasMedic);
// 25):
router.get('/compra-paracetamol', getPacCompraParacetamol);
// 26):
router.get('/vendidos-mes', getMedicVendidosMes);
// 27):
router.get('/empleados-menos5', getEmpleadosMenos5);
// 28):
router.get('/suministra-medic', getProvSuministraMedic);
// 29):
router.get('/medic-menos50-stock', getProvMedicMenos50Stock);
// 30):
router.get('/nunca-compro', getPacienteNuncaCompro);
// 31):
router.get('/medicamentos-mes', getMedicamentosMes);
// 32):
router.get('/empleado-mayor-cantidad', getEmpleadoMayorCantidad);
// 33):
router.get('/total-gastos-paciente', getTotalGastosPaciente);
// 34):
router.get('/medic-no-vendidos', getMedicNoVendidos);
// 35):
router.get('/proveedores-mas-cinco', getProveedoresMasCinco);
// 36):
router.get('/medicamentos-trimestre', getMedicamentosTrimestre);
// 37):
router.get('/empleados-no-ventas-abril', getEmpleadosNoVentasAbril);
// 38):
router.get('/medicamentos-max-stock', getMedicamentosMaxStock);

module.exports = router;
