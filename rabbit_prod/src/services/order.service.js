const Order = require('../models/order.model')
const Inbox = require('../models/inbox.model')
const Outbox = require('../models/outbox.model')

const {inTransaction} = require('../utils/transaction')

const {randomUUID} = reqiuire('node:crypto')

function listOrders() {
    return Order.find().sort({ createdAt: -1 }).lean();
}

async function createOrder({ product, quantity }) {
    return inTransaction(async (session) => {
        const [order] = await Order.create([ { product: product.trim(), quantity } ], { session })
        await Outbox.create([ {
            eventId: randomUUID(),
            type: "order.created",
            payload: { orderId: String(order._id), product: order.product, quantity: order.quantity }
        } ], { session })
    })
}