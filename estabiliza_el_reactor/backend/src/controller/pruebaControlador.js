/*1. Ejercicio 1: “Estabiliza el Reactor”,
En el Backend (Express):
- Crea una variable en el servidor que genere una "temperatura de estabilización" aleatoria
(un número entre 1 y 100) al iniciar el servidor.
- Crea una ruta POST /adjust, que reciba la temperatura ingresada por el cliente y
responda si la temperatura ideal del reactor es "más alta", "más baja", o si está
"estabilizado" (correcto).
- Crea una ruta POST /reboot para reiniciar el sistema y generar una nueva temperatura de
estabilización*/

const temperatura = require('../data/pruebaData.js')

//Creando recibir temperatura y comparar
const compararTemperatura = (req, res) => {
    const { temperaturaCliente } = req.body;

    if (
        temperaturaCliente === undefined || temperaturaCliente === null
    ) {
        return res.status(400).json(
            { error: "Completa el campo de temperatura" }
        );
    } if (
        typeof temperaturaCliente === 'string' && temperaturaCliente.trim() === ""
    ) {
        return res.status(400).json(
            { error: "Ingrese un numero" }
        );
    }

    const temperaturaClienteNumerico = Number(temperaturaCliente);

    if (isNaN(temperaturaClienteNumerico)) {
        return res.status(400).json({ error: "Ingresa un numero valido" });
    }

    let temperaturaComparativa = temperatura.verTemperaturaActual();

    //esto solo es para asegurar q si este cumpliendose reinicios y todo
    console.log(temperaturaComparativa)

    if (temperaturaComparativa === temperaturaClienteNumerico) {
        // GANA: exito y estabilizado son true
        return res.json({
            mensaje: "Reactor estabilizado",
            exito: true,
            estabilizado: true
        });
    } else if (temperaturaComparativa > temperaturaClienteNumerico) {
        // FALLA (muy baja): exito y estabilizado son false
        return res.json({
            mensaje: "La temperatura es mayor para estabilizar",
            exito: false,
            estabilizado: false
        });
    } else {
        return res.json({
            mensaje: "La temperatura es menor para estabilizar",
            exito: false,
            estabilizado: false
        })
    };

};

const reiniciarSistema = (req, res) => {
    const nuevaTemperatura = temperatura.rebootServerNumero();
    return res.json({
        mensaje: "Servidor reinciiado exitosamente",
        nuevaTemperaturaGeneradaReinicio: nuevaTemperatura
    });
};



module.exports = {
    compararTemperatura,
    reiniciarSistema
};