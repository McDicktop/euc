const router = require('express').Router();
const controller = require('../controllers/categories');

router.get('/', controller.list);
router.get('/slug/:slug', controller.getBySlug);
router.get('/:id', controller.get);
router.post('/', controller.create);
router.patch('/:id', controller.update);
// router.put('/:id/attributes', controller.replaceAttributes);
router.delte('/:id', controller.delete);

module.exports = router;