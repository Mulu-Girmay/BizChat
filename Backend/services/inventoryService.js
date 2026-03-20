const Product = require('../models/Product');
const StockLedger = require('../models/StockLedger');

const createStockLedger = async (data) => {
  await StockLedger.create(data);
};

exports.createProduct = async (data) => {
  const product = await Product.create(data);
  
  if (product.stock > 0) {
    await createStockLedger({
      storeId: product.storeId,
      product: product._id,
      productName: product.name,
      changeType: 'initial_stock',
      previousStock: 0,
      changeAmount: product.stock,
      newStock: product.stock,
      reason: 'Initial product creation'
    });
  }
  
  return product;
};

exports.getStoreProducts = async (storeId) => {
  return await Product.find({ storeId, isActive: true });
};

exports.getProduct = async (productId) => {
  return await Product.findById(productId);
};

exports.updateProduct = async (productId, updateData, userId = 'system') => {
  const oldProduct = await Product.findById(productId);
  if (!oldProduct) throw new Error('Product not found');

  const product = await Product.findByIdAndUpdate(productId, updateData, { new: true, runValidators: true });
  
  if (updateData.stock !== undefined && updateData.stock !== oldProduct.stock) {
    await createStockLedger({
      storeId: product.storeId,
      product: product._id,
      productName: product.name,
      changeType: updateData.stock > oldProduct.stock ? 'restock' : 'manual_correction',
      previousStock: oldProduct.stock,
      changeAmount: updateData.stock - oldProduct.stock,
      newStock: updateData.stock,
      changedBy: userId,
      reason: updateData.reason || 'Manual update'
    });
  }

  return product;
};

exports.deleteProduct = async (productId) => {
  return await Product.findByIdAndUpdate(productId, { isActive: false }, { new: true });
};

