//funcion para facilitar calcular el total del momento

function calcularTotal(partida) {
    //reduce sirve para sumar los elementos de la carga y sacar el total del precio
  return partida.cargaActual.reduce((suma, item) => {
    const producto = partida.inventarioDelDia.find(p => p.id === item.id);
    return suma + producto.precio * item.cantidad;
  }, 0);
}

module.exports = {calcularTotal}