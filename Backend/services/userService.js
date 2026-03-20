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
