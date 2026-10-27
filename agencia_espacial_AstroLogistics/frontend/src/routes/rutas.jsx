import { Routes, Route } from 'react-router-dom';
import CargaPage from '../pages/CargaPage';

const Rutas = () => {
    return (
        <Routes>
            <Route path="/" element={<CargaPage />} />
        </Routes>
    );
};

export default Rutas;