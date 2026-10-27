const express = require('express');
const pruebaRutes = require('./routes/pruebaRutas');

const app = express();

const PORT = 3000;

app.use(express.json());
app.use('/', pruebaRutes);

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});