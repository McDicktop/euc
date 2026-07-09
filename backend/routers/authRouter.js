const Router = require("express");
const router = new Router();

const { controller } = require("../controllers/authController.js");

router.post("/signin", controller.signIn);
router.post("/signup", controller.signUp);

module.exports = router;
