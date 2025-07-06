import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

/**
 * Custom error class for HTTP errors
 */
export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

/**
 * Express middleware to handle errors globally
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err); // Optionally log the stack trace

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({ error: message });
};
