const Attribute = require("../models/attribute");
const Category = require("../models/category");

const { asyncHandler, HttpError } = require("../utils/http");

const { attributeSchema, validate } = require("../validators/common");

exports.list = asyncHandler(async (req, res) => {
    // const attributes = await Attribute.find().toSorted({ key: 1 });
    const attributes = await Attribute.find();
    res.json(attributes)
})

exports.create = asyncHandler(async (req, res) => {
    const attribute = await Attribute.create(validate(attributeSchema, req.body));
    res.status(201).json(attribute)
})

exports.update = asyncHandler(async(req, res) => {
    const attribute = await Attribute.findById(req.params.id);

    if(!attribute) throw new HttpError(404, "Attribute not found");
    if(req.body.key && req.body.key !== attribute.key) throw new HttpError(409, "Attribute key is immutable");
    if(req.body.type && req.body.type !== attribute.type) throw new HttpError(409, "Attribute type is immutable");

    const payload = validate(attributeSchema, { ...attribute.toObject(), ...req.body, key: attribute.key, type: attribute.type });

    Object.assign(attribute, payload);

    await attribute.save();

    res.json(attribute);
})

exports.delete = asyncHandler(async (req, res) => {
    // проверить что атрибует испольщуется в категории 
    // если что цепляем deprecated 

    const used = await Category.exists({ "attributes.attribute": req.params.id });

    if(used) throw new HttpError(409, "Attribute is used by a category; deprecate it insted of deleting it");
    const attribute = await Attribute.findByIdAndDelete(req.params.id); 

    if(!attribute) throw new HttpError(404, "Attribute not found");

    res.status(204).end();
})