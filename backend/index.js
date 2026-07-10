require('dotenv').config({});
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRouter = require("./routers/authRouter.js");
const mediaRouter = require("./routers/mediaProxy.router.js");

const port = process.env.PORT || 8080;
const db = process.env.DB_URL || "mongodb://localhost:27017/";
const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", authRouter);
app.use("/media", mediaRouter);


const start = async () => {
    try {
        await mongoose.connect(db);
        console.log('Connected to database successfully');
        app.listen(port, () => {
            console.log('Server starts on port', port);
        })
    } catch (e) {
        console.log(e);
    }
}

start();