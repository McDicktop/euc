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

}

async function getCategoryWithAttributes(id) {
    const category = await Category.findById(id).populate("attributes.attribute");
    if(!category) throw new HttpError(404, "Category not found");
    return category;
}

async function validateDetails(categoryId, details) {

}

module.exports = { buildField, getCategoryWithAttributes, validateDetails };
