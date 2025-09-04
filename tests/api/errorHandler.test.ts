import {
  AppError,
  ValidationError,
  DatabaseConnectionError,
  NotFoundError,
  handleDatabaseError,
  validateRequired,
  validateString,
} from "@/utils/errorHandler";

// Mock logger
jest.mock("@/utils/errorHandler", () => {
  const actual = jest.requireActual("@/utils/errorHandler");
  return {
    ...actual,
    logger: {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    },
  };
});

describe("Error Handling", () => {
  describe("AppError", () => {
    it("should create error with default status code", () => {
      const error = new AppError("Test error");

      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
    });

    it("should create error with custom status code", () => {
      const error = new AppError("Not found", 404);

      expect(error.message).toBe("Not found");
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
    });

    it("should create non-operational error", () => {
      const error = new AppError("System error", 500, false);

      expect(error.isOperational).toBe(false);
    });
  });

  describe("ValidationError", () => {
    it("should create validation error with field and message", () => {
      const error = new ValidationError("email", "Invalid email format");

      expect(error.field).toBe("email");
      expect(error.message).toBe("Invalid email format");
      expect(error.name).toBe("ValidationError");
    });

    it("should create validation error with value", () => {
      const error = new ValidationError("age", "Age must be positive", -5);

      expect(error.field).toBe("age");
      expect(error.message).toBe("Age must be positive");
      expect(error.value).toBe(-5);
    });
  });

  describe("DatabaseConnectionError", () => {
    it("should create database connection error with default message", () => {
      const error = new DatabaseConnectionError();

      expect(error.message).toBe("Database connection failed");
      expect(error.statusCode).toBe(503);
    });

    it("should create database connection error with custom message", () => {
      const error = new DatabaseConnectionError("Connection timeout");

      expect(error.message).toBe("Connection timeout");
      expect(error.statusCode).toBe(503);
    });
  });

  describe("NotFoundError", () => {
    it("should create not found error with default resource", () => {
      const error = new NotFoundError();

      expect(error.message).toBe("Resource not found");
      expect(error.statusCode).toBe(404);
    });

    it("should create not found error with custom resource", () => {
      const error = new NotFoundError("User");

      expect(error.message).toBe("User not found");
      expect(error.statusCode).toBe(404);
    });
  });

  describe("handleDatabaseError", () => {
    it("should handle validation errors", () => {
      const validationError = {
        name: "ValidationError",
        errors: { field: "Field is required" },
      };

      const result = handleDatabaseError(validationError);

      expect(result.code).toBe("VALIDATION_ERROR");
      expect(result.message).toBe("Data validation failed");
      expect(result.details).toEqual({ field: "Field is required" });
    });

    it("should handle cast errors", () => {
      const castError = {
        name: "CastError",
        path: "age",
        value: "invalid",
      };

      const result = handleDatabaseError(castError);

      expect(result.code).toBe("CAST_ERROR");
      expect(result.message).toBe("Invalid data format");
      expect(result.details).toEqual({ field: "age", value: "invalid" });
    });

    it("should handle duplicate key errors", () => {
      const duplicateError = {
        code: 11000,
        keyValue: { email: "test@example.com" },
      };

      const result = handleDatabaseError(duplicateError);

      expect(result.code).toBe("DUPLICATE_KEY");
      expect(result.message).toBe("Duplicate entry found");
      expect(result.details).toEqual({ email: "test@example.com" });
    });

    it("should handle network errors", () => {
      const networkError = {
        name: "MongoNetworkError",
        message: "Connection timeout",
      };

      const result = handleDatabaseError(networkError);

      expect(result.code).toBe("NETWORK_ERROR");
      expect(result.message).toBe("Database connection failed");
    });

    it("should handle unknown errors", () => {
      const unknownError = {
        name: "UnknownError",
        message: "Something went wrong",
      };

      const result = handleDatabaseError(unknownError);

      expect(result.code).toBe("UNKNOWN_ERROR");
      expect(result.message).toBe("An unexpected database error occurred");
      expect(result.details).toBe("Something went wrong");
    });
  });

  describe("Validation helpers", () => {
    describe("validateRequired", () => {
      it("should pass for valid values", () => {
        expect(() => validateRequired("test", "field")).not.toThrow();
        expect(() => validateRequired(0, "field")).not.toThrow();
        expect(() => validateRequired(false, "field")).not.toThrow();
      });

      it("should throw for undefined values", () => {
        expect(() => validateRequired(undefined, "field")).toThrow(
          "field is required"
        );
      });

      it("should throw for null values", () => {
        expect(() => validateRequired(null, "field")).toThrow(
          "field is required"
        );
      });

      it("should throw for empty strings", () => {
        expect(() => validateRequired("", "field")).toThrow(
          "field is required"
        );
      });
    });

    describe("validateString", () => {
      it("should pass for valid strings", () => {
        expect(() => validateString("test", "field")).not.toThrow();
        expect(() => validateString("test", "field", 2)).not.toThrow();
        expect(() => validateString("test", "field", 2, 10)).not.toThrow();
      });

      it("should throw for non-string values", () => {
        expect(() => validateString(123, "field")).toThrow(
          "field must be a string"
        );
        expect(() => validateString(null, "field")).toThrow(
          "field is required"
        );
      });

      it("should throw for strings that are too short", () => {
        expect(() => validateString("a", "field", 2)).toThrow(
          "field must be at least 2 characters long"
        );
      });

      it("should throw for strings that are too long", () => {
        expect(() => validateString("very long string", "field", 2, 5)).toThrow(
          "field must be no more than 5 characters long"
        );
      });
    });
  });
});
