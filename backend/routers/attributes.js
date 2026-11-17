const router = require('express').Router();
const controller = require('../controllers/attribute');
const { requireAuth, requireAdmin } = require("../middlewares/requireAuth")

router.get('/', controller.list);
router.post('/', requireAuth, requireAdmin, controller.create);
router.patch('/:id', requireAuth, requireAdmin, controller.update);
router.delete('/:id', requireAuth, requireAdmin, controller.delete);

module.exports = router;