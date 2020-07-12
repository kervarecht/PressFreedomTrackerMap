const express = require('express')
const app = express()
const port = 3001;

app.get('/', (req, res) => res.status(200).sendFile('map_home.html', { root: __dirname }));
app.get('/trackermap.js', (req, res) => res.status(200).sendFile('trackermap.js', { root: __dirname }));

app.get('/map-svg', (req, res) => res.status(200).sendFile('full_map.svg', { root: __dirname }));

app.get('/csv', (req, res) => res.status(200).sendFile('incidents.csv', { root: __dirname }));
app.get('/favicon.ico', (req, res) => res.status(200).send("Okay!"));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));