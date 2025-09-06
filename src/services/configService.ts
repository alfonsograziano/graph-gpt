import { OpenAIConfig } from "../types";

class ConfigService {
  private static instance: ConfigService;

  private constructor() {}

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  public getOpenAIConfig(): OpenAIConfig {
    return this.loadOpenAIConfig();
  }

  private loadOpenAIConfig(): OpenAIConfig {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || "4000", 10);
    const temperature = parseFloat(process.env.OPENAI_TEMPERATURE || "0.7");
    const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }

    if (isNaN(maxTokens) || maxTokens <= 0) {
      throw new Error("OPENAI_MAX_TOKENS must be a positive number");
    }

    if (isNaN(temperature) || temperature < 0 || temperature > 2) {
      throw new Error("OPENAI_TEMPERATURE must be between 0 and 2");
    }

    return {
      apiKey,
      model,
      maxTokens,
      temperature,
      baseUrl,
    };
  }

  public validateEnvironment(): void {
    try {
      this.getOpenAIConfig();
    } catch (error) {
      throw new Error(
        `Environment validation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}

export const configService = ConfigService.getInstance();
