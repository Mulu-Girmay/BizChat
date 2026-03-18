const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:         { type: string }
 *         name:        { type: string }
 *         email:       { type: string, format: email }
 *         role:        { type: string, enum: [owner, employee] }
 *         storeId:     { type: string }
 *         permissions: { type: object }
 *         isActive:    { type: boolean }
 *         createdAt:   { type: string, format: date-time }
 */

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
      select: false, // never returned in queries by default
    },

    role: {
      type: String,
      enum: ['owner', 'employee'],
      default: 'owner',
    },

    // The store this user belongs to (set by owner on employee invite)
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      default: null,
    },

    // Granular permissions (only relevant for employees)
    permissions: {
      type: permissionsSchema,
      default: () => ({}),
    },

    // Invite flow for employees
    inviteToken:     { type: String, select: false },
    inviteExpiresAt: { type: Date, select: false },
    isActive:        { type: Boolean, default: true },

    // GDPR – soft delete / data export request
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

// ─── Indexes ─────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ storeId: 1 });

// ─── Hash password before save ───────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance method: compare password ───────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Instance method: owner default full permissions ─────────────────────────
userSchema.methods.hasPermission = function (permission) {
  if (this.role === 'owner') return true;
  return Boolean(this.permissions?.[permission]);
};

module.exports = mongoose.model('User', userSchema);
