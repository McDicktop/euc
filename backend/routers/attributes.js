const router = require('express').Router();
const controller = require('../controllers/attribute');

router.get('/', controller.list);
router.post('/', controller.create);
router.patch('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;