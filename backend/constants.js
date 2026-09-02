const IMAGE_URL_RE = /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i;
const URL_RE = /^https?:\/\/.+/i;
const PHONE_RE = /^\+?[1-9]\d{10,14}$/;
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const PMV_CATS = [ "e_bike", "e_scooter", "euc"] 

const PMV_CATS_LABELS = {
    e_bike: "E-bike",
    e_scooter: "E-scooter",
    euc: "Monowheel",
}

const PMV_STATUSES = ['available', 'rented', 'lost', 'maintenance'];

const ATTRIBUTE_TYPES = ["string", "number", "boolean", "enum", "multi_enum"]

module.exports = { IMAGE_URL_RE, URL_RE, PHONE_RE, EMAIL_RE, PMV_CATS, PMV_CATS_LABELS, PMV_STATUSES, ATTRIBUTE_TYPES };