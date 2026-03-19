const mongoose = require('mongoose');
const ChatMessage = require('../models/ChatMessage');

const getChatHistory = async ({ storeId, sessionId, page = 1, limit = 50 }) => {
  const skip = (page - 1) * limit;

  const messages = await ChatMessage.find({ storeId, sessionId, isDeleted: false })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('senderUser', 'name role');

  return { count: messages.length, data: messages };
};

const getActiveChats = async (storeId) => {
  const activeChats = await ChatMessage.aggregate([
    { $match: { storeId: new mongoose.Types.ObjectId(storeId), isDeleted: false } },
    { $sort: { createdAt: -1 } },
    { 
      $group: {
        _id: "$sessionId",
        lastMessage: { $first: "$$ROOT" },
        unreadCount: { 
          $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] } 
        }
      }
    },
    { $sort: { "lastMessage.createdAt": -1 } }
  ]);

  return { count: activeChats.length, data: activeChats };
};

const sendMessage = async ({ storeId, sessionId, senderRole, senderUserId, senderName, messageType, content, productCard, orderId }) => {
  const message = await ChatMessage.create({
    storeId,
    sessionId,
    senderRole: senderRole || 'customer',
    senderUser: senderUserId || null,
    senderName,
    messageType: messageType || 'text',
    content,
    productCard,
    orderId
  });

  return { data: message };
};

const markAsRead = async (storeId, sessionId) => {
  const result = await ChatMessage.updateMany(
    { storeId, sessionId, isRead: false },
    { $set: { isRead: true, readAt: Date.now() } }
  );

  return { updatedCount: result.modifiedCount };
};

const getUnreadCount = async (storeId) => {
  const count = await ChatMessage.countDocuments({ 
    storeId, 
    isRead: false,
    isDeleted: false 
  });

  return { count };
};

module.exports = {
  getChatHistory,
  getActiveChats,
  sendMessage,
  markAsRead,
  getUnreadCount
};