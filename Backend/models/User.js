const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const permissionsSchema = new mongoose.Schema(
  {
    canChat:           { type: Boolean, default: true },
    canManageOrders:   { type: Boolean, default: true },
    canManageProducts: { type: Boolean, default: false },
    canViewReports:    { type: Boolean, default: false },
    canManageEmployees:{ type: Boolean, default: false },
    canChangePrices:   { type: Boolean, default: false },
    canExportData:     { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },

    role: {
      type: String,
      enum: ['owner', 'employee'],
      default: 'owner',
    },

    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      default: null,
    },

    permissions: {
      type: permissionsSchema,
      default: () => ({}),
    },

    inviteToken:     { type: String, select: false },
    inviteExpiresAt: { type: Date, select: false },
    isActive:        { type: Boolean, default: true },

    deletionRequestedAt: { type: Date, default: null },
    dataExportedAt:      { type: Date, default: null },

    lastLoginAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.index({ storeId: 1 });

userSchema.pre('save', async function () {
  try {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error; 
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.hasPermission = function (permission) {
  if (this.role === 'owner') return true;
  return Boolean(this.permissions?.[permission]);
};

module.exports = mongoose.model('User', userSchema);
