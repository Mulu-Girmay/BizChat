const orderService = require('../services/orderService');

exports.createOrder = async (req, res, next) => {
  try {
    const orderData = req.body;
    const order = await orderService.createOrder(orderData);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

exports.getStoreOrders = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const orders = await orderService.getStoreOrders(storeId);
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

exports.getOrderByToken = async (req, res, next) => {
  try {
    const { trackingToken } = req.params;
    const order = await orderService.getOrderByToken(trackingToken);
    
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status, cancellationReason } = req.body;
    // Assuming user is extracted by the authMiddleware properly
    const userId = req.user ? req.user.id : null;
    
    const order = await orderService.updateOrderStatus(orderId, status, userId, cancellationReason);
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};