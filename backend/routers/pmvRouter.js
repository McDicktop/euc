const { requireAuth } = require("../middlewares/requireAuth");
const { controller } = require("../controllers/pmvController");
const Router = require("express");

const router = new Router();

router.get("/", requireAuth, controller.getPmvs);
router.post("/", requireAuth, controller.addPmv);

module.exports = router;

