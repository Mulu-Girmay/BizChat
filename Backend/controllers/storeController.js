const storeService = require('../services/storeService');

exports.createStore = async (req, res, next) => {
  try {
    const store = await storeService.createStore(req.user.id, req.body);
    res.status(201).json({ success: true, data: store });
  } catch (error) {
    next(error);
  }
};

exports.getStore = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const store = await storeService.getStoreBySlug(slug);
    if (!store) return res.status(404).json({ success: false, message: 'Store not found' });
    res.status(200).json({ success: true, data: store });
  } catch (error) {
    next(error);
  }
};

exports.getMyStores = async (req, res, next) => {
  try {
    const stores = await storeService.getOwnerStores(req.user.id);
    res.status(200).json({ success: true, count: stores.length, data: stores });
  } catch (error) {
    next(error);
  }
};

exports.updateStore = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    // Basic ownership check can be added here or in middleware
    const store = await storeService.updateStore(storeId, req.body);
    res.status(200).json({ success: true, data: store });
  } catch (error) {
    next(error);
  }
};
