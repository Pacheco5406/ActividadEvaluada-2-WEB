//Creamos la funcion del temporizador 
//para limite de juego
//Date.now da en milisegundos

function relojTemporal(){

    const tiempoJuego = 240000;
    return Date.now() + tiempoJuego;
}

//Funcion de comparacion

function compararTiempoAcabado(tiempoAcabado){
    return Date.now() > tiempoAcabado;
}

module.exports ={
    relojTemporal,
    compararTiempoAcabado
}