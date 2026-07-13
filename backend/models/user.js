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
const { PHONE_RE, EMAIL_RE } = require("../constants.js")

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        lowercase: true,
        validate: {
            validator: (e) => EMAIL_RE.test(e),
            message: "EMAIL is invalid",
        },
        maxlength: [64, "EMAIL length must not exceed 64 characters"],
        required: [true, "EMAIL required"],
        unique: true,
    },
    name: {
        type: String,
        trim: true,
        maxlength: [64, "NAME length must not exceed 64 characters"],
        required: [true, "NAME required"],
    },
    password: {
        type: String,
        trim: true,
        maxlength: [128, "PASSWORD length must not exceed 128 characters"],
        minlength: [6, "PASSWORD length must exceed 6 characters"],
        required: [true, "PASSWORD required"],
    },
    avatar: {
        type: String,
        default: "",
    },
    phone: {
        type: String,
        unique: true,
        sparse: true,
        validate: {
            validator: (p) => PHONE_RE.test(p),
            message: "PHONE is invalid",
        },
    },
    address: {
        country: {
            type: String,
            trim: true,
            default: "RF",
        },
        city: {
            type: String,
            trim: true,
            default: "Moscow",
        },
        street: {
            type: String,
            trim: true,
            maxlength: [128, "ADDRESS.STREET length must not exceed 128 characters"],
        },
    },
    bio: {
        type: String,
        trim: true,
            maxlength: [1024, "BIO length must not exceed 1024 characters"],
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        required: [true, "ROLE required"],
        default: 'user',
    },
        refreshTokenHash: {
        type: String,
        required: false,
        default: null
    }
});

module.exports = mongoose.model("User", UserSchema);
