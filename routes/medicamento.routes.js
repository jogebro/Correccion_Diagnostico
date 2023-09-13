const { Router } = require('express');
const { getMedicamentosStock, getProveedores, getProveedorA, getVentasAfter, getVentasParacetamol } = require('../controllers/medicamento.controllers.js');
const router = Router();

//Se aplica una ruta a cada uno con su respectiva funcion del controlador
router.get('/stock', getMedicamentosStock);
router.get('/proveedores', getProveedores);
router.get('/proveedores/a', getProveedorA);

router.get('/ventas', getVentasAfter);
router.get('/ventas/paracetamol', getVentasParacetamol);

module.exports = router;