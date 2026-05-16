const rateLimit = require('express-rate-limit');

/* Factory — creates a rate limiter with given window + max */
const limiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message:         { success: false, message },
    standardHeaders: true,   // Return limit info in `RateLimit-*` headers
    legacyHeaders:   false,  // Disable `X-RateLimit-*` headers
    skipSuccessfulRequests: false,
  });

/* Applied globally to every request */
exports.globalRateLimiter = limiter(15 * 60 * 1000, 300, 'Too many requests — try again later');

/* Tight limit for login/register to block brute-force */
exports.authLimiter = limiter(15 * 60 * 1000, 10, 'Too many auth attempts — try again in 15 minutes');

/* Search endpoint limit */
exports.searchLimiter = limiter(60 * 1000, 40, 'Too many search requests');

/* Admin endpoints — stricter */
exports.adminLimiter = limiter(15 * 60 * 1000, 100, 'Too many admin requests');
