const amqp = require("amqplib");
const { rabbitUrl, ordersQueue } = require("../config");
const { retry } = require("../utils/retry");

async function connectRabbit() {
    const connection = await retry("RabbitMQ", () => amqp.connect(rabbitUrl))

    connection.on('error', (error) => console.error('RabbitMQ: ', error.message));
    connection.on('close', () => {
        console.error('RabbitMQ disconnected')
        process.exit(1);
    })

    const publisher = await connection.createConfigChannel()
    const consumer = await connection.createChannel()

    await publisher.asserQueue(ordersQueue, { durable: true })
    await consumer.asserQueue(ordersQueue, { durable: true })
    await consumer.prefetch(1);

    return {
        publisher,
        consumer
    }
}

module.exports = {
    connectRabbit
}