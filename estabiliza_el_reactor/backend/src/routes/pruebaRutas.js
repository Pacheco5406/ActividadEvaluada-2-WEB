const express = require('express');
const router = express.Router();

const{
compararTemperatura,
reiniciarSistema
 } = require('../controller/pruebaControlador')

//Temperatura ingresa por el cliente
router.post('/adjust', compararTemperatura);

//Reiniciar sistema y generar nueva temperatura
router.post('/reboot', reiniciarSistema);

module.exports = router;