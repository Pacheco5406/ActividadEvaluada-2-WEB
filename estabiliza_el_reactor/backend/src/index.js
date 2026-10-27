const express = require('express');
const pruebaRutes = require('./routes/pruebaRutas');

const app = express();


app.use(cors());
app.use(express.json());
app.use('/', pruebaRutes);

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});