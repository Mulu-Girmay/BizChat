const inventoryService = require('../services/inventoryService');

exports.createProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body };
    // Auto-assign storeId from logged in user if not provided
    if (!productData.storeId && req.user.storeId) {
      productData.storeId = req.user.storeId;
    }
    const product = await inventoryService.createProduct(productData);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

exports.getStoreProducts = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const products = await inventoryService.getStoreProducts(storeId);
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await inventoryService.getProduct(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await inventoryService.updateProduct(productId, req.body, req.user.id);
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};


exports.deleteProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    await inventoryService.deleteProduct(productId);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
