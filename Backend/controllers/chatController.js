const chatService = require('../services/chatService');

// 1. Fetch Chat History (with pagination)
exports.getChatHistory = async (req, res, next) => {
  try {
    const { storeId, sessionId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const result = await chatService.getChatHistory({ storeId, sessionId, page, limit });

    res.status(200).json({ success: true, count: result.count, data: result.data });
  } catch (err) {
    next(err);
  }
};

// 2. Fetch Active Conversations for a Store
exports.getActiveChats = async (req, res, next) => {
  try {
    const { storeId } = req.params;

    const result = await chatService.getActiveChats(storeId);

    res.status(200).json({ success: true, count: result.count, data: result.data });
  } catch (err) {
    next(err);
  }
};

// 3. Send a Message (API Fallback)
exports.sendMessage = async (req, res, next) => {
  try {
    const { storeId, sessionId, senderRole, senderName, messageType, content, productCard, orderId } = req.body;
    
    const result = await chatService.sendMessage({
      storeId,
      sessionId,
      senderRole,
      senderUserId: req.user ? req.user.id : null, 
      senderName,
      messageType,
      content,
      productCard,
      orderId
    });

    res.status(201).json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const { storeId, sessionId } = req.params;

    const result = await chatService.markAsRead(storeId, sessionId);

    res.status(200).json({ success: true, updatedCount: result.updatedCount });
  } catch (err) {
    next(err);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const { storeId } = req.params;

    const result = await chatService.getUnreadCount(storeId);

    res.status(200).json({ success: true, count: result.count });
  } catch (err) {
    next(err);
  }
};