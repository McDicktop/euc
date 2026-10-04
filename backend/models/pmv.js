const { PMV_STATUSES } = require("../constants.js");
const mongoose = require("mongoose");

const PMVSchema = new mongoose.Schema(
    {
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            maxlength: 64,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 4,
            maxlength: 100,
        },
        description: { type: String, required: true, maxlength: 1000 },
        defaultPricePerHour: {
            type: Number,
            required: true,
            min: 1,
            max: 3000,
        },
        defaultPricePerDay: { type: Number, min: 1, max: 30000 },
        deposit: { type: Number, min: 0, max: 500000 },
        isActive: { type: Boolean, default: true },
        images: {
            coverKey: { type: String, required: true },
            gallery: { type: [String], default: [] },
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
            index: true,
        },
        details: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} }, //  ??????????????????????????????????
        status: {
            type: String,
            enum: PMV_STATUSES,
            default: "available",
            index: true,
        },
        serialNumber: {
            type: String,
            required: true,
            trim: true,
            minlength: 8,
            maxlength: 32,
        },
        mileage: { type: Number, required: true, min: 0, max: 500000 },
        hasControllerChanged: { type: Boolean, default: false },
        location: {
            type: { type: String, enum: ["Point"], default: "Point" },
            coordinates: { type: [Number], default: [0, 0] },
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true, versionKey: false },
);

PMVSchema.index({ category: 1, status: 1, isActive: 1 });
PMVSchema.index({ location: "2dsphere" });
PMVSchema.index({ "details.$**": 1 });

module.exports = mongoose.model("PMV", PMVSchema);
