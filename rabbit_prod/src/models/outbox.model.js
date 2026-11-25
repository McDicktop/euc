const mongoose = require("mongoose")

const outboxSchema = new mongoose.Schema({
    eventId: {
        type: String,
        required: true,
        uniqie: true
    },
    type: {
        type: String,
        required: true,
    },
    payload: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    publishedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true })

outboxSchema.index({ publishedAt: 1, createdAt: 1 })

module.exports = mongoose.model('Outbox', outboxSchema)
