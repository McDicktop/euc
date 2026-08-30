const slugify = require("slugify");

function makeSlug(value) {
    return slugify(value, { lower: true, strict: true, locale: "ru", trim: true })
}

modules.exports = { makeSlug };



// s - единства ответственности

// o - отрытость закрытость 

// l - барбары лискоу 

// i - разделения интерфейсов

// d - принцип обратной зависимости 



