const amqp = require("amqplib");

const RABBIT_URL = 'amqp://admin:admin123@localhost:5672'
const QUEUE = "orders"

const sleep = (ms) => new Promise(
    (resolve) => {
        setTimeout(resolve, ms)
    }
)

async function start() {
    const connection = await amqp.connect(RABBIT_URL)
    channel = await connection.createChannel()

    await channel.assertQueue(QUEUE, { durable: true })

    // Ограничение по количеству сообщения от брокера за раз
    channel.prefetch(10);

    console.log("Consumer ждет сообщений...")

    channel.consume(QUEUE, async(msg) => {
        if(!msg) return;

        const order = JSON.parse(msg.content.toString());
        console.log(`ПОлучен заказ #${order.id}, обрабатываю...`)
        
        try {
            await sleep(5000);
            console.log(`Заказ #${order.id} готов, письмо отправлено на почти ${order.email}`)
            
            // ack - я обработал сообщение, можешь удалять из очереди (+диска)
            channel.ack(msg);
        } catch (error) {
            console.log(`Ошибка при обработке заказ #${order.id}`, err.message)
            // msg
            // all up to - false - отмена только текущего сообщения
            // requeu - false - повторно в очередь сообщение не надо вставлять
            channel.nack(msg, false, false)
        }
    })
}

start().catch((err) => {
    console.log("Consumer не смог запуститься");
    process.exit(1)
})