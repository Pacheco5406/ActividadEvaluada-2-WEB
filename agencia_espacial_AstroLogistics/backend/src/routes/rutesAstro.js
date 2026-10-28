const express = require('express');
const router = express.Router();
const { 
    getCarga,
    getInventario,
    postCargaTemporal,
    putEditarCarga,
    deleteCarga,
    postReiniciarPartida,
    postConfirmarCarga,
    getTiempo
} = require('../controller/controladorAstro');

router.get('/inventario', getInventario);
router.get('/carga', getCarga);
router.post('/carga/agregar', postCargaTemporal);
router.put('/carga/actualizar-unidades/:id', putEditarCarga);
router.delete('/carga/eliminar/:id', deleteCarga);
router.post('/reiniciar', postReiniciarPartida);
router.post('/carga/confirmar', postConfirmarCarga);
router.get('/tiempo', getTiempo);

module.exports = router;
