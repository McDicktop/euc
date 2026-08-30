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
        isActive: { type: Boolean, default: false },
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

// const newPmw = {
//     slug: "", // ??????????
//     name: "Inmotion v14",
//     description: "Сдам в аренду свое моноколесо...",
//     defaultPricePerHour: 300,
//     defaultPricePerDay: 2000,
//     deposit: 50000,
//     isActive: true,
//     images: {
//         coverKey: "dfgdfgdfgdfgfd.jpg",
//         gallery: [],
//     },
//     details: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} }, //  ??????????????????????????????????
//     status: "available",
//     serialNumber: "12374GH34343",
//     mileage: 12600,
//     hasControllerChanged: false,
//     location: {
//         type: "Point",
//         coordinates: [34340, 23423],
//     },
//     userId: "sdfsdfq3434sdfjkfsd3423",
//     category: {
//         slug: "euc",
//         name: "Electric Unicycle",
//         parent: "euc", // ??????????????
//         attributes: [
//             {
//                 key: "pwr",
//                 label: "Power",
//                 type: "number",
//                 unit: "W",
//                 options: undefined,
//                 min: 0,
//                 max: 20000,
//                 filterable: false,
//                 deprecated: false,
//             },
//             {
//                 key: "capacity",
//                 label: "Capacity",
//                 type: "number",
//                 unit: "WH",
//                 options: undefined,
//                 min: 0,
//                 max: 200000,
//                 filterable: false,
//                 deprecated: false,
//             },
//             {
//                 key: "clr",
//                 label: "Color",
//                 type: "string",
//                 unit: null,
//                 options: [
//                     "White",
//                     "Black",
//                     "Red",
//                     "Green",
//                     "Yellow",
//                     "",
//                     "",
//                     "",
//                     "",
//                     "",
//                     "",
//                     "",
//                     "",
//                     "",
//                     "",
//                     "",
//                 ],
//                 min: null,
//                 max: null,
//                 filterable: false,
//                 deprecated: false,
//             },
//         ],
//         isActive: true,
//     },
// };

// {
//     slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
//     name: { type: String, required: true, trim: true, maxlength: 100 },
//     parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
//     attributes: { type: [CategoryAttributeSchema], default: []},
//     isActive: { type: Boolean, default: true }
