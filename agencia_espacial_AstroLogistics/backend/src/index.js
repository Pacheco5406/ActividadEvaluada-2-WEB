const express = require('express');
//const cors = require('cors');
const AstroRutes = require('./routes/rutesAstro');

const app = express();

const PORT = 3000;

//app.use(cors());
app.use(express.json());
app.use('/api', AstroRutes);

app.listen(PORT, () => {
    console.log(`AstroLogistics ejecutándose en http://localhost:${PORT}`);
});

