// Wraps an async route handler so thrown errors reach errorHandler
// instead of crashing the process.
exports.asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

exports.notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
};

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  console.error(err);

  let status = err.statusCode || 500;
  let message = err.message || 'Server error. Please try again.';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    status = 404;
    message = 'Resource not found.';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    status = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `${field} is already in use.` : 'Duplicate value.';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(' ');
  }

  res.status(status).json({ success: false, message });
};
