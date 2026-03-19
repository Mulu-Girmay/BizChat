const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');


const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName:  { type: String, required: true }, // snapshot at order time
    sku:          { type: String, default: '' },
    quantity:     { type: Number, required: true, min: 1 },
    originalPrice:{ type: Number, required: true }, // catalogue price at order time
    vipPrice:     { type: Number, default: null },  // owner-overridden price (null = not applied)
    imageUrl:     { type: String, default: '' },
  },
  { _id: false }
);

// ─── Virtual: effectivePrice per item ────────────────────────────────────────
orderItemSchema.virtual('effectivePrice').get(function () {
  return this.vipPrice !== null ? this.vipPrice : this.originalPrice;
});

orderItemSchema.virtual('lineTotal').get(function () {
  return this.effectivePrice * this.quantity;
});

// ─── Sub-schema: anonymous customer info ─────────────────────────────────────
const customerSchema = new mongoose.Schema(
  {
    name:  { type: String, default: 'Anonymous' },
    phone: { type: String, default: '' },
    notes: { type: String, default: '' }, // delivery notes, special requests
  },
  { _id: false }
);

// ─── Main Order Schema ────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    // Human-readable order number e.g. ORD-20260318-0042
    orderNumber: {
      type: String,
      unique: true,
    },

    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },

    // Socket / browser session — ties Ghost Cart to returning customers
    sessionId: {
      type: String,
      required: true,
    },

    customer: {
      type: customerSchema,
      default: () => ({}),
    },

    items: {
      type: [orderItemSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: 'Order must have at least one item',
      },
    },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'fulfilled'],
      default: 'pending',
    },

    // Subtotal before any extra fees
    totalAmount: {
      type: Number,
      min: [0, 'Total cannot be negative'],
      default: 0,
    },

    // Smart Lock expiry — when this passes, reserved stock is released
    smartLockExpiresAt: {
      type: Date,
      default: null,
    },

    // Anonymous order tracking – customers get this link, no login needed
    trackingToken: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Which employee/owner confirmed or cancelled
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Reason provided when cancelling
    cancellationReason: {
      type: String,
      default: '',
    },

    // PDF receipt URL (generated on confirmation)
    receiptUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Generate orderNumber + trackingToken before first save ──────────────────
orderSchema.pre('save', function (next) {
  if (this.isNew) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber   = `ORD-${date}-${rand}`;
    this.trackingToken = uuidv4();
  }
  next();
});

// ─── Recalculate totalAmount before save ─────────────────────────────────────
orderSchema.pre('save', function (next) {
  if (this.isModified('items')) {
    this.totalAmount = this.items.reduce((sum, item) => {
      const price = item.vipPrice !== null ? item.vipPrice : item.originalPrice;
      return sum + price * item.quantity;
    }, 0);
  }
  next();
});

// ─── Indexes ─────────────────────────────────────────────────────────────────
orderSchema.index({ storeId: 1 });
orderSchema.index({ sessionId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ trackingToken: 1 });
orderSchema.index({ smartLockExpiresAt: 1 }); // TTL-sweep queries

module.exports = mongoose.model('Order', orderSchema);
