const mongoose = require("mongoose");
const User = require("../models/user.js");
const Pmv = require("../models/pmv.js");

const { PMV_CATS } = require("../constants.js");

const { sendError } = require("../utils/sendError.js");

const { uploadToS3 } = require("../utils/s3.js");


class PMV {
    async getPmvs(req, res) {
        try {
            const pmvs = await Pmv.find();

            return res.status(200).send(pmvs);
        } catch (e) {
            console.log(e);
            return res.status(400).json({
                message: "Internal server error",
                error: "SERVER_ERROR",
            });
        }
    }

    async addPmv(req, res) {
        try {

            const file = req.file;

            if (!file) {
                return res.status(400).json({
                    message: "Cover image must be upload",
                    error: "MISSING_IMAGE"
                });
            }

            const { name, category, userId } = req.body;

            if (
                typeof name !== "string" ||
                typeof category !== "string" ||
                !PMV_CATS.includes(category)
            ) {
                return res.status(400).json({
                    message: "'name' and 'category' must exist and be of String type and 'category' must be registered",
                    error: "INVALID_DATA"
                });
            }

            if (typeof userId !== 'string' || !mongoose.isValidObjectId(userId)) {
                return res.status(400).json({
                    message: "'userId' must be of ObjectId type",
                    error: "INVALID_DATA"
                });
            }

            const user = await User.findOne({ _id: userId });

            if (!user) {
                return res.status(404).json({
                    message: "User not find",
                    error: "MISSING_USER"
                });
            }

            // 2. загрузка файла в s3 и получние ключа на него

            let coverKey;

            try {
                coverKey = await uploadToS3(file, "cover");
                
                if (!coverKey) {
                    return res.status(400).json({
                        message: "Uploading to S3 failed",
                        error: "UPLOADING_FAILED"
                    });
                }

            } catch (e) {
                console.log(e)
                return res.status(400).json({
                    message: "Uploading to S3 failed",
                    error: "UPLOADING_FAILED"
                });
            }

            // 3. Сохранение в Б

            const newPmv = Pmv({ name, category, userId, coverKey });
            await newPmv.save();

            return res.status(200).send(newPmv);
            // return res.status(200).send(req.body);
        } catch (e) {
            console.log(e);
            return res.status(400).json({
                message: "Internal server error",
                error: "SERVER_ERROR",
            });
        }
    }
}

module.exports = { controller: new PMV() }
