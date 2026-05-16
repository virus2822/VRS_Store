const logger = require('../utils/logger');
const { ApiError } = require('../utils/ApiResponse');

exports.notFound = (req, res, next) => {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));
};

exports.globalErrorHandler = (err, req, res, next) => {
  let error = err;

  /* ── Mongoose: duplicate key (e.g. unique email) ── */
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = new ApiError(409, `${field} already in use`);
  }

  /* ── Mongoose: validation failed ── */
  if (err.name === 'ValidationError') {
    const msg = Object.values(err.errors).map(e => e.message).join(' | ');
    error = new ApiError(400, msg);
  }

  /* ── Mongoose: invalid ObjectId ── */
  if (err.name === 'CastError') {
    error = new ApiError(400, 'Invalid ID format');
  }

  /* ── JWT errors (handled in auth middleware but belt-and-suspenders) ── */
  if (err.name === 'JsonWebTokenError') error = new ApiError(401, 'Invalid token');
  if (err.name === 'TokenExpiredError') error = new ApiError(401, 'Token expired');

  const statusCode = error.statusCode || 500;
  const message    = error.message    || 'Internal Server Error';

  /* ── Log 500s with full stack ── */
  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} — ${message}`, { stack: err.stack });
  }

  res.status(statusCode).json({
    success: false,
    message,
    /* Only expose stack trace in development */
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
