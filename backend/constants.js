const IMAGE_URL_RE = /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i;
const URL_RE = /^https?:\/\/.+/i;
const PHONE_RE = /^\+?[1-9]\d{10,14}$/;
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

module.exports = { IMAGE_URL_RE, URL_RE, PHONE_RE, EMAIL_RE };