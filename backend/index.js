require('dotenv').config({});
const express = require('express');
const cors = require('cors');

const port = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.use(express.json());


const start = () => {
    try {
        app.listen(port, () => {
            console.log('Server starts on port', port);
        })
    } catch (e) {
        console.log(e);
    }
}

start();




