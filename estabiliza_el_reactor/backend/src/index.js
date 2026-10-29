const express = require('express');
const cors = require('cors');
const pruebaRutes = require('./routes/pruebaRutas');

const app = express();

const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use('/', pruebaRutes);

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});