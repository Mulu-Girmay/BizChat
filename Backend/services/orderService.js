const Order = require('../models/Order');

const createOrder = async (orderData) => {
  const order = await Order.create(orderData);
  return order;
};

const getStoreOrders = async (storeId) => {
  const orders = await Order.find({ storeId })
    .sort({ createdAt: -1 })
    .populate('processedBy', 'name');
  return orders;
};

const getOrderByToken = async (trackingToken) => {
  const order = await Order.findOne({ trackingToken }).populate('storeId', 'name logoUrl');
  return order;
};

const updateOrderStatus = async (orderId, status, userId, cancellationReason = '') => {
  const order = await Order.findById(orderId);
  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }
  
  order.status = status;
  order.processedBy = userId;
  
  if (status === 'cancelled') {
    order.cancellationReason = cancellationReason;
  }
  
  await order.save();
  return order;
};

module.exports = {
  createOrder,
  getStoreOrders,
  getOrderByToken,
  updateOrderStatus
};