/* ================================================================
   UTILS — ApiResponse + ApiError
   Centralized response format for entire API
   ================================================================ */

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode    = statusCode;
    this.isOperational = true;              // distinguish from programming errors
    Error.captureStackTrace(this, this.constructor);
  }
}

class ApiResponse {
  /** 2xx success with optional data */
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({ success: true, message, data });
  }

  /** Paginated list response */
  static paginated(res, data, meta, message = 'Success') {
    return res.status(200).json({ success: true, message, data, meta });
  }

  /** 4xx/5xx — prefer throwing ApiError over calling this directly */
  static error(res, message = 'Error', statusCode = 400) {
    return res.status(statusCode).json({ success: false, message });
  }
}

module.exports = { ApiError, ApiResponse };
