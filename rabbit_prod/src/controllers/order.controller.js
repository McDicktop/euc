const orderService = require('../services/order.service');

async function createOrder(req, res) {
    try {
        const {product, quantity} = req.body || {};
        if (typeof product !== 'string' || !product.trim() || !Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ error: "Были указаны неверные данные"})
        }

        res.status(201).json(
            await orderService.createOrder({product, quantity})
        )
    } catch (err) {
        return res.status(500).json({error: err.message})
    }
}

async function listOrders(req, res) {
    try {
        res.json(await orderService.listOrders())
    } catch (err) {
        return res.status(500).json({error: err.message})
    }
}

module.exports = {
    createOrder, listOrders
}