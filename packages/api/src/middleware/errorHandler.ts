// Error handling middleware for public API
import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export function handleApiError(
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('API Error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  // Default error response
  let statusCode = error.statusCode || 500;
  let errorCode = error.code || 'INTERNAL_SERVER_ERROR';
  let message = error.message || 'An unexpected error occurred';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Request validation failed';
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    errorCode = 'UNAUTHORIZED';
    message = 'Authentication required';
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    errorCode = 'FORBIDDEN';
    message = 'Access denied';
  } else if (error.name === 'NotFoundError') {
    statusCode = 404;
    errorCode = 'NOT_FOUND';
    message = 'Resource not found';
  } else if (error.name === 'ConflictError') {
    statusCode = 409;
    errorCode = 'CONFLICT';
    message = 'Resource conflict';
  } else if (error.name === 'TooManyRequestsError') {
    statusCode = 429;
    errorCode = 'RATE_LIMIT_EXCEEDED';
    message = 'Too many requests';
  }

  // Prisma database errors
  if (error.name === 'PrismaClientKnownRequestError') {
    statusCode = 400;
    errorCode = 'DATABASE_ERROR';
    message = 'Database operation failed';
  } else if (error.name === 'PrismaClientUnknownRequestError') {
    statusCode = 500;
    errorCode = 'DATABASE_CONNECTION_ERROR';
    message = 'Database connection error';
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode >= 500) {
    message = 'Internal server error';
    delete error.details;
  }

  res.status(statusCode).json({
    error: {
      code: errorCode,
      message,
      details: error.details,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
      }),
    },
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  });
}

// Helper function to create custom API errors
export function createApiError(
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any
): ApiError {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
}

// Common error creators
export const errors = {
  badRequest: (message: string, details?: any) => 
    createApiError(message, 400, 'BAD_REQUEST', details),
  
  unauthorized: (message: string = 'Authentication required') => 
    createApiError(message, 401, 'UNAUTHORIZED'),
  
  forbidden: (message: string = 'Access denied') => 
    createApiError(message, 403, 'FORBIDDEN'),
  
  notFound: (message: string = 'Resource not found') => 
    createApiError(message, 404, 'NOT_FOUND'),
  
  conflict: (message: string, details?: any) => 
    createApiError(message, 409, 'CONFLICT', details),
  
  tooManyRequests: (message: string = 'Too many requests') => 
    createApiError(message, 429, 'RATE_LIMIT_EXCEEDED'),
  
  internal: (message: string = 'Internal server error') => 
    createApiError(message, 500, 'INTERNAL_SERVER_ERROR'),
  
  serviceUnavailable: (message: string = 'Service temporarily unavailable') => 
    createApiError(message, 503, 'SERVICE_UNAVAILABLE'),
};