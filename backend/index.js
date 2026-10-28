require('dotenv').config({});
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const { connectRedis, closeRedis } = require("./services/cache");

const authRouter = require("./routers/authRouter.js");
const mediaRouter = require("./routers/mediaProxy.router.js");
const pmvRouter = require("./routers/pmvRouter.js");
const attributeRouter = require("./routers/attributes.js");
const categoryRouter = require("./routers/categories.js");

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

app.use("/api/pmvs", pmvRouter);
app.use("/api/attributes", attributeRouter);
app.use("/api/categories", categoryRouter);

const start = async () => {
    try {
        await mongoose.connect(db);
        console.log('Connected to database successfully');

        connectRedis().catch(() => {});

        const server = app.listen(port, () => {
            console.log('Server starts on port', port);
        })

        const shutdown = async () => {
            server.close();
            await Promise.allSettled([closeRedis(), mongoose.disconnect()])
        }

        // process.on("SIGINT", (prc) => shutdown(prc))
        process.on("SIGINT", shutdown) // Ctrl + C
        process.on("SIGTERM", shutdown) // Docket stop, kill <pid>
    } catch (e) {
        console.log(e);
    }
}

start();

// req -> cache -> mongo



// {
//     "key": value(any)
// }

// [
//     0: any,
//     1: any,
//     2: any,
//     3: any,
// ]

// {"key": index}

// str["key"] -> index -> array[index]


// 
// 
// 
// 



// email.send_email@gmail.com(type, code)
// db
// api


// categories:e-scooter (attrs) - 1d

// categories:list - 15min
// attribtes:list - 15min

// pmv:list:category=e_scooter&page=1 (10s)



// 10 000

// 1 -> (250ms + 200ms + 250ms) = 700ms
// 1 -> 2s (250ms + 400ms + 500ms + 250ms) = 1.5s


// rate-limit:rps (Infinity)
// rate-limit:rpm (Infinity)
// rate-limit:create-pmv (Infinity)


