const { Router } = require('express');
const controller = require('./controller');

const router = Router();

router.get('/', controller.getAll);
router.get('/filters', controller.getFilters);
router.get('/genes', controller.getGenes);
router.get('/:id', controller.getById);

module.exports = router;
