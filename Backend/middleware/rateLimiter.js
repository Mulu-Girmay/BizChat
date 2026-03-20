// Placeholder for rate limiter
const rateLimiter = (req, res, next) => {
  // Can be implemented with express-rate-limit or custom redis logic
  next();
};

module.exports = rateLimiter;
