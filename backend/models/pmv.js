
const { PMV_CATS } = require("../constants.js");

const mongoose = require("mongoose");

const PMVSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: PMV_CATS,
    },
    coverUrl: {
        type: String,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
});

module.exports = mongoose.model("PMV", PMVSchema);
