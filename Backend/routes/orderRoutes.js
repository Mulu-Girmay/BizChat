const express = require('express');
const router = express.Router();
const {
  createOrder,
  getStoreOrders,
  getOrderByToken,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// ─── PUBLIC CUSTOMER ROUTES ───
// These do not require a JWT. Any customer with the order link or in session can view/create.
router.post('/', createOrder);
router.get('/track/:trackingToken', getOrderByToken);

// ─── PROTECTED STAFF ROUTES ───
// These require the user to be logged in to view all store orders or change statuses.
router.get('/store/:storeId', protect, getStoreOrders);
router.put('/:orderId/status', protect, updateOrderStatus);

module.exports = router;