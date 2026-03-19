const fs = require('fs');
const path = require('path');

const files = [
  "config/db.js", "config/redis.js", "controllers/authController.js", "controllers/chatController.js", "controllers/inventoryController.js", "controllers/orderController.js", "controllers/userController.js", "docs/swagger.js", "middleware/authMiddleware.js", "middleware/errorHandler.js", "middleware/rateLimiter.js", "middleware/roleMiddleware.js", "middleware/validator.js", "models/ChatMessage.js", "models/Order.js", "models/Product.js", "models/StockLedger.js", "models/Store.js", "models/User.js", "routes/authRoutes.js", "routes/chatRoutes.js", "routes/inventoryRoutes.js", "routes/orderRoutes.js", "routes/userRoutes.js", "server.js", "services/authService.js", "services/chatService.js", "services/inventoryService.js", "services/orderService.js", "services/userService.js", "sockets/chatSocket.js", "utils/concurrencyLock.js", "utils/emailService.js", "utils/linkGenerator.js", "utils/nlpParser.js", "utils/pdfGenerator.js"
];

for (const file of files) {
  try {
    require('./' + file);
  } catch (err) {
    console.error(`Error loading ${file}:`, err.message);
  }
}
console.log('Done scanning.');
