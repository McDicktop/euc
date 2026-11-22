const express = require("express")
const amqp = require("amqplib");

const RABBIT_URL = 'amqp://admin:admin123@localhost:5672'
const QUEUE = "orders"

const app = express()
app.use(express.json())


// Канал через который будем общаться с rabbit
let channel;

async function connectRabbit() {
    const connection = await amqp.connect(RABBIT_URL)
    channel = await connection.createChannel()

    // durable - параметр который указывает что очередь переживет перезапуск rabbit
    await channel.assertQueue(QUEUE, { durable: true })

    console.log("Connected to RabbitMQ");
}

app.post('/orders', (req, res) => {
    const order = {
        id: Date.now(),
        items: req.body.items || [],
        email: req.body.email || "no-email"
    };

    channel.sendToQueue(
        QUEUE,
        Buffer.from(JSON.stringify(order)),
        { persistent: true }
    )

    res.status(202).json({
        message: "Заказ принят в обработку",
        orderId: order.id
    })
})

connectRabbit()
    .then(() => {
        app.listen(5050, () => {
            console.log('Server is up')
        })
    }).catch((err) => {
        console.log("Не удалось подключиться к Rabbit", err.message);
        process.exit(1)
    })