import { useState, useEffect } from 'react';
import {
    Container, Row, Col, Alert, Badge, Card, CardBody, CardTitle, CardText,
    Button, ListGroup, ListGroupItem, ButtonGroup, Spinner
} from 'reactstrap';

const CargaPage = () => {
    // --- ESTADOS DEL SISTEMA ---
    const [inventario, setInventario] = useState([]);
    const [cargaActual, setCargaActual] = useState([]);
    const [creditos, setCreditos] = useState(0.00);
    const [costoTotal, setCostoTotal] = useState(0.00);
    const [cargando, setCargando] = useState(true);
    const [mensajeError, setMensajeError] = useState("");
    const [mensajeVictoria, setMensajeVictoria] = useState("");
    const [tiempoRestante, setTiempoRestante] = useState(0);
    const [sesionActiva, setSesionActiva] = useState(true);
    const [juegoTerminado, setJuegoTerminado] = useState(false);

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // --- CARGA INICIAL ---
    const cargarDatos = async () => {
        try {
            const [resInv, resCarga, resTiempo] = await Promise.all([
                fetch(`${baseUrl}/api/inventario`),
                fetch(`${baseUrl}/api/carga`),
                fetch(`${baseUrl}/api/tiempo`)
            ]);

            if (!resInv.ok || !resCarga.ok) throw new Error("Error al conectar con la base de datos.");

            const dataInv = await resInv.json();
            const dataCarga = await resCarga.json();
            const dataTiempo = await resTiempo.json();

            setInventario(dataInv.inventarioDelDia || []);
            setCargaActual(dataCarga.itemsCargados || []);
            setCreditos(dataCarga.creditos);
            setCostoTotal(dataCarga.total);
            
            if (dataTiempo) {
                setTiempoRestante(Math.floor(dataTiempo.tiempoRestanteMs / 1000));
                if (dataTiempo.confirmada || dataTiempo.sesionExpirada) {
                    setSesionActiva(false);
                }
            }
            setCargando(false);
        } catch (error) {
            setMensajeError("Error de conexión: Verifica que el backend esté corriendo.");
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    // --- TEMPORIZADOR LOCAL ---
    useEffect(() => {
        if (!sesionActiva || cargando || juegoTerminado) return;

        const temporizador = setInterval(() => {
            setTiempoRestante((prev) => {
                if (prev <= 1) {
                    clearInterval(temporizador);
                    setSesionActiva(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(temporizador);
    }, [sesionActiva, cargando, juegoTerminado]);

    // --- LÓGICA DE NEGOCIO ---

    // POST /api/carga/agregar
    const agregarALaCarga = async (equipo) => {
        setMensajeError("");
        try {
            const respuesta = await fetch(`${baseUrl}/api/carga/agregar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ equipoId: equipo.id, cantidad: 1 })
            });
            const data = await respuesta.json();

            if (!respuesta.ok) {
                setMensajeError(data.error || "Error al agregar suministro");
                return;
            }
            // Refrescar datos para sincronizar stock y totales
            cargarDatos();
        } catch (error) {
            setMensajeError("Error de red al agregar a la carga.");
        }
    };

    // PUT /api/carga/actualizar-unidades/:id
    const actualizarUnidades = async (id, cantidadActual, operacion) => {
        setMensajeError("");
        const nuevaCantidad = operacion === 'sumar' ? cantidadActual + 1 : cantidadActual - 1;

        if (nuevaCantidad <= 0) {
            eliminarDeLaCarga(id);
            return;
        }

        try {
            const respuesta = await fetch(`${baseUrl}/api/carga/actualizar-unidades/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cantidad: nuevaCantidad })
            });
            const data = await respuesta.json();

            if (!respuesta.ok) {
                setMensajeError(data.error || "Error al actualizar unidades");
                return;
            }
            cargarDatos();
        } catch (error) {
            setMensajeError("Error de red al actualizar unidades.");
        }
    };

    // DELETE /api/carga/eliminar/:id
    const eliminarDeLaCarga = async (id) => {
        setMensajeError("");
        try {
            const respuesta = await fetch(`${baseUrl}/api/carga/eliminar/${id}`, {
                method: 'DELETE'
            });
            const data = await respuesta.json();

            if (!respuesta.ok) {
                setMensajeError(data.error || "Error al eliminar suministro");
                return;
            }
            cargarDatos();
        } catch (error) {
            setMensajeError("Error de red al eliminar de la carga.");
        }
    };

    // POST /api/carga/confirmar (Evaluar Victoria)
    const confirmarLanzamiento = async () => {
        try {
            const respuesta = await fetch(`${baseUrl}/api/carga/confirmar`, { method: 'POST' });
            const data = await respuesta.json();
            
            setJuegoTerminado(true);
            setSesionActiva(false);
            
            if (data.gano) {
                setMensajeVictoria(data.mensaje);
            } else {
                setMensajeError(data.mensaje || data.error);
            }
        } catch (error) {
            setMensajeError("Error al confirmar el lanzamiento.");
        }
    };

    // POST /api/reiniciar
    const reiniciarMision = async () => {
        await fetch(`${baseUrl}/api/reiniciar`, { method: 'POST' });
        setMensajeError("");
        setMensajeVictoria("");
        setJuegoTerminado(false);
        setSesionActiva(true);
        setCargando(true);
        cargarDatos();
    };

    // --- RENDERIZADO ---
    if (cargando) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center vh-100">
                <Spinner color="primary" style={{ width: '3rem', height: '3rem' }} />
                <p className="mt-3 fw-bold text-secondary">Conectando con el servidor de AstroLogistics...</p>
            </div>
        );
    }

    if (!sesionActiva && !juegoTerminado) {
        return (
            <Container className="mt-5 text-center">
                <Alert color="danger" className="shadow-sm">
                    <h4>🚀 Ventana de lanzamiento cerrada</h4>
                    <p>El tiempo ha terminado o la sesión expiró.</p>
                </Alert>
                <Button color="primary" onClick={reiniciarMision}>Iniciar Nueva Misión</Button>
            </Container>
        );
    }

    return (
        <>
            <div className="px-3 pt-3">
                <Alert color="info" className="d-flex flex-column flex-md-row justify-content-between align-items-md-center shadow-sm border-0 rounded-3 p-3 mb-4">
                    <div className="mb-2 mb-md-0">
                        <h4 className="mb-0 fw-bold">🚀 AstroLogistics Ltd.</h4>
                        <small className="text-muted">Panel del Capitán - Ventana de Lanzamiento</small>
                    </div>

                    <div className="d-flex gap-2 align-items-center flex-wrap">
                        <Badge color="success" pill className="p-2 px-3 fs-6 shadow-sm">
                            💰 Créditos: {creditos.toFixed(2)} Cr
                        </Badge>
                        <Badge color="dark" pill className="p-2 px-3 fs-6 shadow-sm">
                            📦 Costo Total: {costoTotal.toFixed(2)} Cr
                        </Badge>
                        <Badge color={tiempoRestante <= 10 ? "danger" : "warning"} pill className="p-2 px-3 fs-6 shadow-sm text-dark">
                            ⏱️ {tiempoRestante} s
                        </Badge>
                    </div>
                </Alert>
            </div>

            <Container fluid className="px-4 mt-2">
                {mensajeError && (
                    <Alert color="danger" isOpen={!!mensajeError} toggle={() => setMensajeError("")}>
                        ⚠️ {mensajeError}
                    </Alert>
                )}
                
                {mensajeVictoria && (
                    <Alert color="success" className="text-center fw-bold fs-5 shadow-sm">
                        🎉 {mensajeVictoria}
                    </Alert>
                )}

                <Row>
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
                                                disabled={item.stock === 0 || juegoTerminado}
                                                onClick={() => agregarALaCarga(item)}
                                            >
                                                {item.stock === 0 ? "Agotado" : "Añadir a la Nave"}
                                            </Button>
                                        </CardBody>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Col>

                    <Col xs="12" md="4" className="mt-4 mt-md-0">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4 className="text-secondary fw-bold mb-0">Tu Bodega</h4>
                            <Button color="success" size="sm" onClick={confirmarLanzamiento} disabled={cargaActual.length === 0 || juegoTerminado}>
                                Confirmar Lanzamiento
                            </Button>
                        </div>
                        <ListGroup className="shadow-sm">
                            {cargaActual.length === 0 ? (
                                <ListGroupItem className="text-muted text-center py-4">
                                    Bodega vacía.
                                </ListGroupItem>
                            ) : (
                                cargaActual.map((itemCargado) => {
                                    const itemBase = inventario.find(i => i.id === itemCargado.id) || {};
                                    return (
                                        <ListGroupItem key={itemCargado.id} className="d-flex justify-content-between align-items-center py-3">
                                            <div>
                                                <strong>{itemBase.nombre || `Item #${itemCargado.id}`}</strong><br />
                                                <small className="text-muted">${itemBase.precio || 0} c/u</small>
                                            </div>
                                            <div className="text-end">
                                                <ButtonGroup size="sm" className="mb-2">
                                                    <Button color="secondary" disabled={juegoTerminado} onClick={() => actualizarUnidades(itemCargado.id, itemCargado.cantidad, 'restar')}>-</Button>
                                                    <Button color="light" disabled className="text-dark fw-bold">{itemCargado.cantidad}</Button>
                                                    <Button color="secondary" disabled={juegoTerminado} onClick={() => actualizarUnidades(itemCargado.id, itemCargado.cantidad, 'sumar')}>+</Button>
                                                </ButtonGroup>
                                                <br />
                                                <Button color="danger" outline size="sm" disabled={juegoTerminado} onClick={() => eliminarDeLaCarga(itemCargado.id)}>
                                                    Desembarcar
                                                </Button>
                                            </div>
                                        </ListGroupItem>
                                    );
                                })
                            )}
                        </ListGroup>
                        {juegoTerminado && (
                            <Button color="primary" block className="mt-3" onClick={reiniciarMision}>
                                Iniciar Nueva Misión
                            </Button>
                        )}
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default CargaPage;