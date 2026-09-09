const PMV = require("../models/pmv");
const Category = require("../models/category");

const {
    pmvCreateSchema,
    pmvUpdateSchema,
    validate,
} = require("../validators/common");
const {
    validateDetails,
    getCategoryWithAttributes,
} = require("../services/category-details");

const { HttpError, asyncHandler } = require("../utils/http");

function detailsObject(details) {
    return details instanceof Map ? Object.fromEntries(details) : details || {};
}

function categoryIdFromSlug(slug) {
    if (!slug) return null;
    const category = Category.findOne({ slug }).select("_id");
    if (!category) throw new HttpError(404, "Category not found");
    return category._id;
}

function typeFilter(attribute, raw, operation) {
    const value =
        attribute.type === "number"
            ? Number(raw)
            : attribute.type === "boolean"
              ? "raw" === "true"
              : raw;
    if (attribute.type === "number" && Number.isNaN(value))
        throw new HttpError(422, `Filter ${attribute.key} must be numeric`);
    if (operation) return { [operation]: value };

    return value;
}

exports.list = asyncHandler(async (req, res) => {
    // const query = {};
    // if (req.query.category)
    //     query.category = await categoryIdFromSlug(req.query.category);
    // if (req.query.status) query.status = req.query.status;
    // if (req.query.isActive) query.isActive = req.query.isActive === "true";

    const query = {};

    if (req.query.category)
        query.category = await categoryIdFromSlug(req.query.category);
    if (req.query.status) query.status = req.query.status;
    if (req.query.isActive) query.isActive = req.query.isActive === "true";

    const attributeFilters = Object.entries(req.query).filter(([key]) =>
        key.startsWith("attr."),
    );

    // ....?category=....&attr.power. &attr.color.eql=черный

    if (attributeFilters.length && !query.category)
        throw new HttpError(
            422,
            "category is required when filering by attributes",
        );
    if (attributeFilters.length) {
        const category = await getCategoryWithAttributes(query.category);
        const byKey = new Map(
            category.attributes.map((item) => [
                item.attribute.key,
                item.attribute,
            ]),
        );

        for (const [key, raw] of attributeFilters) {
            // attr.key.operator
            const [, attributeKey, operator] = key.split(".");
            const attribute = byKey[attributeKey];

            if (!attribute || !attribute.filterable)
                throw new HttpError(
                    422,
                    `Attribute ${attributeKey} is not filterable for this category`,
                );

            const mongoOperator = {
                gt: "$gt",
                gte: "$gte",
                lt: "$lt",
                lte: "$lte",
                eq: "$eq",
            }[operator];

            if (operator && !mongoOperator)
                throw new HttpError(
                    422,
                    `Unknown filter operator: ${operator}`,
                );

            query[`details.${attributeKey}`] = typeFilter(
                attribute,
                raw,
                mongoOperator,
            );
        }
    }


    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 10), 100);
    const page = Math.max(Number(req.qeury.page) || 1, 1);


    const [items, total] = await Promise.all([
        (await PMV.find(query).populate("category")).toSorted({
            createdAt: -1,
        }).skip((page - 1) * limit).limit(limit),
        PMV.countDocuments(query),
    ]);

    res.json({
        items,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
});

exports.get = asyncHandler(async (req, res) => {
    const pmv = await PMV.findById(req.params.id).populate("category");
    if (!pmv) throw new HttpError(404, "PMV not found");
    res.json(pmv);
});

exports.create = asyncHandler(async (req, res) => {
    const payload = validate(req.body, pmvCreateSchema);
    payload.details = validateDetails(payload.category, payload.details);

    const pmv = await PMV.create(payload);

    res.status(201).json(await PMV.findById(pmv.id).populate("category"));
});

exports.update = asyncHandler(async (req, res) => {
    const pmv = await PMV.findById(req.params.id);

    if (!pmv) throw new HttpError(404, "PMV not found");

    const payload = validate(pmvUpdateSchema, req.body);
    const categoryId = payload.category || pmv.category;

    if (payload.details || payload.category) {
        const details = payload.category
            ? payload.details || {}
            : { ...detailsObject(pmv.details), ...(payload.details || {}) };
        payload.details = await validateDetails(categoryId, details);
    }

    Object.assign(pmv, payload);

    await pmv.save();

    res.json(await PMV.findById(pmv.id).populate("category"));
});

exports.delete = asyncHandler(async (req, res) => {
    const pmv = await PMV.findByIdAndDelete(req.params.id);
    if (!pmv) throw new HttpError(404, "PMV not found");
    res.status(204).end();
});
