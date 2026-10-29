//Como regla decidida la persona debe gastar 70% de su presupuesto sin llegar a 0
const { calcularTotal } = require('./calcularTotal');

const porcentajeMeta = 30;

function evaluarVictoria(partida) {
  const total = calcularTotal(partida);
  const presupuesto = partida.presupuestoInicial;
  const cumpleMinimo = total * 100 >= presupuesto * porcentajeMeta;
  const quedaSaldo = total < presupuesto;

  return {
    gano: cumpleMinimo && quedaSaldo,
    total,
    creditosRestantes: presupuesto - total,
    porcentajeGastado: Math.round((total / presupuesto) * 10000) / 100,
    minimoParaGanar: (presupuesto * porcentajeMeta) / 100
  };
}

module.exports = { evaluarVictoria };
