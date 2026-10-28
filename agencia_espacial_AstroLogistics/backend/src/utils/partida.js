//Aqui dejamos la parte de nuevas partidas
const {listaInventario, presupuestoCapitan} = require('../data/dataAstro');
const {relojTemporal, compararTiempoAcabado} = require('../utils/temporizador');


//creamos la base de las partidas
let partidaDelMomento = {
    creditosDisponibles: 0,
    presupuestoInicial: 0,
    inventarioDelDia: [],
    cargaActual: [],
    confirmada: false,
    tiempoParaAcabar: 0
};

function nuevaPartida () {
    //Primero elegimos un inventario y presupuesto al azar usando math.randon
    const inventarioPartida = Math.floor(Math.random() * listaInventario.length);
    const presupuestoPartida = Math.floor(Math.random() * presupuestoCapitan.length);

    //Clonamos nuestro array de inventario para evitar modificar el original
    //metodo de structuredClone
    partidaDelMomento.inventarioDelDia = structuredClone(listaInventario[inventarioPartida]);

    //Completamos demas datos
    //lo que esta en [] es el indice que cayo
    partidaDelMomento.presupuestoInicial = presupuestoCapitan[presupuestoPartida];
    partidaDelMomento.creditosDisponibles = partidaDelMomento.presupuestoInicial;
    partidaDelMomento.cargaActual = [];
    partidaDelMomento.confirmada = false;
    partidaDelMomento.tiempoParaAcabar = relojTemporal();
};

//Funcion para luego comparar si el tiempo acabo en los API
function acaboTiempo (){
    if (partidaDelMomento.confirmada) {
        return false;
    }
    return compararTiempoAcabado(partidaDelMomento.tiempoParaAcabar);
};

//Funcion que envia la partida 
function conseguirPartidaActual(){
    return partidaDelMomento;
}

nuevaPartida();

module.exports = {
    nuevaPartida,
    acaboTiempo,
    conseguirPartidaActual
}