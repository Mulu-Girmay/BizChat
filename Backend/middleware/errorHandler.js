const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  
  // Clean up mongoose validation errors
  let message = err.message;
  if(err.name === 'ValidationError') {
    message = Object.values(err.errors).map(val => val.message).join(', ');
    res.status(400);
  }

  res.json({
    success: false,
    message: message || "Server Error",
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;
