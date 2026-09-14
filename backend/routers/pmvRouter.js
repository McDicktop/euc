const router = require("express").Router();

const controller = require("../controllers/pmvController");
const { requireAuth } = require("../middlewares/requireAuth");
const { upload, multerErrorHandler } = require("../middleware/upload");

router.get("/", controller.list);
router.get("/:id", requireAuth, controller.get);
router.post("/", requireAuth, multerErrorHandler(upload.array("images, 5")), controller.create);
router.patch("/:id", controller.update);
router.delete("/:id", controller.delete);


module.exports = router;

// в роутере через миддлвеар (uploadSingleCover)
//  загружается через multer файл 
// и передается в контроллер в req.file 
// и в контроллере загружается в s3