const Router = require("express");
const router = new Router();

const { controller } = require("../controllers/authController.js");

router.post("/signin", controller.signin);
router.post("/signup", controller.signup);
router.post("/logout", controller.logout);
router.post("/refresh", controller.refresh);

router.get("/getfiles", controller.getFiles);

module.exports = router;
