const User = require("../models/user.js");
const Pmv = require("../models/pmv.js");

const cats = require("../constants.js");

const mongoose = require("mongoose");

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

            console.log(req.body)

            if (!req.body) {
                return res.status(401).json({
                    message: "Get no data",
                    error: "DATA_MISSING",
                });
            }

            const { name, category, coverUrl, userId } = req.body;

            // 1. Валидация данных и проверка существования пользователя
            // if (
            //     typeof name !== "string" ||
            //     typeof category !== "string" ||
            //     !cats.includes(category) ||
            //     typeof coverUrl !== "string" ||
            //     !mongoose.Schema.Types.ObjectId(userId)
            // ) {
            //     return res.status(400).json({
            //         message: "",
            //         error: "INVALID_DATA"
            //     });
            // }

            // 2. загрузка файла в s3 и получние ключа на него


            // 3. Сохранение в Б
            // let obj = {...req.body, cover: file.key}

            const newPmv = Pmv(req.body);
            await newPmv.save();

            return res.status(200).send(newPmv);
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
