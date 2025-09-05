import { configService } from "../../src/services/configService";

// Mock environment variables
const originalEnv = process.env;

describe("ConfigService", () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    // Reset the singleton instance
    (
      configService as unknown as { constructor: { instance: undefined } }
    ).constructor.instance = undefined;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("getOpenAIConfig", () => {
    it("should return valid config with all environment variables set", () => {
      process.env.OPENAI_API_KEY = "test-api-key";
      process.env.OPENAI_MODEL = "gpt-4";
      process.env.OPENAI_MAX_TOKENS = "2000";
      process.env.OPENAI_TEMPERATURE = "0.5";
      process.env.OPENAI_BASE_URL = "https://api.openai.com/v1";

      const config = configService.getOpenAIConfig();

      expect(config).toEqual({
        apiKey: "test-api-key",
        model: "gpt-4",
        maxTokens: 2000,
        temperature: 0.5,
        baseUrl: "https://api.openai.com/v1",
      });
    });

    it("should use default values when environment variables are not set", () => {
      process.env.OPENAI_API_KEY = "test-api-key";

      const config = configService.getOpenAIConfig();

      expect(config).toEqual({
        apiKey: "test-api-key",
        model: "gpt-4",
        maxTokens: 4000,
        temperature: 0.7,
        baseUrl: "https://api.openai.com/v1",
      });
    });

    it("should throw error when OPENAI_API_KEY is missing", () => {
      delete process.env.OPENAI_API_KEY;

      expect(() => configService.getOpenAIConfig()).toThrow(
        "OPENAI_API_KEY environment variable is required"
      );
    });

    it("should throw error when OPENAI_MAX_TOKENS is invalid", () => {
      process.env.OPENAI_API_KEY = "test-api-key";
      process.env.OPENAI_MAX_TOKENS = "invalid";

      expect(() => configService.getOpenAIConfig()).toThrow(
        "OPENAI_MAX_TOKENS must be a positive number"
      );
    });

    it("should throw error when OPENAI_TEMPERATURE is out of range", () => {
      process.env.OPENAI_API_KEY = "test-api-key";
      process.env.OPENAI_TEMPERATURE = "3.0";

      expect(() => configService.getOpenAIConfig()).toThrow(
        "OPENAI_TEMPERATURE must be between 0 and 2"
      );
    });
  });

  describe("validateEnvironment", () => {
    it("should pass validation with valid environment", () => {
      process.env.OPENAI_API_KEY = "test-api-key";

      expect(() => configService.validateEnvironment()).not.toThrow();
    });

    it("should throw error with invalid environment", () => {
      delete process.env.OPENAI_API_KEY;

      expect(() => configService.validateEnvironment()).toThrow(
        "Environment validation failed"
      );
    });
  });
});
