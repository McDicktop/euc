const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user.js");
const { PHONE_RE, EMAIL_RE } = require("../constants.js");
const { listS3Objects } = require("../utils/s3.js");

const MIN_PASSWORD_LENGTH = 10;
const SALT_ROUNDS = 10;

// Access - короткоживузий токен для запросов
// Refresh - долгоживущий токен для выпуска нового Access

const ACCESS_TOKEN_EXPIRES_IN = "1h";
const REFRESH_TOKEN_EXPIRES_IN = "30d";
const REFRESH_TOKEN_EXPIRES_IN_MS = 30 * 24 * 60 * 60 * 1000; // 30 дней в ms
const REFRESH_COOKIE_NAME = "refreshToken";

const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: false, // true - https, false - http
    sameSite: "strict",
    path: "/api/auth",
    maxAge: REFRESH_TOKEN_EXPIRES_IN_MS,
};

function signAccessToken(userId) {
    return jwt.sign({ sub: userId }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
}

function signRefreshToken(userId) {
    return jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });
}

async function issueTokenPair(user) {
    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());

    user.refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    await user.save();

    return { accessToken, refreshToken };
}

function sendError(res, status, error, message, details) {
    return res
        .status(status)
        .json({ message, error, ...(details ? { details } : {}) });
}

function validateSingUpBody(body) {
    // email, name, password, address, phone
    // const { email, name, password, address } = req.body;
    //         if (
    //             typeof email !== "string" ||
    //             typeof name !== "string" ||
    //             typeof password !== "string"
    //         ) {
    //             return res.status(400).json({
    //                 message:
    //                     "EMAIL, NAME and PASSWORD are required and must be a string",
    //                 error: "INVALID_REQUEST_BODY",
    //             });
    //         }
    // все поля по порядку
}

class AuthController {
    async signIn(req, res) {
        try {
            const { email, password } = req.body ?? {};

            if (typeof email !== "string" || typeof password !== "string") {
                return sendError(
                    res,
                    400,
                    "INVALID_REQUEST_BODY",
                    "EMAIL and PASSWORD are required and must be strings",
                );
            }

            const normalizedEmail = email.trim().toLowerCase();
            const user = await User.findOne({ email: normalizedEmail }).select(
                "+password",
            );

            if (!user) {
                return sendError(
                    res,
                    401,
                    "INVALID_CREDENTIALS",
                    "Invalid email or password",
                );
            }

            const isPasswordValid = await bcrypt.compare(
                password,
                user.password,
            );

            if (!isPasswordValid) {
                return sendError(
                    res,
                    401,
                    "INVALID_CREDENTIALS",
                    "Invalid email or password",
                );
            }

            const { accessToken, refreshToken } = await issueTokenPair(user);

            res.cookie(
                REFRESH_COOKIE_NAME,
                refreshToken,
                REFRESH_COOKIE_OPTIONS,
            );

            return res.status(200).json({
                message: "Signed in successfully",
                accessToken,
                user: {
                    _id: user._id,
                    email: user.email,
                    name: user.name,
                },
            });
        } catch (e) {
            console.error(e);
            return sendError(res, 500, "SERVER_ERROR", "Internal server error");
        }
    }

    // POST /api/auth/refresh
    // Refresh-токен приходит в httpOnly хуке, не в теле
    async refresh(req, res) {
        try {
            const token = req.cookies?.[REFRESH_COOKIE_NAME];

            if (!token) {
                return sendError(
                    res,
                    401,
                    "NO_REFRESH_TOKEN",
                    "Refresh token is missing",
                );
            }

            let payload;

            try {
                payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            } catch (e) {
                res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);

                return sendError(
                    res,
                    401,
                    "INVALID_REFRESH_TOKEN",
                    "Refresh token is invalid or expired",
                );
            }

            const user = await User.findById(payload.sub).select(
                "+refreshTokenHash",
            );

            if (!user || !user.refreshTokenHash) {
                return sendError(
                    res,
                    401,
                    "INVALID_REFRESH_TOKEN",
                    "Refresh token is invalid or expired",
                );
            }

            const isTokenValid = await bcrypt.compare(
                token,
                user.refreshTokenHash,
            );

            if (!isTokenValid) {
                user.refreshTokenHash = undefined;
                await user.save();
                res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);
                return sendError(
                    res,
                    401,
                    "INVALID_REFRESH_TOKEN",
                    "Refresh token is invalid or expired",
                );
            }

            const { accessToken, refreshToken } = await issueTokenPair(user);

            res.cookie(
                REFRESH_COOKIE_NAME,
                refreshToken,
                REFRESH_COOKIE_OPTIONS,
            );

            return res.status(200).json({ accessToken });
        } catch (e) {
            console.error(e);
            return sendError(res, 500, "SERVER_ERROR", "Internal server error");
        }
    }

    async logout(req, res) {
        try {
            const token = req.cookies?.[REFRESH_COOKIE_NAME];

            if (token) {
                try {
                    const payload = jwt.verify(
                        token,
                        process.env.JWT_REFRESH_SECRET,
                    );

                    await User.findByIdAndUpdate(payload.sub, {
                        $unset: { refreshTokenHash: 1 },
                    });
                } catch (e) {}
            }

            res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);

            return res.status(200).json({ message: "Logged out successfully" });
        } catch (e) {
            console.error(e);
            return sendError(res, 500, "SERVER_ERROR", "Internal server error");
        }
    }

    async signUp(req, res) {
        if (!req.body) {
            return res.status(400).json({
                message: "A request without data was received",
                error: "MISSING_DATA",
            });
        }

        try {
            // const validation = validateSingUpBody
            // ....

            const { email, name, password, phone, address } = validation.data;

            const isExist = await User.findOne({ email });

            if (isExist) {
                return sendError(
                    res,
                    400,
                    "EMAIL_EXISTS",
                    `EMAIL ${email} is alredy registered`,
                );
            }

            const hashedPassword = await bcrypt.has(password, SALT_ROUNDS);

            const user = new User({
                email,
                name,
                password: hashedPassword,
                ...(phone ? { phone } : {}),
                address,
            });

            await user.save();

            return res.status(201).json({
                message: "User created successfully",
                user: {
                    _id: user._id,
                    email: user.email,
                    name: user.name,
                },
            });
        } catch (e) {
            console.error(e);

            if(e.name === "ValidationError") {
                const errors = Object.values(e.errors).map((err) => err.message);

                return sendError(res, 400, "VALIDATION_ERROR", "Validation failed", errors);
            }

            return sendError(res, 500, "SERVER_ERROR", "Internal server error");
        }
    }

    // event/files?prefix=cover/
    async getFiles(req, res) {
        try {
            const prefix = req.query.prefix;

            if (prefix && typeof prefix !== "string") {
                return res.status(400).json({
                    message: "Invalid prefix parameter. Must be a string.",
                    error: "INVALID_PREFIX",
                });
            }

            const files = await listS3Objects(prefix ?? "");

            return res.status(200).json(files);
        } catch (e) {
            console.error(e);
            return res.status(500).json({
                message: "Internal server error, please try again later.",
                error: "SERVER_ERROR",
            });
        }
    }
}

module.exports = { controller: new AuthController() };
