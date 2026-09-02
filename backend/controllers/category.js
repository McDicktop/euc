// 1. создать категорию
// 2. получить все категории (массив)
// 3. изменить категорию (поиск по _id)
// 4. удалить категорию (поиск по _id)

const Category = require("../models/category");
const Attribute = require("../models/attribute");
const PMV = require("../models/pmv");

const { categorySchema, validate } = require("../validators/common");
const { getCategoryWithAttributes } = require("../services/category-details");

const { makeSlug } = require("../utils/slug");
const { HttpError, asyncHandler } = require("../utils/http");

async function assertAttributesExist(items) {
    const ids = items.map(({ attribute }) => attribute);
    const found = await Attribute.countDocuments({ _id: { $in: ids } });

    if (found !== ids.length)
        throw new HttpError(422, "One or more attributes do not exists");
}

exports.list = asyncHandler(async (req, res) => {
    // const categories = (
    //     await Category.find().select("slug name parent isActive attributes")
    // ).sort({ name: 1 });
    const categories = await Category.find().select("slug name parent isActive attributes");
    res.json(categories);
});

exports.get = asyncHandler(async (req, res) => {
    const category = await getCategoryWithAttributes(req.params.id);
    res.json(category);
});

exports.getBySlug = asyncHandler(async (req, res) => {
    const category = await Category.findOne({ slug: req.params.slug }).populate(
        "attributes.attribute",
    );
    if (!category) throw new HttpError(404, "Category not found");
    res.json(category);
});

exports.create = asyncHandler(async (req, res) => {
    const payload = validate(categorySchema, req.body);
    payload.slug = makeSlug(payload.slug || payload.name);

    if (!payload.slug)
        throw new HttpError(422, "Could not build a slug for name");
    await assertAttributesExist(payload.attributes);

    const category = await Category.create(payload);
    res.status(201).json(await getCategoryWithAttributes(category.id));
});

exports.update = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) throw new HttpError(404, "category not found");

    const payload = validate(categorySchema, {
        ...category.toObject(),
        ...req.body,
    });
    payload.slug = makeSlug(payload.slug || payload.name);

    await assertAttributesExist(payload.attributes);
    Object.assign(category, payload);
    await category.save();

    res.status(200).json(await getCategoryWithAttributes(category.id));
});

// exports.replaceAttributes = asyncHandler(async (req, res) => {

// })

exports.delete = asyncHandler(async (req, res) => {
    const used = await PMV.exists({ category: req.params.id });

    if (used) {
        throw new HttpError(
            409,
            "Category is used by PMVs; deactivate it insted of deleted it",
        );
    }

    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
        throw new HttpError(404, "Category not found");
    }

    res.status(201).end();
});
