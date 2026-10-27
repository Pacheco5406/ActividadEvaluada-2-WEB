import { useState } from 'react';
import {
    Card, CardBody, CardTitle, Form, FormGroup, Label, Input,
    Button, Alert, ListGroup, ListGroupItem, Badge
} from 'reactstrap';

const ReactorPage = () => {
    // ESTADOS (useState) requeridos por el docente
    const [temperatura, setTemperatura] = useState(""); // Input numérico
    const [historial, setHistorial] = useState([]); // Arreglo con temperaturas fallidas
    const [mensajeAdvertencia, setMensajeAdvertencia] = useState(""); // Mensaje del servidor/sistema
    const [estabilizado, setEstabilizado] = useState(false); // Booleano (ganó o no)

    // Función que se ejecuta al enviar el formulario
    const manejarEnvio = (e) => {
        e.preventDefault(); // Evita recargar la página

        // Validar que sea un número
        const valorNumerico = Number(temperatura);
        if (temperatura === "" || isNaN(valorNumerico)) {
            setMensajeAdvertencia("Por favor, ingresa un número válido.");
            return;
        }

        // --- LÓGICA DEL JUEGO (Lógica de Negocio) ---
        // Supongamos que el reactor explota si la temperatura es menor a 0 o mayor a 100.
        // El objetivo es que el usuario ingrese exactamente 50 para estabilizarlo.

        if (valorNumerico === 50) {
            setEstabilizado(true);
            setMensajeAdvertencia("¡Felicidades! Has estabilizado el reactor.");
        } else {
            // Si falla, guardamos el intento en el historial
            setHistorial([...historial, valorNumerico]);

            // Damos pistas al usuario
            if (valorNumerico < 50) {
                setMensajeAdvertencia("¡Peligro! Temperatura muy baja. El reactor se está congelando.");
            } else {
                setMensajeAdvertencia("¡Peligro! Temperatura muy alta. ¡El reactor va a explotar!");
            }
        }

        // Limpiamos el input
        setTemperatura("");
    };

    return (
        <div className="d-flex justify-content-center">
            <Card style={{ width: '500px' }} className="shadow">
                <CardBody>
                    <CardTitle tag="h2" className="text-center mb-4">
                        ☢️ Estabiliza el Reactor ☢️
                    </CardTitle>

                    {/* Mostrar mensaje de advertencia o victoria */}
                    {mensajeAdvertencia && (
                        <Alert color={estabilizado ? "success" : "danger"} className="text-center">
                            {mensajeAdvertencia}
                        </Alert>
                    )}

                    {/* Formulario con input numérico y botón */}
                    <Form onSubmit={manejarEnvio}>
                        <FormGroup>
                            <Label for="tempInput">Intento de ajuste de temperatura (°C):</Label>
                            <Input
                                type="number"
                                id="tempInput"
                                value={temperatura}
                                onChange={(e) => setTemperatura(e.target.value)}
                                disabled={estabilizado} // Bloquea el input si ya ganó
                                placeholder="Ingresa un valor..."
                            />
                        </FormGroup>
                        <Button
                            color="warning"
                            type="submit"
                            block
                            disabled={estabilizado}
                        >
                            {estabilizado ? "Reactor Estable" : "Enviar Ajuste"}
                        </Button>
                    </Form>

                    <hr className="my-4" />

                    {/* Lista dinámica con el historial */}
                    <h5>Registro de Temperaturas Fallidas:</h5>
                    {historial.length === 0 ? (
                        <p className="text-muted">No hay intentos fallidos aún. ¡Sigue intentando!</p>
                    ) : (
                        <ListGroup>
                            {historial.map((temp, index) => (
                                <ListGroupItem key={index} className="d-flex justify-content-between align-items-center">
                                    Intento #{index + 1}
                                    <Badge color="danger" pill>{temp} °C</Badge>
                                </ListGroupItem>
                            ))}
                        </ListGroup>
                    )}

                </CardBody>
            </Card>
        </div>
    );
};

export default ReactorPage;