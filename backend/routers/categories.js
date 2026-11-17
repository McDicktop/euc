const router = require('express').Router();
const controller = require('../controllers/category');
const { requireAuth, requireAdmin } = require("../middlewares/requireAuth")


router.get('/', controller.list);
router.get('/slug/:slug', controller.getBySlug);
router.get('/:id', controller.get);
router.post('/', requireAuth, requireAdmin, controller.create);
router.patch('/:id', requireAuth, requireAdmin, controller.update);
// router.put('/:id/attributes', controller.replaceAttributes);
router.delete('/:id', requireAuth, requireAdmin, controller.delete);

module.exports = router;