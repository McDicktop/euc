const Joi = require("joi");
const { ATTRIBUTE_TYPES, PMV_STATUSES } = require("../constants");

const objectId = Joi.string().hex().length(24);

const attributeSchema = Joi.object({
    key: Joi.string()
        .pattern(/^[a-z][a-zA-Z0-9_]*$/)
        .max(64)
        .required(),
    label: Joi.string().trim().max(100).required(),
    type: Joi.string()
        .valid(...ATTRIBUTE_TYPES)
        .required(),
    unit: Joi.string().trim().max(30).allow(null, "").default(null),
    options: Joi.array().items(Joi.string().trim().max(100)).unique(),
    min: Joi.number().allow(null),
    max: Joi.number().allow(null),
    filterable: Joi.boolean().default(false),
    deprecated: Joi.boolean().default(false),
});

const categoryAttributeSchema = Joi.object({
    attribute: objectId.required(),
    required: Joi.boolean().default(false),
    min: Joi.number().allow(null),
    max: Joi.number().allow(null),
    order: Joi.number().integer().min(0).default(0),
});

const categorySchema = Joi.object({
    slug: Joi.string().trim().max(100).optional(),
    name: Joi.string().trim().max(100).required(),
    parent: objectId.allow(null).default(null),
    attributes: Joi.array()
        .items(categoryAttributeSchema)
        .unique("attribute")
        .default([]),
    isActive: Joi.boolean().default(true),
});

const pmvCreateschema = Joi.object({
    slug: Joi.string().trim().min(1).max(64).required(),
    name: Joi.string().trim().min(4).max(100).required(),
    description: Joi.string().allow("").max(2000).required(),
    defaultPricePerHour: Joi.number().min(1).max(3000).required(),
    defaultPricePerDay: Joi.number().min(1).max(30000),
    deposit: Joi.number().min(0).max(500000),
    isActive: Joi.boolean().default(false),
    images: Joi.object({
        coverKey: Joi.string().required(),
        gallery: Joi.array().items(Joi.string()).default([]),
    }),
    category: objectId.required(),
    details: Joi.object().default({}),
    status: Joi.string()
        .valid(...PMV_STATUSES)
        .default("available"),
    serialNumber: Joi.string().trim().min(8).max(32).required(),
    mileage: Joi.number().min(0).max(5000000).required(),
    hasControllerChanged: Joi.boolean().default(false),
    locaton: Joi.object({
        type: Joi.string().valid("Point").default("Point"),
        coordinates: Joi.array().items(Joi.number()).length(2).default([0, 0]),
    }).default({}),
    userId: objectId.required(),
});

const pmvUpdateSchema = Joi.object({
    slug: Joi.string().trim().min(1).max(64),
    name: Joi.string().trim().min(4).max(100),
    description: Joi.string().allow("").max(2000),
    defaultPricePerHour: Joi.number().min(1).max(3000),
    defaultPricePerDay: Joi.number().min(1).max(30000),
    deposit: Joi.number().min(0).max(500000),
    isActive: Joi.boolean(),
    images: Joi.object({
        coverKey: Joi.string().required(),
        gallery: Joi.array().items(Joi.string()).default([]),
    }),
    category: objectId,
    details: Joi.object(),
    status: Joi.string().valid(...PMV_STATUSES),
    serialNumber: Joi.string().trim().min(8).max(32),
    mileage: Joi.number().min(0).max(5000000),
    hasControllerChanged: Joi.boolean(),
    locaton: Joi.object({
        type: Joi.string().valid("Point"),
        coordinates: Joi.array().items(Joi.number()).length(2),
    }).default({}),
});

function validate(schema, value) {
    const { value: parsed, error } = schema.validate(value, {
        abortEarly: false,
        stripUnknown: true,
    });
    if (error) error.status = 422;
    return parsed;
}

module.exports = { objectId, validate, attributeSchema, pmvCreateschema, pmvUpdateSchema, categorySchema };

// {parsed, error} = categorySchema.validate({ }, sdfsdf)
