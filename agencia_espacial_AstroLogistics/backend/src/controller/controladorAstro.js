const { calcularTotal } = require('../utils/calcularTotal');
const { nuevaPartida, acaboTiempo, conseguirPartidaActual } = require('../utils/partida')
const { evaluarVictoria } = require('../utils/victoriaEspacial');
const { calcularPeso } = require('../utils/calcularPeso');
//Declaramos una constante como la partida de la sesion actual
const partida = conseguirPartidaActual();
//Para no repetir el mensaje de partida finalizada
const mensajeTiempo = { sesionExpirada: true, error: "Se acabo el tiempo, puedes iniciar una nueva sesión" };
const mensajeConfirmada = { error: "La carga ya fue confirmada, inicia una nueva sesión para jugar otra vez" };

//Limite de peso
const limitePeso = 100;

//GET Api donde recuperamos los datos de inventario al azar
const getInventario = (req, res) => {
  //Hacemos un if para saber si el tiempo ya se acabo o no antes de hacer la peticion
  if (acaboTiempo()) {
    return res.status(401).json(mensajeTiempo);
  }
  res.json({ inventarioDelDia: partida.inventarioDelDia });
};

//GET Api donde recuperamos los datos de carga al azar
const getCarga = (req, res) => {
  if (acaboTiempo()) {
    return res.status(401).json(mensajeTiempo);
  }
  res.json({
    creditos: partida.creditosDisponibles,
    itemsCargados: partida.cargaActual,
    total: calcularTotal(partida),
    peso: calcularPeso(partida),
    limitePeso
  });
};

//POST Api que carga temporalmente el anadido 
//se verifica si el stock es menor a la solicitada 400 stock insuficiente
const postCargaTemporal = (req, res) => {
  if (acaboTiempo()) {
    return res.status(401).json({ sesionExpirada: true, error: "Se acabo el tiempo, debes inciar una nueva sesión" });
  }
  if (partida.confirmada) {
    return res.status(400).json(mensajeConfirmada);
  }
  const equipoId = Number(req.body.equipoId);
  const cantidad = Number(req.body.cantidad);
  //Validamos no metan negativos, no numero ni decimales
  if (!Number.isInteger(equipoId) || !Number.isInteger(cantidad) || cantidad <= 0) {
    return res.status(400).json({ error: "equipoId y cantidad deben ser enteros positivos" });
  }
  const itemInventarioCarga = partida.inventarioDelDia.find(i => i.id === equipoId);
  //Primero vemos exista
  if (!itemInventarioCarga) {
    return res.status(400).json({ error: "El item no esta disponible este dia" });
  }
  if (itemInventarioCarga.stock < cantidad) {
    return res.status(400).json({ error: "Stock en base insuficiente" });
  }
  if (calcularTotal(partida) + itemInventarioCarga.precio * cantidad > partida.creditosDisponibles) {
    return res.status(400).json({ error: "Créditos insuficientes para esta cantidad" });
  }
    if (calcularPeso(partida) + itemInventarioCarga.peso * cantidad > limitePeso) {
    return res.status(400).json({ error: `Peso máximo excedido, la nave solo soporta ${limitePeso} kg` });
  }

  itemInventarioCarga.stock -= cantidad;
  const enCarga = partida.cargaActual.find(i => i.id === equipoId);
  if (enCarga) {
    enCarga.cantidad += cantidad;
  } else {
    partida.cargaActual.push({ id: equipoId, cantidad });
  }

  res.status(201).json({
    mensaje: "Suministro agregado a la carga",
    creditos: partida.creditosDisponibles,
    itemsCargados: partida.cargaActual,
    total: calcularTotal(partida),
    peso:calcularPeso(partida)
  });
}

//PUT Api que sube o baja lo que recien acabamos de anadir de la bodega
const putEditarCarga = (req, res) => {
  if (acaboTiempo()) {
    return res.status(401).json(mensajeTiempo);
  }
  if (partida.confirmada) {
    return res.status(400).json(mensajeConfirmada);
  }
  const id = Number(req.params.id);
  const nuevaCantidad = Number(req.body.cantidad);
  //volvemos a revisar no negativo ni decimal ni no numero
  if (!Number.isInteger(nuevaCantidad) || nuevaCantidad <= 0) {
    return res.status(400).json({ error: "La cantidad debe ser un entero positivo (usa Delete si quiere eliminar stock)" });
  }
  //Buscams si el ID se encuentra en nuestra carga
  const enCarga = partida.cargaActual.find(i => i.id === id);
  if (!enCarga) {
    return res.status(404).json({ error: "Ese suministro no está en la carga" });
  }

  const producto = partida.inventarioDelDia.find(p => p.id === id);
  const diferencia = nuevaCantidad - enCarga.cantidad;

  if (diferencia > producto.stock) {
    return res.status(400).json({ error: "Stock en base insuficiente" });
  }
  const nuevoTotal = calcularTotal(partida) + producto.precio * diferencia;
  if (nuevoTotal > partida.creditosDisponibles) {
    return res.status(400).json({ error: "Créditos insuficientes para esta cantidad" });
  }
    if (calcularPeso(partida) + producto.peso * diferencia > limitePeso) {
    return res.status(400).json({ error: `Peso máximo excedido, la nave solo soporta ${limitePeso} kg` });
  }

  producto.stock -= diferencia;
  enCarga.cantidad = nuevaCantidad;

  res.json({
    mensaje: "Unidades actualizadas",
    creditos: partida.creditosDisponibles,
    itemsCargados: partida.cargaActual,
    total: calcularTotal(partida),
    peso: calcularPeso(partida),
    limitePeso
  });
}


//DELETE Api que borra lo que acabamos de agregar
const deleteCarga = (req, res) => {
  if (acaboTiempo()) {
    return res.status(401).json(mensajeTiempo);
  }
  if (partida.confirmada) {
    return res.status(400).json(mensajeConfirmada);
  }
  const id = Number(req.params.id);
  //Buscamos el indice en nuestra carga de que queremos eliminar
  const indice = partida.cargaActual.findIndex(i => i.id === id);
  if (indice === -1) {
    return res.status(404).json({ error: "Suministro no se encuentra en tu carga" });
  }
  const [quitado] = partida.cargaActual.splice(indice, 1);
  const producto = partida.inventarioDelDia.find(p => p.id === id);
  producto.stock += quitado.cantidad;

  res.json({
    mensaje: "Suministro eliminado correctamente de la carga",
    creditos: partida.creditosDisponibles,
    itemsCargados: partida.cargaActual,
    total: calcularTotal(partida),
    peso:calcularPeso(partida),
    limitePeso
  });
};

//API extra para q el usuario elija manual si reiniciar la partida o no
const postReiniciarPartida = (req, res) => {
  nuevaPartida();
  res.json({
    mensaje: "Nueva sesión iniciada",
    creditos: partida.creditosDisponibles
  });
};

//Otra APi extra para que cargue su carga y vea si gano
//Gastar al menos 70% sin llegar al 0
const postConfirmarCarga = (req, res) => {
  if (acaboTiempo()) {
    return res.status(401).json(mensajeTiempo);
  }
  if (partida.confirmada) {
    return res.status(401).json(mensajeConfirmada);
  }
  const resultado = evaluarVictoria(partida);
  partida.confirmada = true;
  if (resultado.gano) {
    return res.status(200).json({ gano: true, mensaje: "¡Lanzamiento Exitoso!" });
  }
  //El ? actua como un if abreviado 
  const motivo = resultado.creditosRestantes <= 0
    ? "Gastaste todo tu presupuesto, debía quedarte saldo. Perdiste"
    : `Gastaste el ${resultado.porcentajeGastado}% y debías gastar mínimo 30%. Perdiste`;
  return res.status(200).json({ mensaje: motivo, ...resultado });

};

//Para mostrar tiempo restante en frontend
const getTiempo = (req, res) => {
  const restanteMs = Math.max(0, partida.tiempoParaAcabar - Date.now());
  res.json({
    tiempoRestanteMs: restanteMs,
    sesionExpirada: !partida.confirmada && restanteMs === 0,
    confirmada: partida.confirmada
  });
};


module.exports = {
  getCarga,
  getInventario,
  postCargaTemporal,
  putEditarCarga,
  deleteCarga,
  postReiniciarPartida,
  postConfirmarCarga,
  getTiempo
}