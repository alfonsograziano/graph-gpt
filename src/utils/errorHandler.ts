import { NextRequest, NextResponse } from "next/server";
import type { DatabaseError } from "@/types";

// Log levels
export enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
}

// Logger interface
export interface Logger {
  error: (message: string, error?: Error | unknown, context?: unknown) => void;
  warn: (message: string, context?: unknown) => void;
  info: (message: string, context?: unknown) => void;
  debug: (message: string, context?: unknown) => void;
}

// Simple logger implementation
class SimpleLogger implements Logger {
  private log(
    level: LogLevel,
    message: string,
    error?: Error | unknown,
    context?: unknown
  ): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      error: error
        ? error instanceof Error
          ? error.message
          : String(error)
        : undefined,
      context: context ?? undefined,
    };

    // In development, log to console
    if (process.env.NODE_ENV === "development") {
      console[level === LogLevel.ERROR ? "error" : "log"](
        JSON.stringify(logEntry, null, 2)
      );
    }

    // In production, you might want to send to a logging service
    // For now, we'll just use console
    console[level === LogLevel.ERROR ? "error" : "log"](
      JSON.stringify(logEntry, null, 2)
    );
  }

  error(message: string, error?: Error | unknown, context?: unknown): void {
    this.log(LogLevel.ERROR, message, error, context);
  }

  warn(message: string, context?: unknown): void {
    this.log(LogLevel.WARN, message, undefined, context);
  }

  info(message: string, context?: unknown): void {
    this.log(LogLevel.INFO, message, undefined, context);
  }

  debug(message: string, context?: unknown): void {
    this.log(LogLevel.DEBUG, message, undefined, context);
  }
}

// Export logger instance
export const logger: Logger = new SimpleLogger();

// Error types
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends Error {
  public readonly field: string;
  public readonly value?: unknown;

  constructor(field: string, message: string, value?: unknown) {
    super(message);
    this.field = field;
    this.value = value;
    this.name = "ValidationError";
  }
}

export class DatabaseConnectionError extends AppError {
  constructor(message: string = "Database connection failed") {
    super(message, 503);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404);
  }
}

// API error response formatter
export const createErrorResponse = (
  error: Error | AppError,
  request?: NextRequest
): NextResponse => {
  const isAppError = error instanceof AppError;
  const statusCode = isAppError ? error.statusCode : 500;
  const message = isAppError ? error.message : "Internal server error";

  // Log the error
  logger.error("API Error", error, {
    url: request?.url,
    method: request?.method,
    statusCode,
  });

  // Don't expose internal errors in production
  const responseMessage =
    process.env.NODE_ENV === "production" && !isAppError
      ? "Internal server error"
      : message;

  return NextResponse.json(
    {
      success: false,
      error: responseMessage,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    },
    { status: statusCode }
  );
};

// Database error handler
export const handleDatabaseError = (error: unknown): DatabaseError => {
  logger.error("Database error", error);

  // Type guard for objects with properties
  const isErrorWithName = (err: unknown): err is { name: string } => {
    return typeof err === "object" && err !== null && "name" in err;
  };

  const isErrorWithCode = (err: unknown): err is { code: number } => {
    return typeof err === "object" && err !== null && "code" in err;
  };

  const isErrorWithMessage = (err: unknown): err is { message: string } => {
    return typeof err === "object" && err !== null && "message" in err;
  };

  if (isErrorWithName(error) && error.name === "ValidationError") {
    return {
      code: "VALIDATION_ERROR",
      message: "Data validation failed",
      details:
        "errors" in error ? (error as { errors: unknown }).errors : undefined,
    };
  }

  if (isErrorWithName(error) && error.name === "CastError") {
    const castError = error as { path?: string; value?: unknown };
    return {
      code: "CAST_ERROR",
      message: "Invalid data format",
      details: { field: castError.path, value: castError.value },
    };
  }

  if (isErrorWithCode(error) && error.code === 11000) {
    return {
      code: "DUPLICATE_KEY",
      message: "Duplicate entry found",
      details:
        "keyValue" in error
          ? (error as { keyValue: unknown }).keyValue
          : undefined,
    };
  }

  if (isErrorWithName(error) && error.name === "MongoNetworkError") {
    return {
      code: "NETWORK_ERROR",
      message: "Database connection failed",
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "An unexpected database error occurred",
    details: isErrorWithMessage(error) ? error.message : String(error),
  };
};

// Async error wrapper for API routes
export const withErrorHandling = (
  handler: (request: NextRequest, context?: unknown) => Promise<NextResponse>
) => {
  return async (
    request: NextRequest,
    context?: unknown
  ): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return createErrorResponse(error as Error, request);
    }
  };
};

// Validation helper
export const validateRequired = (value: unknown, fieldName: string): void => {
  if (value === undefined || value === null || value === "") {
    throw new ValidationError(fieldName, `${fieldName} is required`);
  }
};

export const validateString = (
  value: unknown,
  fieldName: string,
  minLength?: number,
  maxLength?: number
): void => {
  validateRequired(value, fieldName);

  if (typeof value !== "string") {
    throw new ValidationError(fieldName, `${fieldName} must be a string`);
  }

  if (minLength !== undefined && value.length < minLength) {
    throw new ValidationError(
      fieldName,
      `${fieldName} must be at least ${minLength} characters long`
    );
  }

  if (maxLength !== undefined && value.length > maxLength) {
    throw new ValidationError(
      fieldName,
      `${fieldName} must be no more than ${maxLength} characters long`
    );
  }
};
