const mongoose = require("mongoose");
const { ATTRIBUTE_TYPES } = require("../constants");
const { options } = require("joi");

const AttributeSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            match: /^[a-z][a-zA-Z0-9_]*$/,
            immutable: true,
        },
        label: { type: String, required: true, trim: true, maxlength: 100 },
        type: {
            type: String,
            required: true,
            enum: ATTRIBUTE_TYPES,
            immutable: true,
        },
        unit: { type: String, trim: true, maxlength: 30, default: null },
        options: { type: [String], default: undefined },
        min: { type: Number, default: null },
        max: { type: Number, default: null },
        filterable: { type: Boolean, default: false },
        deprecated: { type: Boolean, default: false },
    },
    // { timestamps: true, versionKey: true },
    { timestamps: true },
);

// AttributeSchema.pre("validate", function validateAttribute(next) {
AttributeSchema.pre("validate", function validateAttribute() {
    const needsOptions = this.type === "enum" || this.type === "multi_enum";

    if (needsOptions && (!this.options || this.options.length === 0)) {
        this.invalidate(
            "options",
            "options are required for enum and multi_enum attributes",
        );
    }
    if (!needsOptions && this.options?.length) {
        this.invalidate(
            "options",
            "options are only allowed for enum and multi_enum attributes",
        );
    }
    if (this.min !== null && this.max !== null && this.min > this.max) {
        this.invalidate("max", "max must be greater than or equal to min");
    }

    // next();
});

module.exports = mongoose.model("Attribute", AttributeSchema);

// const attributes = [
//     {
//         key: "pwr",
//         label: "Power",
//         type: "number",
//         unit: "W",
//         options: undefined,
//         min: 0,
//         max: 20000,
//         filterable: false,
//         deprecated: false,
//     },
//     {
//         key: "capacity",
//         label: "Capacity",
//         type: "number",
//         unit: "WH",
//         options: undefined,
//         min: 0,
//         max: 200000,
//         filterable: false,
//         deprecated: false,
//     },
//     {
//         key: "clr",
//         label: "Color",
//         type: "string",
//         unit: null,
//         options: ["White","Black","Red","Green","Yellow","","","","","","","","","","","",],
//         min: null,
//         max: null,
//         filterable: false,
//         deprecated: false,
//     },
// ];
