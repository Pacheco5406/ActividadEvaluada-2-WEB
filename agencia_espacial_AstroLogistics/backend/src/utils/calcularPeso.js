//funcion para calcular el peso
function calcularPeso(partida) {
  return partida.cargaActual.reduce((suma, item) => {
    const producto = partida.inventarioDelDia.find(p => p.id === item.id);
    return suma + (producto ? producto.peso * item.cantidad : 0);
  }, 0);
}

module.exports = { calcularPeso };