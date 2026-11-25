module.exports = {
    mongoUrl: 'mongodb://localhost:27017/rabbit_example',
    rabbitUrl: 'amqp://admin:admin123@localhost:5672',
    port: 8080,
    ordersQueue: 'orders.created'
}