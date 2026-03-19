const express = require('express');
const router = express.Router();

const {
  getChatHistory,
  getActiveChats,
  sendMessage,
  markAsRead,
  getUnreadCount
} = require('../controllers/chatController');

// Import authentication middleware
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// ─── DASHBOARD ROUTES (Store Owner / Staff only) ───
// These require the user to be logged in with a valid JWT
router.get('/:storeId/conversations', protect, getActiveChats);
router.get('/:storeId/unread', protect, getUnreadCount);

// ─── CUSTOMER CHAT ROUTES (Public with optional staff auth) ───
// A customer doesn't have an account, so these use optionalAuth.
// If an admin/owner makes these requests, optionalAuth attaches their user details.
router.get('/:storeId/conversations/:sessionId', optionalAuth, getChatHistory);
router.put('/:storeId/conversations/:sessionId/read', optionalAuth, markAsRead);
router.post('/message', optionalAuth, sendMessage);

module.exports = router;