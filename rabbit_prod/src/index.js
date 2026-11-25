const { port } = require("./config")
const { createApp } = require("./app")
const { connectMongo } = require("./config/mongo")
const { connectRabbit } = require("./config/rabbit")

const { startOrderConsumer } = require("./consumers/order.consumer")
const { runOutboxWorker } = require("./workers/order.worker")

async function main() {
    await connectMongo();
    const { publisher, consumer } = await connectRabbit()

    await startOrderConsumer(consumer)
    runOutboxWorker(publisher).catch((error) => {
        console.log(error);
        process.exit(1)
    })

    createApp().listen(port, () => {
        console.log(`HTTP: http://localhost:${port}`)
    })
}
