const { Router } = require('express')
const { createOrder, listOrders } = require('../controllers/order.controller')

const router = Router()

router.get('/', listOrders)
router.post('/', createOrder)

module.exports = router;