const mongoose = require("mongoose");

const CategoryAttributeSchema = new mongoose.Schema(
    {
        attribute: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Attribute",
            required: true,
        },
        required: { type: Boolean, default: false },
        min: { type: Number, default: null },
        max: { type: Number, default: null },
        order: { type: Number, default: 0 },
    },
    { _id: false },
); // почему ??

const CategorySchema = new mongoose.Schema(
    {
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        name: { type: String, required: true, trim: true, maxlength: 100 },
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null,
        },
        attributes: { type: [CategoryAttributeSchema], default: [] },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true, versionKey: false },
);

CategorySchema.pre("validate", function validateCategory(next) {
    const ids = this.attributes.map(({ attribute }) => String(attribute)); // ??????????

    if (new Set(ids).size !== ids.length)
        this.invalidate("attributes", "an attribute may occur only once");
    for (const item of this.attributes) {
        if (this.min !== null && this.max !== null && this.min > this.max) {
            this.invalidate(
                "max",
                "attribute max must be greater than or equal to min",
            );
            break;
        }
    }
    next();
});

module.exports = mongoose.model("Category", CategorySchema);
