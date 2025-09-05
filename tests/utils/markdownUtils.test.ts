import { sanitizeMarkdown } from "@/utils/markdownUtils";

describe("markdownUtils", () => {
  describe("sanitizeMarkdown", () => {
    it("should remove script tags", () => {
      const content = "Hello <script>alert('xss')</script> world";
      const result = sanitizeMarkdown(content);
      expect(result).toBe("Hello  world");
    });

    it("should remove iframe tags", () => {
      const content = "Content <iframe src='evil.com'></iframe> here";
      const result = sanitizeMarkdown(content);
      expect(result).toBe("Content  here");
    });

    it("should remove javascript: URLs", () => {
      const content = "Link: [Click](javascript:alert('xss'))";
      const result = sanitizeMarkdown(content);
      expect(result).toBe("Link: [Click]('xss'))");
    });

    it("should remove event handlers", () => {
      const content = "<div onclick='alert(1)'>Click me</div>";
      const result = sanitizeMarkdown(content);
      expect(result).toBe("<div>Click me</div>");
    });

    it("should preserve safe content", () => {
      const content = "# Hello\n\nThis is **bold** text.";
      const result = sanitizeMarkdown(content);
      expect(result).toBe(content);
    });
  });
});
