const { controller } = require("../controllers/pmvController");
const { requireAuth } = require("../middlewares/requireAuth");
const { upload, multerErrorHandler } = require("../utils/multer.js");

const Router = require("express");
const router = new Router();

const uploadSingleCover = multerErrorHandler(upload.single("cover"));

router.get("/", requireAuth, controller.getPmvs);
router.post("/", requireAuth, uploadSingleCover, controller.addPmv);

module.exports = router;

// в роутере через миддлвеар (uploadSingleCover)
//  загружается через multer файл 
// и передается в контроллер в req.file 
// и в контроллере загружается в s3