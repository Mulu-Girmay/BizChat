const Order = require('../models/Order');
const Product = require('../models/Product');
const StockLedger = require('../models/StockLedger');

const createOrder = async (orderData) => {
  // Validate items and check stock if needed
  for (const item of orderData.items) {
    const productId = item.product || item.productId;
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error(`Product ${item.productName || item.name || productId} not found`);
    }
    if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

    // Normalize incoming payload so it matches the Order schema.
    item.product = product._id;
    if (item.originalPrice === undefined) {
      item.originalPrice = item.price ?? product.price;
    }
    if (!item.productName) item.productName = product.name;
    if (item.sku === undefined) item.sku = product.sku || '';
    if (item.imageUrl === undefined) item.imageUrl = product.images?.[0] || '';
  }

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
  
  const oldStatus = order.status;
  order.status = status;
  order.processedBy = userId;
  
  if (status === 'cancelled') {
    order.cancellationReason = cancellationReason;
    
    // If it was confirmed, return stock
    if (oldStatus === 'confirmed' || oldStatus === 'shipped') {
        for (const item of order.items) {
            const product = await Product.findById(item.productId);
            if (product) {
                const previousStock = product.stock;
                product.stock += item.quantity;
                await product.save();

                await StockLedger.create({
                    storeId: order.storeId,
                    product: product._id,
                    productName: product.name,
                    changeType: 'order_cancelled',
                    previousStock,
                    changeAmount: item.quantity,
                    newStock: product.stock,
                    changedBy: userId,
                    orderId: order._id,
                    reason: `Order ${order.orderNumber} cancelled`
                });
            }
        }
    }
  }

  if (status === 'confirmed' && oldStatus !== 'confirmed') {
      // Deduct stock for each item
      for (const item of order.items) {
          const product = await Product.findById(item.productId);
          if (!product) continue;
          
          const previousStock = product.stock;
          product.stock -= item.quantity;
          await product.save();

          await StockLedger.create({
              storeId: order.storeId,
              product: product._id,
              productName: product.name,
              changeType: 'sale',
              previousStock,
              changeAmount: -item.quantity,
              newStock: product.stock,
              changedBy: userId,
              orderId: order._id,
              reason: `Sale from order ${order.orderNumber}`
          });
      }
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
