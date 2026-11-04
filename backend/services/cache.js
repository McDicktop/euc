const { createClient } = require("redis");
const crypto = require("crypto");

let client = null;
let connecting = null; // Promise || null
let lastErrorMessage = null;

const prefix = process.env.CACHE_PREFIX || "pmv";
const ttl = {
    attribute: positiveNumber(process.env.CACHE_ATTRIBUTE_TTL, 30 * 60),
    category: positiveNumber(process.env.CACHE_CATEGORY_TTL, 30 * 60),
    pmvList: positiveNumber(process.env.CACHE_PMV_LIST_TTL, 30),
};

function positiveNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function reportError(error) {
    const message = error?.message || String(error);

    if (message === lastErrorMessage) return;

    lastErrorMessage = message;
    console.warn(`Redis unavailable, using DB directly: ${message}`);
}

async function connectRedis() {
    if (!process.env.REDIS_URL) return false;
    if (client?.isReady) return true;
    if (connecting) return connecting;

    client = createClient({
        url: process.env.REDIS_URL,
        disableOfflineQueue: true, // еще раз напомни что это значит?
        socket: {
            connectionTimeout: 2000,
            reconnectStrategy(retries) {
                return retries < 3 ? Math.min(200 * 2 ** retries, 1000) : false;
            },
        },
    });

    client.on("error", reportError);

    connecting = client
        .connect() // магия
        .then(() => {
            lastErrorMessage = null;
            console.log("Redis cache connected");
            return true;
        })
        .catch((error) => {
            console.log(error);
            reportError(error);
            return false;
        })
        .finally(() => {
            connecting = null;
        });

    return connecting;
}

//Работа connectRedis()

//При первом вызове connectRedis() строки 29-31 выполняются

//Далее client = .... Создается конфигурация

//Строка 44 вешаем слушатель события “error” на client ??

//Далее присваиваем connection = client.connect() (который возвращает промис)
//(если мы вызовем connectRedis() в этот момент, она завершится на 31 строке)

//Что-то неведомое начинает происходить (подключение к редис) , затем выполнится либо then либо catch и затем  finally((() => {connecting =  null}) и connectRedis завершит работу (свой первый вызов) вернув connecting = null

//При повторном вызове connectRedis() (если соединение уже есть)  она завершится на 30 строке (connecting = null, но client уже не промис, а результат выполнения асинхронных действий и уже существует client.isReady)

// (При повторном вызове connectRedis() (если соединения еще нет, все как при первом вызове) )

//А в результате асинхронных действий мы либо получим ошибку (не создадим магию соединения с редис, лишь выполним блок catch, finally и т.д.)
//Либо выполним блок then в котором обнулим lastErrorMessage = null, напишем в консоль об успехе и просто вернем true (далее finally и т.д.)

async function closeRedis() {
    /// промис
    if (!client?.isOpen) return;

    try {
        await client.close();
    } catch {
        client.destroy();
    }
}

function isReady() {
    return Boolean(client?.isReady);
}

function key(value) {
    return `${prefix}:${value}`;
}

function queryKey(cachePrefix, query) {

    // console.log(query)
    // console.log(Object.entries(query))

    const normalized = Object.entries(query)
        .sort(([key_1], [key_2]) => key_1.localeCompare(key_2))
        .map(([name, value]) => [name, Array.isArray(value) ? [...value].sort() : String(value)])
    const hash = crypto.createHash("sha256").update(JSON.stringify(normalized)).digest("hex").slice(0, 32)
    return `${cachePrefix}:${hash}`;
}

// {
//     key: value
// }

// [[key, value]]

async function getJson(cacheKey) {
    if (!isReady()) return null;

    try {
        const value = await client.get(key(cacheKey));
        return value == null ? null : JSON.parse(value);
    } catch (error) {
        reportError(error);
        return null;
    }
}

async function setJson(cacheKey, value, seconds) {
    if (!isReady()) return false;

    try {
        await client.set(key(cacheKey), JSON.stringify(value), { EX: seconds });
        return true;
    } catch (error) {
        reportError(error);
        return false;
    }
}

async function remember(cacheKey, seconds, operation) {
    const cached = await getJson(cacheKey);

    if (cached !== null) return cached;

    const value = await operation();

    await setJson(cacheKey, value, seconds);
    return value;
}

async function remove(...cacheKeys) {
    if (!isReady()) return false;

    const keys = cacheKeys.filter((el) => Boolean(el)).map((el) => key(el));
    if (!keys.length) return true;

    try {
        await client.del(keys);
        return true;
    } catch (error) {
        reportError(error);
        return false;
    }
}

async function removeByPrefix(cachePrefix) {
    if (!isReady()) return false;

    // pmv*
    // 1000

    // 0 "pmv:attributes:1" -> 10
    // "pmv:attributes:list" -> 11
    // ...
    // 100 pmv:categories:list -> 11
    // pmv:attributes:3 -> 12
    // pmv:attributes:new -> 13
    // car:category:1 -> 14
    // car:category:2 -> 15
    // car:category:3 -> 16

    // pmv:

    // 0
    // 100

    let cursor = 0;

    try {
        do {
            const reply = await client.scan(cursor, {
                MATCH: `${key(cachePrefix)}*`,
                COUNT: 100,
            });
            cursor = reply.cursor;
            if (reply.keys.length) await client.del(reply.keys);
        } while (cursor !== 0);

        // for await (const keys of client.scanIterator({
        //     MATCH: `${key(cachePrefix)}*`,
        //     COUNT: 100,
        // })) {
        //     // ???????????
        //     if (keys.length) await client.del(keys);
        // }
        return true;
    } catch (error) {
        reportError(error);
        return false;
    }
}

module.exports = {
    connectRedis,
    closeRedis,
    isReady,
    getJson,
    setJson,
    remove,
    removeByPrefix,
    ttl,
    queryKey,
    remember,
};
