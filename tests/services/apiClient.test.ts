import { apiClient } from "../../src/services/apiClient";
import { ApiResponse } from "../../src/types";

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe("ApiClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("request", () => {
    it("should make successful API request", async () => {
      const mockData = { id: "1", title: "Test" };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockData,
        }),
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await apiClient.request("/test");

      expect(mockFetch).toHaveBeenCalledWith("/api/test", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      expect(result).toEqual(mockData);
    });

    it("should handle POST request with body", async () => {
      const mockData = { id: "1", title: "Test" };
      const requestBody = { title: "New Test" };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockData,
        }),
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await apiClient.request("/test", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/test", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(requestBody),
      });
      expect(result).toEqual(mockData);
    });

    it("should handle custom headers", async () => {
      const mockData = { id: "1", title: "Test" };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockData,
        }),
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      await apiClient.request("/test", {
        headers: {
          Authorization: "Bearer token",
        },
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/test", {
        headers: {
          Authorization: "Bearer token",
          "Content-Type": "application/json",
        },
      });
    });

    it("should throw error when response is not ok", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        json: jest.fn().mockResolvedValue({
          message: "Not found",
        }),
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      await expect(apiClient.request("/test")).rejects.toThrow("Not found");
    });

    it("should throw error when response is not ok and no message", async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: jest.fn().mockRejectedValue(new Error("JSON parse error")),
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      await expect(apiClient.request("/test")).rejects.toThrow(
        "API Error: 500"
      );
    });

    it("should throw error when API response indicates failure", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: false,
          error: "API Error",
        }),
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      await expect(apiClient.request("/test")).rejects.toThrow("API Error");
    });

    it("should throw generic error when API response indicates failure with no error message", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: false,
        }),
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      await expect(apiClient.request("/test")).rejects.toThrow(
        "API request failed"
      );
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      await expect(apiClient.request("/test")).rejects.toThrow("Network error");
    });
  });
});
