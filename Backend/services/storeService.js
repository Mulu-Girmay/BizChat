const Store = require('../models/Store');

exports.createStore = async (ownerId, storeData) => {
  const store = await Store.create({ ...storeData, owner: ownerId });
  return store;
};

exports.getStoreBySlug = async (slug) => {
  return await Store.findOne({ slug, isActive: true }).populate('owner', 'name email');
};

exports.getStoreById = async (id) => {
  return await Store.findById(id).populate('owner', 'name email');
};

exports.updateStore = async (id, updateData) => {
  return await Store.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

exports.getOwnerStores = async (ownerId) => {
  return await Store.find({ owner: ownerId, isActive: true });
};
