const User = require('../models/User');

exports.getUserById = async (id) => {
  return await User.findById(id).select('-password');
};

exports.updateUser = async (id, updateData) => {
  return await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password');
};

exports.getAllUsers = async (query = {}) => {
  // Can add pagination and filtering later
  return await User.find(query).select('-password');
};

exports.getStoreUsers = async (storeId) => {
  return await User.find({ storeId, isActive: true }).select('-password');
};

exports.deactivateEmployee = async ({ requesterId, requesterStoreId, targetUserId }) => {
  const target = await User.findById(targetUserId);

  if (!target) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  if (String(target._id) === String(requesterId)) {
    const err = new Error('You cannot remove your own account');
    err.statusCode = 400;
    throw err;
  }

  if (target.role === 'owner') {
    const err = new Error('Owner accounts cannot be removed from this endpoint');
    err.statusCode = 400;
    throw err;
  }

  if (String(target.storeId) !== String(requesterStoreId)) {
    const err = new Error('Not authorized to remove this employee');
    err.statusCode = 403;
    throw err;
  }

  target.isActive = false;
  await target.save({ validateBeforeSave: false });

  return target;
};
