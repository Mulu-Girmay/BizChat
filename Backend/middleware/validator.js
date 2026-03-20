// Simple basic validator placeholder. Can be swapped with Joi or express-validator
exports.validateBody = (requiredFields) => {
  return (req, res, next) => {
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ success: false, message: `Please supply ${field}` });
      }
    }
    next();
  };
};
