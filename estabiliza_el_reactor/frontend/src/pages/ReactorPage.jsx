import { useState } from 'react';
import {
    Card, CardBody, CardTitle, Form, FormGroup, Label, Input,
    Button, Alert, ListGroup, ListGroupItem, Badge, Spinner
} from 'reactstrap';

const ReactorPage = () => {
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

    // FUNCIÓN: REINICIAR SISTEMA 
    const reiniciarSistema = async () => {
        setCargando(true);
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

            
            const respuesta = await fetch(`${baseUrl}/reboot`, {
                method: 'POST',
            });

            const datos = await respuesta.json();

            
            if (!respuesta.ok) {
                setMensajeAdvertencia(datos.error || "Error al reiniciar el sistema");
                return;
            }

            
            setHistorial([]);
            setEstabilizado(false);
            setTemperatura("");
            setMensajeAdvertencia(datos.mensaje || "Sistema reiniciado. ¡Nueva temperatura generada!");

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


                    {mensajeAdvertencia && (
                        <Alert
                            color={estabilizado ? "success" : (mensajeAdvertencia.includes("reiniciado") ? "info" : "danger")}
                            className="text-center"
                        >
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
                        <p className="text-muted">Ningun intento fallido. ¡Intentalo!</p>
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

                    {/* BOTÓN DE REINICIO*/}
                    {estabilizado && (
                        <Button
                            color="primary"
                            block
                            className="mt-4"
                            onClick={reiniciarSistema}
                            disabled={cargando}
                        >
                            {cargando ? <Spinner size="sm" /> : "🔄 (Reiniciar)"}
                        </Button>
                    )}

                </CardBody>
            </Card>
        </div>
    );
};

export default ReactorPage;