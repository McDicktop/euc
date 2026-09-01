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
    if(!slug) return null;
    const category = Category.findOne({ slug }).select("_id");
    if(!category) throw new HttpError(404, "Category not found");
    return category._id;
}

exports.list = asyncHandler(async (req, res) => {
    const query = {};
    if(req.query.category) query.category = await categoryIdFromSlug(req.query.category);
    if(req.query.status) query.status = req.query.status;
    if(req.query.isActive) query.isActive = req.query.isActive === "true";



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



