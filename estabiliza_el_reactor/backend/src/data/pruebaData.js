//Generador de numeros aleatorios hasta el 100
function generadorTemperaturaEstabilizadora() {
    return Math.floor(Math.random() * 101);
}

//Mandamos el numero conseguido a una variable let para que se pueda modificar luego
let NumeroFijo = generadorTemperaturaEstabilizadora();

//Para ver cual es el numero actual
function verTemperaturaActual() {
    return NumeroFijo;
}

//Para cuando reiniciemos el servidor
function rebootServerNumero() {
    NumeroFijo = generadorTemperaturaEstabilizadora();
    return NumeroFijo;
}

module.exports = {
    verTemperaturaActual,
    rebootServerNumero
}