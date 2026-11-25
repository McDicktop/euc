const express = require("express")
const orderRoute = require("./routes/order.route")

function createApp() {
    const app = express()
    app.use(express.json())
    app.use('/orders', orderRoute)

    return app;
}

module.exports = { createApp }