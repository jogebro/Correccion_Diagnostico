const { Router } = require('express');
const { get1Medicamentos50 } = require('../controllers/medicamento.controllers.js');
const router = Router();

//Se aplica una ruta a cada uno con su respectiva funcion del controlador
router.get('/', get1Medicamentos50);

module.exports = router;
