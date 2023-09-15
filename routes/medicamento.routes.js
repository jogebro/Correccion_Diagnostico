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
  getMedicamentoCaro
} = require('../controllers/medicamento.controllers.js');
const router = Router();

router.get('/stock', getMedicamentosStock);
router.get('/proveedores', getProveedores);
router.get('/proveedores/a', getProveedorA);
router.get('/caducacion', getMedicamentosCaducados);

router.get('/ventas', getVentasAfter);
router.get('/ventas/paracetamol', getVentasParacetamol);
router.get('/ventas/proveedores', getMedicamentosVproveedor);
router.get('/ventas/total', getDineroVentas);
router.get('/ventas/no-vendidos', getMedicamentosNoVendidos);

router.get('/mas-caro', getMedicamentoCaro);

module.exports = router;
