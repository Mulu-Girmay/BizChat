const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     StockLedger:
 *       type: object
 *       properties:
 *         _id:           { type: string }
 *         storeId:       { type: string }
 *         productId:     { type: string }
 *         changeType:    { type: string }
 *         previousStock: { type: number }
 *         changeAmount:  { type: number }
 *         newStock:      { type: number }
 *         reason:        { type: string }
 *         triggeredBy:   { type: string }
 *         createdAt:     { type: string, format: date-time }
 */

const stockLedgerSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },

    // Snapshot of product name at log time — stays readable even if product is renamed
    productName: {
      type: String,
      required: true,
    },

    // What caused this change?
    changeType: {
      type: String,
      enum: [
        'restock',           // owner adds stock manually
        'sale',              // confirmed order deducted stock
        'manual_correction', // owner fixes a discrepancy
        'smart_lock_reserve',// stock temporarily locked in pending order
        'smart_lock_release',// lock expired → stock returned
        'order_cancelled',   // confirmed order cancelled → stock returned
        'initial_stock',     // first stock entry for a new product
      ],
      required: true,
    },

    // Stock value BEFORE this change
    previousStock: {
      type: Number,
      required: true,
    },

    // Delta: positive = added, negative = removed
    changeAmount: {
      type: Number,
      required: true,
    },

    // Stock value AFTER this change
    newStock: {
      type: Number,
      required: true,
    },

    // Free-text reason (e.g. "Supplier delivery", "Customer return")
    reason: {
      type: String,
      trim: true,
      default: '',
    },

    // Who triggered this change — user ObjectId or 'system' for automated events
    changedBy: {
      type: mongoose.Schema.Types.Mixed, // ObjectId | 'system'
      default: 'system',
    },

    // Link back to the order that caused this change (if applicable)
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },

    // Was this change part of a Smart Lock cycle?
    lockId: {
      type: String, // Redis key used for the lock
      default: null,
    },
  },
  {
    // Ledger entries are IMMUTABLE — no updatedAt
    timestamps: { createdAt: true, updatedAt: false },
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtual: human-readable change direction ─────────────────────────────────
stockLedgerSchema.virtual('direction').get(function () {
  return this.changeAmount > 0 ? 'increase' : 'decrease';
});

// ─── Indexes ─────────────────────────────────────────────────────────────────
stockLedgerSchema.index({ storeId: 1 });
stockLedgerSchema.index({ product: 1, createdAt: -1 });    // ledger history per product
stockLedgerSchema.index({ storeId: 1, createdAt: -1 });    // store-wide audit log
stockLedgerSchema.index({ changeType: 1 });                // filter by type
stockLedgerSchema.index({ orderId: 1 });                   // trace order's stock impact

module.exports = mongoose.model('StockLedger', stockLedgerSchema);
