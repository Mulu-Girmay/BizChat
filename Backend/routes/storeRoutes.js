const express = require('express');
const { createStore, getStore, getMyStores, updateStore } = require('../controllers/storeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:slug', getStore);

// Private routes
router.use(protect);
router.post('/', createStore);
router.get('/my/all', getMyStores);
router.put('/:storeId', updateStore);

module.exports = router;
