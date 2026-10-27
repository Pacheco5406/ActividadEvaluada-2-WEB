import { useState } from 'react';
import {
    Card, CardBody, CardTitle, Form, FormGroup, Label, Input,
    Button, Alert, ListGroup, ListGroupItem, Badge, Spinner
} from 'reactstrap';

const ReactorPage = () => {
    // ESTADOS (useState) requeridos por el docente
    const [temperatura, setTemperatura] = useState("");
    const [historial, setHistorial] = useState([]);
    const [mensajeAdvertencia, setMensajeAdvertencia] = useState("");
    const [estabilizado, setEstabilizado] = useState(false);
    const [cargando, setCargando] = useState(false); // Estado extra para evitar spam de clics

    // Función asíncrona para manejar el envío a la API
    const manejarEnvio = async (e) => {
        e.preventDefault();

        const valorNumerico = Number(temperatura);
        if (temperatura === "" || isNaN(valorNumerico)) {
            setMensajeAdvertencia("Por favor, ingresa un número válido.");
            return;
        }

        setCargando(true);
        setMensajeAdvertencia(""); // Limpia mensajes previos

        try {
            // Se utiliza la variable de entorno configurada previamente
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            
            // Petición al backend usando fetch (promesas)
            const respuesta = await fetch(`${baseUrl}/adjust`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ temperaturaCliente: valorNumerico })
            });

            if (!respuesta.ok) {
                throw new Error("Error en la respuesta del servidor");
            }

            const datos = await respuesta.json();

            // Actualización de estados basados en la respuesta real del backend
            setEstabilizado(datos.estabilizado);
            setMensajeAdvertencia(datos.mensaje);

            if (!datos.exito) {
                setHistorial([...historial, valorNumerico]);
            }

        } catch (error) {
            // Captura de errores de red (ej. backend apagado o sin CORS)
            setMensajeAdvertencia("Error de conexión: El servidor no responde o está apagado.");
        } finally {
            setCargando(false);
            setTemperatura("");
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

                    {/* Formulario con input numérico y botón */}
                    <Form onSubmit={manejarEnvio}>
                        <FormGroup>
                            <Label for="tempInput">Intento de ajuste de temperatura (°C):</Label>
                            <Input
                                type="number"
                                id="tempInput"
                                value={temperatura}
                                onChange={(e) => setTemperatura(e.target.value)}
                                disabled={estabilizado || cargando} // Bloquea si ya ganó o está cargando
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