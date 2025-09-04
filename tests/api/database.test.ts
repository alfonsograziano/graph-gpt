// Mock mongoose first
jest.mock("mongoose", () => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
  connection: {
    readyState: 0,
  },
}));

import {
  connectToDatabase,
  disconnectFromDatabase,
  getConnectionStatus,
} from "@/lib/database";

// Mock logger
jest.mock("@/utils/errorHandler", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe("Database Connection", () => {
  const originalEnv = process.env;
  const mockMongoose = require("mongoose");

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("connectToDatabase", () => {
    it("should throw error when MONGODB_URI is not defined", async () => {
      delete process.env.MONGODB_URI;

      await expect(connectToDatabase()).rejects.toThrow(
        "MONGODB_URI environment variable is not defined"
      );
    });

    it("should connect successfully when MONGODB_URI is provided", async () => {
      process.env.MONGODB_URI = "mongodb://localhost:27017/test";
      mockMongoose.connect.mockResolvedValue(undefined);

      await expect(connectToDatabase()).resolves.not.toThrow();
      expect(mockMongoose.connect).toHaveBeenCalledWith(
        "mongodb://localhost:27017/test",
        expect.objectContaining({
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        })
      );
    });
  });

  describe("getConnectionStatus", () => {
    it("should return false when not connected", () => {
      mockMongoose.connection.readyState = 0;

      expect(getConnectionStatus()).toBe(false);
    });

    it("should return true when connected", () => {
      mockMongoose.connection.readyState = 1;

      expect(getConnectionStatus()).toBe(true);
    });
  });

  describe("disconnectFromDatabase", () => {
    it("should disconnect successfully", async () => {
      mockMongoose.disconnect.mockResolvedValue(undefined);

      await expect(disconnectFromDatabase()).resolves.not.toThrow();
      expect(mockMongoose.disconnect).toHaveBeenCalled();
    });
  });
});
