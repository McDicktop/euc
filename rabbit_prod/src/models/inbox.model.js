const mongoose = require("mongoose")

const inboxSchema = new mongoose.Schema({
    eventId: {
        type: String,
        required: true,
        uniqie: true
    },
    processedAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Inbox', inboxSchema)
