import { useState, useEffect } from 'react';
import {
    Container, Row, Col, Alert, Badge, Card, CardBody, CardTitle, CardText,
    Button, ListGroup, ListGroupItem, ButtonGroup, Spinner
} from 'reactstrap';

// --- SIMULACIÓN INICIAL DE LA BASE DE DATOS (Para probar sin el Backend) ---
const inventarioInicialSimulado = [
    { id: 201, nombre: "Tanque de Oxígeno XL", precio: 50.00, stock: 5, categoria: "Soporte Vital" },
    { id: 202, nombre: "Raciones de Comida", precio: 15.00, stock: 20, categoria: "Alimentos" },
    { id: 203, nombre: "Batería de Núcleo", precio: 120.00, stock: 2, categoria: "Energía" },
    { id: 204, nombre: "Kit Médico Avanzado", precio: 80.00, stock: 0, categoria: "Soporte Vital" }
];

const CargaPage = () => {
    // --- ESTADOS DEL SISTEMA (useState) ---
    const [inventario, setInventario] = useState([]);
    const [cargaActual, setCargaActual] = useState([]);
    const [creditos, setCreditos] = useState(500.00);
    const [costoTotal, setCostoTotal] = useState(0.00);
    const [cargando, setCargando] = useState(true);
    const [mensajeError, setMensajeError] = useState("");
    const [tiempoRestante, setTiempoRestante] = useState(60);
    const [sesionActiva, setSesionActiva] = useState(true);

    // --- TEMPORIZADOR (useEffect) ---
    useEffect(() => {
        if (!sesionActiva) return;

        const temporizador = setInterval(() => {
            setTiempoRestante((prev) => {
                if (prev <= 1) {
                    clearInterval(temporizador);
                    setSesionActiva(false); // Cierra la sesión al llegar a 0
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(temporizador);
    }, [sesionActiva]);

    // --- CARGA INICIAL (Simulando GET /api/inventario) ---
    useEffect(() => {
        const cargarDatosIniciales = async () => {
            try {
                const respuesta = await new Promise((resolve) =>
                    setTimeout(() => resolve(inventarioInicialSimulado), 1000)
                );
                setInventario(respuesta);
                setCargando(false);
            } catch (error) {
                setMensajeError("Error al conectar con la base de datos.");
                setCargando(false);
            }
        };

        cargarDatosIniciales();
    }, []);

    // --- LÓGICA DE NEGOCIO ---

    // POST /api/carga/agregar
    const agregarALaCarga = (equipo) => {
        setMensajeError("");

        if (equipo.stock <= 0) {
            setMensajeError("Stock en base insuficiente");
            return;
        }

        if (costoTotal + equipo.precio > creditos) {
            setMensajeError("Créditos insuficientes para esta cantidad");
            return;
        }

        const itemExistente = cargaActual.find(item => item.id === equipo.id);

        if (itemExistente) {
            setCargaActual(cargaActual.map(item =>
                item.id === equipo.id ? { ...item, cantidad: item.cantidad + 1 } : item
            ));
        } else {
            setCargaActual([...cargaActual, { id: equipo.id, nombre: equipo.nombre, precio: equipo.precio, cantidad: 1 }]);
        }

        setInventario(inventario.map(item =>
            item.id === equipo.id ? { ...item, stock: item.stock - 1 } : item
        ));
        setCostoTotal(costoTotal + equipo.precio);
    };

    // PUT /api/carga/actualizar-unidades/:id
    const actualizarUnidades = (id, operacion) => {
        setMensajeError("");
        const item = cargaActual.find(i => i.id === id);
        const itemInventario = inventario.find(i => i.id === id);

        if (operacion === 'sumar') {
            if (itemInventario.stock <= 0) {
                setMensajeError("Stock en base insuficiente");
                return;
            }
            if (costoTotal + item.precio > creditos) {
                setMensajeError("Créditos insuficientes para esta cantidad");
                return;
            }

            setCargaActual(cargaActual.map(i => i.id === id ? { ...i, cantidad: i.cantidad + 1 } : i));
            setInventario(inventario.map(i => i.id === id ? { ...i, stock: i.stock - 1 } : i));
            setCostoTotal(costoTotal + item.precio);

        } else if (operacion === 'restar' && item.cantidad > 1) {
            setCargaActual(cargaActual.map(i => i.id === id ? { ...i, cantidad: i.cantidad - 1 } : i));
            setInventario(inventario.map(i => i.id === id ? { ...i, stock: i.stock + 1 } : i));
            setCostoTotal(costoTotal - item.precio);
        }
    };

    // DELETE /api/carga/eliminar/:id
    const eliminarDeLaCarga = (id) => {
        const item = cargaActual.find(i => i.id === id);

        setInventario(inventario.map(i =>
            i.id === id ? { ...i, stock: i.stock + item.cantidad } : i
        ));

        setCostoTotal(costoTotal - (item.precio * item.cantidad));
        setCargaActual(cargaActual.filter(i => i.id !== id));
    };

    // --- RENDERIZADO ---
    if (cargando) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center vh-100">
                <Spinner color="primary" style={{ width: '3rem', height: '3rem' }} />
                <p className="mt-3 fw-bold text-secondary">Cargando sistemas de la nave...</p>
            </div>
        );
}

    if (!sesionActiva) {
        return (
            <Container className="mt-5 text-center">
                <Alert color="danger">
                    <h4>🚀 Ventana de lanzamiento cerrada</h4>
                    <p>El tiempo ha terminado. La sesión se ha cerrado.</p>
                </Alert>
                <Button color="primary" onClick={() => window.location.reload()}>Iniciar Nueva Misión</Button>
            </Container>
        );
    }

    return (
        <>
            {/* PANEL SUPERIOR (Información de la Misión) */}
            <div className="px-3 pt-3">
                <Alert color="info" className="d-flex flex-column flex-md-row justify-content-between align-items-md-center shadow-sm border-0 rounded-3 p-3 mb-4">
                    <div className="mb-2 mb-md-0">
                        <h4 className="mb-0 fw-bold">🚀 AstroLogistics Ltd.</h4>
                        <small className="text-muted">Panel del Capitán - Ventana de Lanzamiento</small>
                    </div>

                    <div className="d-flex gap-2 align-items-center flex-wrap">
                        {/* Créditos (Requisito) */}
                        <Badge color="success" pill className="p-2 px-3 fs-6 shadow-sm">
                            💰 Créditos disponibles: {creditos.toFixed(2)} Cr
                        </Badge>

                        {/* Costo Total (Requisito Estricto: color="dark" pill) */}
                        <Badge color="dark" pill className="p-2 px-3 fs-6 shadow-sm">
                            📦 Costo total de Carga: {costoTotal.toFixed(2)} Cr
                        </Badge>

                        {/* Tiempo (Extra del caso de negocio) */}
                        <Badge
                            color={tiempoRestante <= 10 ? "danger" : "warning"}
                            pill
                            className="p-2 px-3 fs-6 shadow-sm text-dark"
                        >
                            ⏱️ {tiempoRestante} s
                        </Badge>
                    </div>
                </Alert>
            </div>

            <Container fluid className="px-4 mt-2">
                {/* MENSAJES DE ERROR DEL BACKEND */}
                {mensajeError && (
                    <Alert color="warning" isOpen={!!mensajeError} toggle={() => setMensajeError("")}>
                        ⚠️ {mensajeError}
                    </Alert>
                )}

                <Row>
                    {/* COLUMNA IZQUIERDA: CATÁLOGO */}
                    <Col md="8">
                        <h4 className="mb-3 text-secondary fw-bold">Catálogo de Suministros (Base)</h4>
                        <Row>
                            {inventario.map((item) => (
                                <Col md="4" xs="12" key={item.id}>
                                    <Card className="mb-3 shadow-sm h-100 border-0">
                                        <CardBody className="d-flex flex-column">
                                            <CardTitle tag="h6" className="mb-1 fw-bold">{item.nombre}</CardTitle>
                                            <CardText className="text-muted small mb-2">{item.categoria}</CardText>
                                            <div className="d-flex justify-content-between align-items-center mb-3 mt-auto">
                                                <Badge color="success" className="fs-6">${item.precio}</Badge>
                                                <span className="small fw-bold text-muted">Stock: {item.stock}</span>
                                            </div>
                                            <Button
                                                color={item.stock === 0 ? "secondary" : "primary"}
                                                block
                                                size="sm"
                                                disabled={item.stock === 0}
                                                onClick={() => agregarALaCarga(item)}
                                            >
                                                {item.stock === 0 ? "Agotado en Base" : "Añadir a la Nave"}
                                            </Button>
                                        </CardBody>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Col>

                    {/* COLUMNA DERECHA: BODEGA DE CARGA */}
                    <Col xs="12" md="4" className="mt-4 mt-md-0">
                        <h4 className="mb-3 text-secondary fw-bold">Tu Bodega de Carga</h4>
                        <ListGroup className="shadow-sm">
                            {cargaActual.length === 0 ? (
                                <ListGroupItem className="text-muted text-center py-4">
                                    No has cargado suministros aún.
                                </ListGroupItem>
                            ) : (
                                cargaActual.map((item) => (
                                    <ListGroupItem key={item.id} className="d-flex justify-content-between align-items-center py-3">
                                        <div>
                                            <strong>{item.nombre}</strong>
                                            <br />
                                            <small className="text-muted">${item.precio} c/u</small>
                                        </div>
                                        <div className="text-end">
                                            <ButtonGroup size="sm" className="mb-2">
                                                <Button color="secondary" onClick={() => actualizarUnidades(item.id, 'restar')}>-</Button>
                                                <Button color="light" disabled className="text-dark fw-bold">{item.cantidad}</Button>
                                                <Button color="secondary" onClick={() => actualizarUnidades(item.id, 'sumar')}>+</Button>
                                            </ButtonGroup>
                                            <br />
                                            <Button color="danger" outline size="sm" onClick={() => eliminarDeLaCarga(item.id)}>
                                                Desembarcar
                                            </Button>
                                        </div>
                                    </ListGroupItem>
                                ))
                            )}
                        </ListGroup>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default CargaPage;