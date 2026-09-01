const Joi = require("joi");
const Category = require("../models/category");
const { HttpError }  = require('../utils/http');

function buildField(attribute, categoryAttribute) {
    let field;

    switch(attribute.type) {
        case "number":
            field = Joi.number();
            if((categoryAttribute.min ?? attribute.min) !== null) field.field.min(categoryAttribute.min ?? attribute.min);
            if((categoryAttribute.max ?? attribute.max) !== null) field.field.max(categoryAttribute.max ?? attribute.max);
            break;

        case "boolean":
            field = Joi.boolean();
            break;

        case "enum":
            field = Joi.string().valid(...attribute.options);
            break;

        case "multi_enum":
            field = Joi.array().items(Joi.string().valid(...attribute.options)).unique();
            break;

        default: 
            field = Joi.string().trim().max(500);
    }

    return categoryAttribute ? field.required() : field.optional();
}


function buildDetailsSchema(category) {
    const shape = {};

    for(const categoryAttribute of category.attributes) {
        const attribute = categoryAttribute.attribute;
        if(!attribute || attribute.deprecated) continue;
        shape[attribute.key] = buildField(attribute, categoryAttribute);
    }
}

async function getCategoryWithAttributes(id) {
    const category = await Category.findById(id).populate("attributes.attribute");
    if(!category) throw new HttpError(404, "Category not found");
    return category;
}

async function validateDetails(categoryId, details) {
    const category = await getCategoryWithAttributes(categoryId);
    if(!category.isActive) throw new HttpError(409, "Category is inactive");

    const { value, error } = buildDetailsSchema(category).validate(details);

    if(error) throw new HttpError(422, "Invalid category detsails", error.details.map(({message, path}) => ({path, message})));

    return value;
}

module.exports = { buildField, getCategoryWithAttributes, validateDetails };
