const controller = require("../controllers/pmvController");
const { requireAuth } = require("../middlewares/requireAuth");
const { upload, multerErrorHandler } = require("../utils/multer.js");


const Router = require("express");
const router = new Router();

const uploadSingleCover = multerErrorHandler(upload.single("file"));

router.get("/:id", requireAuth, controller.get);
router.post("/", requireAuth, uploadSingleCover, controller.create);

module.exports = router;

// в роутере через миддлвеар (uploadSingleCover)
//  загружается через multer файл 
// и передается в контроллер в req.file 
// и в контроллере загружается в s3