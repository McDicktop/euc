const router = require('express').Router();
const controller = require('../controllers/category');

router.get('/', controller.list);
router.get('/slug/:slug', controller.getBySlug);
router.get('/:id', controller.get);
router.post('/', controller.create);
router.patch('/:id', controller.update);
// router.put('/:id/attributes', controller.replaceAttributes);
router.delete('/:id', controller.delete);

module.exports = router;