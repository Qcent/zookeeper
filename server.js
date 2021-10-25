const express = require('express');
//instantiate the server
const app = express();

//import animals data
const { animals } = require('./data/animals');

//set server to listen on port 3001
app.listen(3001, () => {
    console.log('API server running on port 3001!')
});

// add a route for the front end to request from
app.get('/api/animals', (req, res) => {
    // send the animals as json data in response
    res.json(animals);
});