const { Router } = require('express');
const { getMedicamentos } = require('../controllers/medicamento.controllers.js');
const router = Router();

//Se aplica una ruta a cada uno con su respectiva funcion del controlador
router.get('/', (req, res) => {
  res.send('Get medicamentos');
});

module.exports = router;
