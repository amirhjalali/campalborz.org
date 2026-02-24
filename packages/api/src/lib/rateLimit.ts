import rateLimit from 'express-rate-limit';

/**
 * Global rate limiter: applies to all API routes.
 * 100 requests per 15 minutes per IP.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please try again later.',
    retryAfter: 15,
  },
});

/**
 * Strict rate limiter for auth endpoints (login, register, forgot-password).
 * 10 requests per 15 minutes per IP to prevent brute-force attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts. Please try again in 15 minutes.',
    retryAfter: 15,
  },
});

/**
 * Rate limiter for public form submissions (applications, contact).
 * 5 requests per hour per IP to prevent spam.
 */
export const submissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many submissions. Please try again later.',
    retryAfter: 60,
  },
});
