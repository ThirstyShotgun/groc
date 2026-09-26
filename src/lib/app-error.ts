import { NextResponse } from 'next/server';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(message, 400, 'BAD_REQUEST', details);
  }

  static notFound(message = 'Resource not found', details?: unknown) {
    return new AppError(message, 400, 'NOT_FOUND', details);
  }

  static unauthorized(message = 'Unauthorized access', details?: unknown) {
    return new AppError(message, 401, 'UNAUTHORIZED', details);
  }

  static rateLimit(message = 'Too many requests, please slow down', details?: unknown) {
    return new AppError(message, 429, 'RATE_LIMITED', details);
  }

  static internal(message = 'An unexpected server error occurred', details?: unknown) {
    return new AppError(message, 500, 'INTERNAL_SERVER_ERROR', details);
  }

  toResponse(): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: this.code,
          message: this.message,
          ...(this.details !== undefined ? { details: this.details } : {})
        }
      },
      { status: this.statusCode }
    );
  }
}

export function handleApiError(err: unknown, context: string): NextResponse {
  console.error(`[AppError] Context: ${context} | Details:`, err);

  if (err instanceof AppError) {
    return err.toResponse();
  }

  if (err instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: err.message
        }
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'An unknown server error occurred'
      }
    },
    { status: 500 }
  );
}
