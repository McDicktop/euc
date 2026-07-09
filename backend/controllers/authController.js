const User = require("../models/user.js")

const { PHONE_RE } = require("../constants.js");

class AuthController {

    async signIn() {
    
    }

    async signUp(req, res) {

        if (!req.body) {
            return res.status(400).json({
                message: "A request without data was received",
                error: "MISSING_DATA",
            });
        }

        const userData = {};

        try {
            const { email, name, password, address } = req.body;

            if (typeof email !== "string" || typeof name !== "string" || typeof password !== "string") {
                return res.status(400).json({
                    message: "EMAIL, NAME and PASSWORD are required and must be a string",
                    error: "INVALID_REQUEST_BODY",
                });
            }

            if (typeof address !== "object" || !address.country || !address.city || typeof address.country !== "string" || typeof address.city !== "string") {
                return res.status(400).json({
                    message: "COUNTRY and CITY are required in the ADDRESS and must be strings",
                    error: "INVALID_ADDRESS_DATA",
                });
            }

            const isExist = await User.findOne({ email });

            if (isExist) {
                return res.status(400).json({
                    message: `EMAIL ${email} is already registered`,
                    error: "EMAIL_EXISTS",
                });
            }

            // Собираем данные пользователя для создания нового документа в базе данных
            userData.address = {};
            userData.email = email;
            userData.name = name;
            userData.password = password;           
            userData.address.country = address.country;
            userData.address.city = address.city;
            if (address.street && typeof address.street === "string") {
                userData.address.street = address.street;
            }

            const user = new User(userData);
            await user.save();

            return res.status(201).json({
                message: "User created successfully",
                user: {
                    _id: user._id,
                    email: user.email,
                    name: user.name,
                }
            });
        } catch (e) {
            console.log(e)

            if (e.name === "ValidationError") {
                const errors = Object.values(e.errors).map(err => err.message);
                return res.status(400).json({
                    message: "Validation failed",
                    error: "VALIDATION_ERROR",
                    details: errors
                });
            }

            return res.status(500).json({
                message: "Internal server error",
                error: "SERVER_ERROR",
            });
        }
    }


}

module.exports = { controller: new AuthController() };