const multer = require('multer');

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 3 * 1024 * 1024,
        files: 5
    },
    fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            return cb(new Error(`Invalid file type: ${file.mimetype}`))
        }
        cb(null, true);
    },
});


const multerErrorHandler = (uploadMiddleware) => (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
        if (!err) return next();

        if (err instanceof multer.MulterError) {
            const messages = {
                LIMIT_FILE_SIZE: "Размер файла для загрузки превышен. Максимум - 3 Мегабайт.",
                LIMIT_UNEXPECTED_FILE: "Unexpected file",
                LIMIT_FILE_COUNT: "Слишком много файлов, максимум - 5 файлов",
            };

            return res.status(400).json({ message: messages[err.code] ?? err.message });
        }

        if (err.message.startsWith("Invalid file type")) {
            return res.status(400).json({ message: err.message });
        }

        console.log(`Error while uploading: ${err.message}`);
        return res.status(500).json({ message: "Ошибка загрузки файла." });
    })
};

module.exports = { upload, multerErrorHandler };
