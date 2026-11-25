const sleep = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms)
})

async function retry(label, operation) {
    for(;;) {
        try {
            return await operation();
        } catch (error) {
            console.log(`${label}: ${error.message}. Повтор через 3 секунды`);
            await sleep(3000);
        }
    }
}

module.exports = { sleep, retry }