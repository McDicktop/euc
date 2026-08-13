require('dotenv').config({});
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const authRouter = require("./routers/authRouter.js");
const mediaRouter = require("./routers/mediaProxy.router.js");
const pmvRouter = require("./routers/pmvRouter.js");

const port = process.env.PORT || 8080;
const db = process.env.DB_URL || "mongodb://localhost:27017/";
const app = express();

app.use(cors({
    origin: (origin, callback) => {
        const allowed = ["http://localhost:5173"];
        if(!origin || allowed.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use("/api/auth", authRouter);
app.use("/api/media", mediaRouter);
app.use("/api/pmv", pmvRouter);

console.log(mongoose.version)

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