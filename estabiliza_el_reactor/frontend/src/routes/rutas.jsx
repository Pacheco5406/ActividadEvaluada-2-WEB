import { Routes, Route } from 'react-router-dom';
import ReactorPage from '../pages/ReactorPage';

const Rutas = () => {
    return (
        <Routes>
            <Route path="/" element={<ReactorPage />} />
        </Routes>
    );
};

export default Rutas;