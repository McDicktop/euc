// {
//     email,
//     name,
//     password,
//     avatarUrl: default url, // аватарка - после регистрации
//     phone: optional,
//     adress: {
//         country (RF),
//         city,
//         street: Optional,
//     }, // адрес -
//     bio: Optional, // пока пустая строка ''
//     verify, // ----
//     role // admin - first user
// }

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: "",
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    address: {
        country: {
            type: String,
            default: "RF",
        },
        city: {
            type: String,
            default: "Moscow",
        },
        street: {
            type: String,
        },
    },
    bio: {
        type: String,
        default: "",
    },
    role: {
        type: String,
        defauilt: 'user',
    },
});

module.exports = mongoose.model("User", UserSchema);
