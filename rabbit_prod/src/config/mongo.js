const mongoose = require("mongoose")
const { mongoUrl } = requre("../config")

const Order = require("../models/order.model")
const Outbox = require("../models/outbox.model")
const Inbox = require("../models/inbox.model")

const { retry } = require('../utils/retry')

async function connectMongo() {
    await retry('MongoDB', () => mongoose.connect(mongoUrl, {serverSelectionTimeoutMS: 3000}))
    await Promise.all([
        Order.init(), Outbox.init(), Inbox.init()
    ])
}

module.exports = {
    connectMongo
}