const { createClient } = require("redis");
const crypto = require("crypto");

let client = null;
let connecting = null; // Promise || null
let lastErrorMessage = null;

const prefix = process.env.CACHE_PREFIX || "pmv";
const ttl = {
    category: positiveNumber(process.env.CACHE_CATEGORY_TTL, 30 * 60),
    pmvList: positiveNumber(process.env.CACHE_PMV_LIST_TTL, 30),
}

function positiveNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function reportError(error) {
    const message = error?.message || String(error);

    if(message === lastErrorMessage) return;

    lastErrorMessage = message;
    console.warn(`Redis unavailable, using DB directly: ${message}`);
}

async function connectRedis() {
    if(!process.env.REDIS_URL) return false;
    if(client?.isReady) return true;
    if(connecting) return connecting;

    client = createClient({
        url: process.env.REDIS_URL,
        disableOfflineQueue: true,
        socket: {
            connectionTimeout: 2000,
            reconnectStrategy(retries) {
                return retries < 3 ? Math.min(200 * 2 ** retries, 1000) : false
            }
        }
    })

    client.on("error", reportError)

    connecting = client.connect()
        .then(() => {
            lastErrorMessage = null;
            console.log("Redis cache connected")
            return true;
        })
        .catch((error) => {
            reportError(error);
            return false;
        })
        .finally(() => {
            connecting = null;
        })

    return connecting;
}

async function closeRedis() {
    if(!client?.isOpen) return;

    try{
        await client.close();
    } catch {
        client.destroy();
    }
}

function isReady() {
    return Boolean(client?.isReady);
}

function key(value) {
    return `${prefix}:${value}`
}

async function getJson(cacheKey) {
    if(!isReady()) return null;

    try {
        const value = await client.get(key(cacheKey))
        return value == null ? null : JSON.parse(value)
    } catch (error) {
        reportError(error);
        return null;
    }
}

async function setJson(cacheKey, value, seconds) {
    if(!isReady()) return false;

    try {
        await client.set(key(cacheKey), JSON.stringify(value), { EX: seconds });
        return true
    } catch (error) {
        reportError(error);
        return false;
    }
}

async function remove(...cacheKeys) {
    if(!isReady()) return false;

    const keys = cacheKeys.filter((el) => Boolean(el)).map(el => key(el));
    if(!keys.length) return true;

    try {
        await client.del(keys);
        return true;
    } catch (error) {
        reportError(error);
        return false;
    }
}

async function removeByPrefix(cachePrefix) {
    if(!isReady()) return false;

    try {
        for await (const keys of client.scanIterator({ MATCH: `${key(cachePrefix)}*`, COUNT: 100})) {
            if (keys.length) await client.del(keys);
        }
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
}