const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

/**
 * @swagger
 * components:
 *   schemas:
 *     Store:
 *       type: object
 *       properties:
 *         _id:       { type: string }
 *         name:      { type: string }
 *         slug:      { type: string }
 *         ownerId:   { type: string }
 *         chatLink:  { type: string }
 *         logoUrl:   { type: string }
 *         isActive:  { type: boolean }
 */

const storeSchema = new mongoose.Schema(
  {
    // Store display name
    name: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true,
      maxlength: [80, 'Store name cannot exceed 80 characters'],
    },

    // URL-safe identifier → bizchat.com/shop/:slug
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
    },

    // The owner who created this store
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },

    logoUrl:   { type: String, default: '' },
    bannerUrl: { type: String, default: '' },

    // Contact info shown on the shop page
    contact: {
      phone:   { type: String, default: '' },
      email:   { type: String, default: '' },
      address: { type: String, default: '' },
    },

    // Currency for all products in this store (ISO 4217)
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      maxlength: 3,
    },

    // Unique token for the shareable chat link
    chatLinkToken: {
      type: String,
      unique: true,
      default: () => uuidv4(),
    },

    // Low-stock alert email recipients (can be owner + manager)
    alertEmails: {
      type: [String],
      default: [],
    },

    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtual: full public chat URL ───────────────────────────────────────────
storeSchema.virtual('chatLink').get(function () {
  return `/shop/${this.slug}`;
});

// ─── Auto-generate slug from name if not provided ────────────────────────────
storeSchema.pre('save', function (next) {
  if (this.isNew && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }
  next();
});

// ─── Indexes ─────────────────────────────────────────────────────────────────
storeSchema.index({ slug: 1 });
storeSchema.index({ owner: 1 });
storeSchema.index({ chatLinkToken: 1 });

module.exports = mongoose.model('Store', storeSchema);
