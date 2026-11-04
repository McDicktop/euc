const Joi = require("joi");
const Category = require("../models/category");
const { HttpError } = require("../utils/http");

const cache = require("./cache");

function buildField(attribute, categoryAttribute) {
    let field;

    switch (attribute.type) {
        case "number":
            field = Joi.number();
            if ((categoryAttribute.min ?? attribute.min) !== null)
                field.min(categoryAttribute.min ?? attribute.min);
            if ((categoryAttribute.max ?? attribute.max) !== null)
                field.max(categoryAttribute.max ?? attribute.max);
            break;

        case "boolean":
            field = Joi.boolean();
            break;

        case "enum":
            field = Joi.string().valid(...attribute.options);
            break;

        case "multi_enum":
            field = Joi.array()
                .items(Joi.string().valid(...attribute.options))
                .unique();
            break;

        default:
            field = Joi.string().trim().max(500);
    }

    return categoryAttribute.required ? field.required() : field.optional();
}

function buildDetailsSchema(category) {
    const shape = {};

    for (const categoryAttribute of category.attributes) {
        const attribute = categoryAttribute.attribute;
        if (!attribute || attribute.deprecated) continue;
        shape[attribute.key] = buildField(attribute, categoryAttribute);
    }

    return Joi.object(shape).options({ abortEarly: false, stripUnknown: true });
}

async function getCategoryWithAttributes(id) {
    return cache.remember(
        `category:id:${String(id)}`,
        cache.ttl.category,
        async () => {
            const category = await Category.findById(id).populate(
                "attributes.attribute",
            );
            if (!category) throw new HttpError(404, "Category not found");
            return category;
        },
    );
}

async function getCategoryWithAttributesBySlug(slug) {
    return cache.remember(
        `category:slug:${String(slug)}`,
        cache.ttl.category,
        async () => {
            const category = await Category.findOne({ slug }).populate(
                "attributes.attribute",
            );
            if (!category) throw new HttpError(404, "Category not found");
            return category;
        },
    );
}

// DB

// {id: 1, slug: example_1}
// {id: 3, slug: example_3}

// REDIS
// category:id:1 = {}
// category:slug:example_1 = {}

// category:id:3 = {}
// category:slug:example_3 = {}

async function invalidateCategoryCache({ id, slugs = [] } = {}) {
    await Promise.all([
        cache.remove(
            "categories:list",
            id && `category:id:${String(id)}`,
            ...slugs.filter(Boolean).map((slug) => `category:slug:${slug}`),
        ),
        cache.removeByPrefix("pmvs:list:"),
    ]);
}

async function invalidateAllCategoryCaches() {
    await Promise.all([
        cache.remove("categories:list"),
        cache.removeByPrefix("category:"),
        cache.removeByPrefix("pmvs:list:"),
    ]);
}

async function validateDetails(categoryId, details) {
    const category = await getCategoryWithAttributes(categoryId);
    if (!category.isActive) throw new HttpError(409, "Category is inactive");

    const { value, error } = buildDetailsSchema(category).validate(details);

    if (error)
        throw new HttpError(
            422,
            "Invalid category detsails",
            error.details.map(({ message, path }) => ({ path, message })),
        );

    return value;
}

module.exports = {
    buildField,
    getCategoryWithAttributes,
    getCategoryWithAttributesBySlug,
    validateDetails,
    invalidateAllCategoryCaches,
    invalidateCategoryCache,
};
