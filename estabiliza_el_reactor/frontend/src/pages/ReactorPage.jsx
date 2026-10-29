import { useState } from 'react';
import {
    Card, CardBody, CardTitle, Form, FormGroup, Label, Input,
    Button, Alert, ListGroup, ListGroupItem, Badge, Spinner
} from 'reactstrap';

const ReactorPage = () => {
    // ESTADOS (useState)
    const [temperatura, setTemperatura] = useState("");
    const [historial, setHistorial] = useState([]);
    const [mensajeAdvertencia, setMensajeAdvertencia] = useState("");
    const [estabilizado, setEstabilizado] = useState(false);
    const [cargando, setCargando] = useState(false);

    // Función para manejar el envío del intento
    const manejarEnvio = async (e) => {
        e.preventDefault();

        const valorNumerico = Number(temperatura);
        if (temperatura === "" || isNaN(valorNumerico)) {
            setMensajeAdvertencia("Por favor, ingresa un número válido.");
            return;
        }

        setCargando(true);
        setMensajeAdvertencia("");

        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

            const respuesta = await fetch(`${baseUrl}/adjust`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ temperaturaCliente: valorNumerico })
            });

            if (!respuesta.ok) {
                throw new Error("Error en la respuesta del servidor");
            }

            const datos = await respuesta.json();

            setEstabilizado(datos.estabilizado);
            setMensajeAdvertencia(datos.mensaje);

            if (!datos.exito) {
                setHistorial([...historial, valorNumerico]);
            }

        } catch (error) {
            setMensajeAdvertencia("Error de conexión: El servidor no responde o está apagado.");
        } finally {
            setCargando(false);
            setTemperatura("");
        }
    };

    // --- NUEVA FUNCIÓN: REINICIAR SISTEMA ---
    const reiniciarSistema = async () => {
        setCargando(true);
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

            // Llamamos al backend para que genere una nueva temperatura secreta
            const respuesta = await fetch(`${baseUrl}/reboot`, {
                method: 'POST', // o GET, dependiendo de cómo lo haya hecho tu compañero
            });

            if (!respuesta.ok) throw new Error("Error al reiniciar");

            // Limpiamos todos los estados visuales
            setHistorial([]);
            setEstabilizado(false);
            setTemperatura("");
            setMensajeAdvertencia("Sistema reiniciado. ¡Nueva temperatura generada!");

        } catch (error) {
            setMensajeAdvertencia("Error de conexión al intentar reiniciar el sistema.");
        } finally {
            setCargando(false);
        }
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

                    <Form onSubmit={manejarEnvio}>
                        <FormGroup>
                            <Label for="tempInput">Intento de ajuste de temperatura (°C):</Label>
                            <Input
                                type="number"
                                id="tempInput"
                                value={temperatura}
                                onChange={(e) => setTemperatura(e.target.value)}
                                disabled={estabilizado || cargando}
                                placeholder="Ingresa un valor..."
                            />
                        </FormGroup>
                        <Button
                            color="warning"
                            type="submit"
                            block
                            disabled={estabilizado || cargando}
                        >
                            {cargando ? <Spinner size="sm" /> : (estabilizado ? "Reactor Estable" : "Enviar Ajuste")}
                        </Button>
                    </Form>

                    <hr className="my-4" />

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

                    {/* --- BOTÓN DE REINICIO --- */}
                    {/* Solo se muestra si el jugador ya ganó (estabilizó el reactor) */}
                    {estabilizado && (
                        <Button
                            color="primary"
                            block
                            className="mt-4"
                            onClick={reiniciarSistema}
                            disabled={cargando}
                        >
                            {cargando ? <Spinner size="sm" /> : "🔄 Jugar de Nuevo (Reiniciar)"}
                        </Button>
                    )}

                </CardBody>
            </Card>
        </div>
    );
};

export default ReactorPage;