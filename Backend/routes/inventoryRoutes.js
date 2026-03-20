const express = require('express');
const { getStoreProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/store/:storeId', getStoreProducts);
router.get('/:productId', getProduct);

// Protected routes below
router.use(protect);

router.post('/', createProduct);
router.put('/:productId', updateProduct);
router.delete('/:productId', deleteProduct);

module.exports = router;
