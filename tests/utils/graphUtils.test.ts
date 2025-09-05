import {
  calculateNodePosition,
  generateNodeId,
  generateEdgeId,
  createInputNode,
  createEdge,
  isPositionWithinBounds,
  adjustPositionToBounds,
  NODE_SPACING,
  NODE_WIDTH,
  NODE_HEIGHT,
} from "../../src/utils/graphUtils";
import { Node, Position } from "../../src/types";

describe("graphUtils", () => {
  describe("calculateNodePosition", () => {
    it("should calculate position below parent node with proper spacing", () => {
      const parentNode: Node = {
        id: "parent-node",
        conversationId: "test-conversation",
        type: "completed",
        userMessage: "Test message",
        assistantResponse: "Test response",
        position: { x: 100, y: 200 },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = calculateNodePosition(parentNode);

      expect(result).toEqual({
        x: 100, // Same horizontal position
        y: 320, // 200 + NODE_SPACING (120)
      });
    });

    it("should maintain horizontal alignment", () => {
      const parentNode: Node = {
        id: "parent-node",
        conversationId: "test-conversation",
        type: "completed",
        userMessage: "Test message",
        assistantResponse: "Test response",
        position: { x: 500, y: 100 },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = calculateNodePosition(parentNode);

      expect(result.x).toBe(500);
      expect(result.y).toBe(220); // 100 + NODE_SPACING
    });
  });

  describe("generateNodeId", () => {
    it("should generate unique node IDs", () => {
      const id1 = generateNodeId();
      const id2 = generateNodeId();

      expect(id1).toMatch(/^node_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^node_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });

    it("should include timestamp in ID", () => {
      const id = generateNodeId();
      const parts = id.split("_");
      expect(parts[1]).toMatch(/^\d+$/);
    });
  });

  describe("generateEdgeId", () => {
    it("should generate unique edge IDs", () => {
      const id1 = generateEdgeId();
      const id2 = generateEdgeId();

      expect(id1).toMatch(/^edge_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^edge_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe("createInputNode", () => {
    it("should create input node with correct properties", () => {
      const conversationId = "test-conversation";
      const position: Position = { x: 100, y: 200 };
      const parentNodeId = "parent-node";

      const result = createInputNode(conversationId, position, parentNodeId);

      expect(result).toEqual({
        conversationId,
        type: "input",
        userMessage: "",
        assistantResponse: "",
        position,
        parentNodeId,
      });
    });

    it("should create input node without parentNodeId", () => {
      const conversationId = "test-conversation";
      const position: Position = { x: 100, y: 200 };

      const result = createInputNode(conversationId, position);

      expect(result).toEqual({
        conversationId,
        type: "input",
        userMessage: "",
        assistantResponse: "",
        position,
        parentNodeId: undefined,
      });
    });
  });

  describe("createEdge", () => {
    it("should create edge with correct properties", () => {
      const conversationId = "test-conversation";
      const sourceNodeId = "source-node";
      const targetNodeId = "target-node";
      const type = "auto";

      const result = createEdge(
        conversationId,
        sourceNodeId,
        targetNodeId,
        type
      );

      expect(result).toEqual({
        conversationId,
        sourceNodeId,
        targetNodeId,
        type,
        metadata: {
          createdBy: "branch-creation",
        },
      });
    });

    it("should default to auto type", () => {
      const conversationId = "test-conversation";
      const sourceNodeId = "source-node";
      const targetNodeId = "target-node";

      const result = createEdge(conversationId, sourceNodeId, targetNodeId);

      expect(result.type).toBe("auto");
    });
  });

  describe("isPositionWithinBounds", () => {
    it("should return true for position within bounds", () => {
      const position: Position = { x: 100, y: 200 };
      const canvasWidth = 1000;
      const canvasHeight = 1000;

      const result = isPositionWithinBounds(
        position,
        canvasWidth,
        canvasHeight
      );

      expect(result).toBe(true);
    });

    it("should return false for position outside bounds", () => {
      const position: Position = { x: 1200, y: 200 }; // x is too far right
      const canvasWidth = 1000;
      const canvasHeight = 1000;

      const result = isPositionWithinBounds(
        position,
        canvasWidth,
        canvasHeight
      );

      expect(result).toBe(false);
    });

    it("should return false for negative position", () => {
      const position: Position = { x: -100, y: 200 };
      const canvasWidth = 1000;
      const canvasHeight = 1000;

      const result = isPositionWithinBounds(
        position,
        canvasWidth,
        canvasHeight
      );

      expect(result).toBe(false);
    });

    it("should use default canvas size when not provided", () => {
      const position: Position = { x: 500, y: 500 };

      const result = isPositionWithinBounds(position);

      expect(result).toBe(true);
    });
  });

  describe("adjustPositionToBounds", () => {
    it("should adjust position to stay within bounds", () => {
      const position: Position = { x: 1200, y: 200 };
      const canvasWidth = 1000;
      const canvasHeight = 1000;

      const result = adjustPositionToBounds(
        position,
        canvasWidth,
        canvasHeight
      );

      expect(result).toEqual({
        x: 700, // 1000 - NODE_WIDTH (300)
        y: 200,
      });
    });

    it("should adjust negative position to zero", () => {
      const position: Position = { x: -100, y: -50 };
      const canvasWidth = 1000;
      const canvasHeight = 1000;

      const result = adjustPositionToBounds(
        position,
        canvasWidth,
        canvasHeight
      );

      expect(result).toEqual({
        x: 0,
        y: 0,
      });
    });

    it("should not adjust position that is already within bounds", () => {
      const position: Position = { x: 100, y: 200 };
      const canvasWidth = 1000;
      const canvasHeight = 1000;

      const result = adjustPositionToBounds(
        position,
        canvasWidth,
        canvasHeight
      );

      expect(result).toEqual(position);
    });
  });

  describe("constants", () => {
    it("should have correct spacing constants", () => {
      expect(NODE_SPACING).toBe(120);
      expect(NODE_WIDTH).toBe(300);
      expect(NODE_HEIGHT).toBe(100);
    });
  });
});
