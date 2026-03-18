const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatMessage:
 *       type: object
 *       properties:
 *         _id:         { type: string }
 *         storeId:     { type: string }
 *         sessionId:   { type: string }
 *         senderRole:  { type: string, enum: [owner, employee, customer] }
 *         messageType: { type: string, enum: [text, product_card, order_confirmation, order_cancelled, system] }
 *         content:     { type: string }
 *         productCard: { type: object }
 *         isRead:      { type: boolean }
 */

// ─── Embedded product card (sent inside chat bubble) ─────────────────────────
const productCardSchema = new mongoose.Schema(
  {
    productId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name:          { type: String },
    imageUrl:      { type: String, default: '' },
    originalPrice: { type: Number },
    vipPrice:      { type: Number, default: null }, // null = no override
    stock:         { type: Number },                // snapshot at send time
    quantity:      { type: Number, default: 1 },    // pre-filled quantity for cart
  },
  { _id: false }
);

const chatMessageSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },

    // Browser / socket session — links message to a specific customer conversation
    sessionId: {
      type: String,
      required: true,
    },

    // The human-facing side: who sent this message
    senderRole: {
      type: String,
      enum: ['owner', 'employee', 'customer'],
      required: true,
    },

    // If sent by staff, track which user
    senderUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Customer display name (anonymous, provided voluntarily)
    senderName: {
      type: String,
      default: 'Customer',
    },

    // What kind of message is this?
    messageType: {
      type: String,
      enum: ['text', 'product_card', 'order_confirmation', 'order_cancelled', 'system'],
      default: 'text',
    },

    // Plain text content (used for text + system messages)
    content: {
      type: String,
      trim: true,
      maxlength: [2000, 'Message too long'],
      default: '',
    },

    // Structured product data (only present when messageType = 'product_card')
    productCard: {
      type: productCardSchema,
      default: null,
    },

    // Order reference (only present when messageType = 'order_confirmation' | 'order_cancelled')
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },

    // Read receipts
    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },

    // Soft delete – hide without destroying history
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
chatMessageSchema.index({ storeId: 1, sessionId: 1 });   // load chat history
chatMessageSchema.index({ storeId: 1, createdAt: -1 });  // recent messages first
chatMessageSchema.index({ isRead: 1 });                   // unread count queries

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
