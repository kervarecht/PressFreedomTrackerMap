const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => res.status(200).sendFile('map_home.html', { root: __dirname }));
app.get('/trackermap.js', (req, res) => res.status(200).sendFile('trackermap.js', { root: __dirname }));

app.get('/map-svg', (req, res) => res.status(200).sendFile('full_map.svg', { root: __dirname }));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));