const mongoose = require('mongoose');


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

    sessionId: {
      type: String,
      required: true,
    },

    senderRole: {
      type: String,
      enum: ['owner', 'employee', 'customer'],
      required: true,
    },

    senderUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    senderName: {
      type: String,
      default: 'Customer',
    },

    messageType: {
      type: String,
      enum: ['text', 'product_card', 'order_confirmation', 'order_cancelled', 'system'],
      default: 'text',
    },

    content: {
      type: String,
      trim: true,
      maxlength: [2000, 'Message too long'],
      default: '',
    },

    productCard: {
      type: productCardSchema,
      default: null,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },
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
chatMessageSchema.index({ storeId: 1, sessionId: 1 });   // load chat history
chatMessageSchema.index({ storeId: 1, createdAt: -1 });  // recent messages first
chatMessageSchema.index({ isRead: 1 });                   // unread count queries

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
