const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
    product: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['created', 'processed'],
        default: 'created'
    }
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)