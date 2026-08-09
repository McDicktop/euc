const { PMV_CATS, PMV_STATUSES } = require("../constants.js");

const mongoose = require("mongoose");

const PMVSchema = new mongoose.Schema(
    {
        slug: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        defaultPricePerHour: {
            type: Number,
            required: true,
        },
        defaultPricePerDay: {
            type: Number,
        },
        deposit: Number,
        isActive: {
            // про объявление
            type: Boolean,
            default: false,
        },
        images: {
            coverKey: {
                type: String,
                required: true,
            },
            gallery: [],
        },

        category: {
            type: String,
            required: true,
            enum: PMV_CATS,
        },
        status: {
            type: String,
            enum: PMV_STATUSES,
            default: "available",
        }, // статус объявление

        // статус транспорта

        // Доп свойства
        // details: {
        //     serialNumber: {
        //         type: string,
        //     },
        //     specs: {
        //         type: mongoose.Schema.Types.Mixed,
        //         default: {}
        //     }
        // },

        serialNumber: {
            type: String,
        },
        mileage: {
            type: Number,
        },
        hasControllerChanged: {
            type: Boolean,
            default: false,
        },
        weight: {
            type: Number,
        },

        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number], // [lng, lat]
                default: [0, 0],
            },
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model("PMV", PMVSchema);

//
