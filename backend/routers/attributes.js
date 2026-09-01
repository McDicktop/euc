const router = require('express').Router();
const controller = require('../controllers/attributes');

router.get('/', controller.list);
router.post('/', controller.create);
router.patch('/:id', controller.update);
router.delte('/:id', controller.delete);

module.exports = router;