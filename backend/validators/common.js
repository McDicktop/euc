const Joi = require("joi");
const { ATTRIBUTE_TYPES, PMV_STATUSES } = require("../constants");

const objectId = Joi.string().hex().length(24);

const attributeSchema = Joi.object({
    key: Joi.string().pattern(/^[a-z][a-zA-Z0-9_]*$/).max(64).required(),
    label: Joi.string().trim().max(100).required(),
    type: Joi.string().valid(...ATTRIBUTE_TYPES).required(),
    unit: Joi.string().trim().max(30).allow(null, "").default(null),
    options: Joi.array().items(Joi.string().trim().max(100)).unique(),
    min: Joi.number().allow(null),
    max: Joi.number().allow(null),
    filterable: Joi.boolean().default(false),
    deprecated: Joi.boolean().default(false),
})

const categoryAttributeSchema = Joi.object({
    attribute: objectId.required(),
    required: Joi.boolean().default(false),
    min: Joi.number().allow(null),
    max: Joi.number().allow(null),
    order: Joi.number().integer().min(0).default(0),
})

const categorySchema = Joi.object({
    slug: Joi.string().trim().max(100).optional(),
    name: Joi.string().trim().max(100).required(),
    parent: objectId.allow(null).default(null),
    attributes: Joi.array().items(categoryAttributeSchema).unique("attribute").default([]),
    isActive: Joi.boolean().default(true),
})

function validate(schema, value) {
    const { value: parsed, error } = schema.validate(value, { abortEarly: false, stripUnknown: true });
    if (error) error.status = 422;
    return parsed;
}

module.exports = { objectId, validate, attributeSchema, categorySchema }


// {parsed, error} = categorySchema.validate({ }, sdfsdf)    