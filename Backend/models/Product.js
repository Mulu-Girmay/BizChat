const mongoose = require('mongoose');



const productSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store ID is required'],
    },

    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },

    // Stock Keeping Unit – unique per store
    sku: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },

    category: {
      type: String,
      trim: true,
      default: 'Uncategorised',
    },

    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },

    // Current available stock
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },

    // Units temporarily locked by Smart Lock (not yet confirmed orders)
    reservedStock: {
      type: Number,
      min: [0, 'Reserved stock cannot be negative'],
      default: 0,
    },

    // Computed: actual sellable units = stock - reservedStock
    // We store both to allow queries without subtraction

    lowStockThreshold: {
      type: Number,
      min: [0, 'Threshold cannot be negative'],
      default: 5,
    },

    images: {
      type: [String],  // Cloudinary secure_url strings
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Track who added this product
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtual: available (sellable) stock ─────────────────────────────────────
productSchema.virtual('availableStock').get(function () {
  return Math.max(0, this.stock - this.reservedStock);
});

// ─── Virtual: isLowStock ─────────────────────────────────────────────────────
productSchema.virtual('isLowStock').get(function () {
  return this.availableStock <= this.lowStockThreshold;
});

// ─── Virtual: isOutOfStock ───────────────────────────────────────────────────
productSchema.virtual('isOutOfStock').get(function () {
  return this.availableStock <= 0;
});

// ─── Indexes ─────────────────────────────────────────────────────────────────
productSchema.index({ storeId: 1 });
productSchema.index({ storeId: 1, sku: 1 }, { unique: true, sparse: true });
productSchema.index({ storeId: 1, isActive: 1 });
productSchema.index({ stock: 1 }); // low-stock queries

module.exports = mongoose.model('Product', productSchema);
