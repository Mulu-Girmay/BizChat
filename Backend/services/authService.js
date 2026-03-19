const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const User   = require("../models/User");
const Store  = require("../models/Store");

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const register = async ({ name, email, password, storeName }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('Email already in use');
    err.statusCode = 409;
    throw err;
  }

  const user = await User.create({ name, email, password, role: 'owner' });

  const store = await Store.create({
    name: storeName || `${name}'s Store`,
    owner: user._id,
    alertEmails: [email],
  });

  user.storeId = store._id;
  await user.save({ validateBeforeSave: false });

  const token = signToken(user._id);

  return {
    token,
    user: {
      id:      user._id,
      name:    user.name,
      email:   user.email,
      role:    user.role,
      storeId: store._id,
      store:   { id: store._id, name: store.name, slug: store.slug, chatLink: store.chatLink },
    },
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password').populate('storeId', 'name slug chatLink chatLinkToken');

  if (!user || !(await user.comparePassword(password))) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error('Your account has been deactivated. Contact the store owner.');
    err.statusCode = 403;
    throw err;
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken(user._id);

  return {
    token,
    user: {
      id:          user._id,
      name:        user.name,
      email:       user.email,
      role:        user.role,
      permissions: user.permissions,
      store:       user.storeId,
    },
  };
};

// ─── Get current user (me) ────────────────────────────────────────────────────
const getMe = async (userId) => {
  const user = await User.findById(userId).populate('storeId', 'name slug chatLink logoUrl currency');

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  return {
    id:          user._id,
    name:        user.name,
    email:       user.email,
    role:        user.role,
    permissions: user.permissions,
    isActive:    user.isActive,
    lastLoginAt: user.lastLoginAt,
    store:       user.storeId,
    createdAt:   user.createdAt,
  };
};

// ─── Change password ──────────────────────────────────────────────────────────
const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');

  if (!user || !(await user.comparePassword(currentPassword))) {
    const err = new Error('Current password is incorrect');
    err.statusCode = 401;
    throw err;
  }

  user.password = newPassword;
  await user.save();

  return { message: 'Password updated successfully' };
};

// ─── Invite employee (owner only) ────────────────────────────────────────────
const inviteEmployee = async (ownerId, { name, email, permissions }) => {
  // Verify owner and get their store
  const owner = await User.findById(ownerId);
  if (!owner || owner.role !== 'owner') {
    const err = new Error('Only store owners can invite employees');
    err.statusCode = 403;
    throw err;
  }

  // Check if employee already exists
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('A user with this email already exists');
    err.statusCode = 409;
    throw err;
  }

  // Generate a secure invite token (they'll set password on accept)
  const rawToken  = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

  const employee = await User.create({
    name,
    email,
    password:        rawToken, // placeholder — replaced on invite accept
    role:            'employee',
    storeId:         owner.storeId,
    permissions:     permissions || {},
    inviteToken:     crypto.createHash('sha256').update(rawToken).digest('hex'),
    inviteExpiresAt: expiresAt,
    isActive:        false,   // inactive until they accept
  });


  return {
    message:     'Invitation sent',
    employee:    { id: employee._id, name: employee.name, email: employee.email },
    inviteToken: rawToken,
  };        // ← closes the return object
};          // ← closes inviteEmployee function

// ─── Accept invite (employee sets their own password) ────────────────────────
const acceptInvite = async ({ inviteToken, newPassword }) => {
  const hashed = crypto.createHash('sha256').update(inviteToken).digest('hex');

  const employee = await User.findOne({
    inviteToken:     hashed,
    inviteExpiresAt: { $gt: Date.now() },
  }).select('+inviteToken +inviteExpiresAt +password');

  if (!employee) {
    const err = new Error('Invite token is invalid or has expired');
    err.statusCode = 400;
    throw err;
  }

  // Use null (not undefined) — Mongoose reliably issues $unset for null values
  employee.password        = newPassword;
  employee.inviteToken     = null;
  employee.inviteExpiresAt = null;
  employee.isActive        = true;
  await employee.save();

  const token = signToken(employee._id);

  return {
    token,
    user: {
      id:          employee._id,
      name:        employee.name,
      email:       employee.email,
      role:        employee.role,
      permissions: employee.permissions,
      storeId:     employee.storeId,
    },
  };
};

// ─── Request account deletion (GDPR-lite) ────────────────────────────────────
const requestDeletion = async (userId) => {
  await User.findByIdAndUpdate(userId, { deletionRequestedAt: new Date() });
  return { message: 'Deletion request received. Your data will be removed within 30 days.' };
};

module.exports = {
  register,
  login,
  getMe,
  changePassword,
  inviteEmployee,
  acceptInvite,
  requestDeletion,
};
