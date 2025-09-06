"use client";

import { useCallback, useMemo, useEffect, useState } from "react";
import ReactFlow, {
  Node as ReactFlowNodeType,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ConnectionMode,
  BackgroundVariant,
  NodeTypes,
  EdgeTypes,
  ReactFlowProvider,
  PanOnScrollMode,
  NodeDragHandler,
} from "reactflow";
import "reactflow/dist/style.css";
import { Conversation, ReactFlowEdge, Node, Position } from "@/types";
import { ConversationNode } from "./ConversationNode";
import { ActiveEdge } from "./ActiveEdge";
import { ContextMenu } from "./ContextMenu";
import { isEdgeActive } from "@/utils/graphTraversal";

interface GraphCanvasProps {
  conversation: Conversation;
  activeNodePath: string[];
  onNodeClick?: (nodeId: string) => void;
  onEdgeClick?: (edgeId: string) => void;
  onNodePositionUpdate?: (
    nodeId: string,
    position: { x: number; y: number }
  ) => void;
  createNodeAtPosition?: (position: Position) => Promise<Node | null>;
}

// Custom node types - will be defined inline with wrapper

const edgeTypes: EdgeTypes = {
  activeEdge: ActiveEdge,
};

const GraphCanvasInner: React.FC<GraphCanvasProps> = ({
  conversation,
  activeNodePath,
  onNodeClick,
  onEdgeClick,
  onNodePositionUpdate,
  createNodeAtPosition,
}) => {
  const { getNode, screenToFlowPosition } = useReactFlow();

  // Contextual menu state
  const [contextMenu, setContextMenu] = useState<{
    isVisible: boolean;
    position: Position;
  }>({
    isVisible: false,
    position: { x: 0, y: 0 },
  });
  // Transform conversation data to React Flow format
  const initialNodes: ReactFlowNodeType[] = useMemo(() => {
    // If conversation has no nodes, we need to create a default input node
    // This will be handled by the parent component when the user first interacts
    if (conversation.nodes.length === 0) {
      return [];
    }

    return conversation.nodes.map((node) => ({
      id: node.id,
      type: "conversationNode",
      position: node.position,
      draggable: true,
      data: {
        node: node,
      },
    }));
  }, [conversation.nodes]);

  const initialEdges: ReactFlowEdge[] = useMemo(() => {
    return conversation.edges.map((edge) => {
      const sourceHandle = edge.sourceHandle;

      return {
        id: edge.id,
        source: edge.sourceNodeId,
        target: edge.targetNodeId,
        sourceHandle: sourceHandle,
        type: "activeEdge",
        data: {
          type: edge.type,
          createdAt: edge.createdAt,
          metadata: edge.metadata,
          isActive: isEdgeActive(edge.id, activeNodePath, conversation.edges),
        },
      };
    });
  }, [conversation.edges, activeNodePath]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when conversation data changes
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  // Update edges when conversation data changes
  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Auto-fit view when nodes change
  useEffect(() => {
    if (nodes.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        const reactFlowInstance = document.querySelector(".react-flow");
        if (reactFlowInstance) {
          // Trigger fitView programmatically
          const event = new CustomEvent("fitView");
          reactFlowInstance.dispatchEvent(event);
        }
      }, 100);
    }
  }, [nodes.length]);

  const onNodeClickHandler = useCallback(
    (event: React.MouseEvent, node: ReactFlowNodeType) => {
      onNodeClick?.(node.id);
    },
    [onNodeClick]
  );

  const onEdgeClickHandler = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      onEdgeClick?.(edge.id);
    },
    [onEdgeClick]
  );

  const onNodeDragStop: NodeDragHandler = useCallback(
    (event, node) => {
      // Only update position if the node was actually dragged (position changed)
      if (onNodePositionUpdate) {
        // Find the original node position from conversation data
        const originalNode = conversation.nodes.find((n) => n.id === node.id);
        if (originalNode) {
          const originalPosition = originalNode.position;
          const newPosition = node.position;

          // Only update if position actually changed
          if (
            originalPosition.x !== newPosition.x ||
            originalPosition.y !== newPosition.y
          ) {
            onNodePositionUpdate(node.id, node.position);
          }
        }
      }
    },
    [onNodePositionUpdate, conversation.nodes]
  );

  // Close contextual menu
  const closeContextMenu = useCallback(() => {
    setContextMenu({
      isVisible: false,
      position: { x: 0, y: 0 },
    });
  }, []);

  // Handle right-click on canvas
  const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();

    setContextMenu({
      isVisible: true,
      position: {
        x: event.clientX,
        y: event.clientY,
      },
    });
  }, []);

  // Handle left-click on canvas to close context menu
  const onPaneClick = useCallback(() => {
    if (contextMenu.isVisible) {
      closeContextMenu();
    }
  }, [contextMenu.isVisible, closeContextMenu]);

  // Handle right-click on nodes (prevent contextual menu)
  const onNodeContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    // Don't show contextual menu on nodes
  }, []);

  // Handle create new node from contextual menu
  const handleCreateNode = useCallback(async () => {
    if (!createNodeAtPosition) return;

    try {
      // Convert screen coordinates to flow coordinates
      const flowPosition = screenToFlowPosition({
        x: contextMenu.position.x,
        y: contextMenu.position.y,
      });

      await createNodeAtPosition(flowPosition);
      closeContextMenu();
    } catch (error) {
      console.error("Failed to create node:", error);
      closeContextMenu();
    }
  }, [
    createNodeAtPosition,
    contextMenu.position,
    screenToFlowPosition,
    closeContextMenu,
  ]);

  // Custom node component wrapper to pass props
  const CustomNodeWrapper = useCallback(
    ({ data }: { data: { node: Node } }) => {
      // Get the React Flow node to access its dimensions
      const reactFlowNode = getNode(data.node.id);
      const nodeHeight = reactFlowNode?.height ?? undefined;

      return (
        <ConversationNode
          node={data.node}
          isActive={activeNodePath.includes(data.node.id)}
          onNodeClick={onNodeClick}
          nodeHeight={nodeHeight}
        />
      );
    },
    [onNodeClick, activeNodePath, getNode]
  );

  // Update node types with wrapper
  const customNodeTypes: NodeTypes = useMemo(
    () => ({
      conversationNode: CustomNodeWrapper,
    }),
    [CustomNodeWrapper]
  );

  return (
    <div className="w-full h-full min-h-screen bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClickHandler}
        onEdgeClick={onEdgeClickHandler}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={onPaneClick}
        onPaneContextMenu={onPaneContextMenu}
        onNodeContextMenu={onNodeContextMenu}
        nodeTypes={customNodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{
          padding: 0.1,
          includeHiddenNodes: false,
        }}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        panOnDrag={true}
        panOnScroll={true}
        panOnScrollMode={PanOnScrollMode.Free}
        zoomOnScroll={true}
        zoomOnPinch={true}
        preventScrolling={false}
        className="w-full h-full"
        style={{
          width: "100%",
          height: "100%",
          minHeight: "100vh",
        }}
      >
        <Controls
          position="top-right"
          showInteractive={false}
          className="bg-white shadow-lg border border-gray-200 rounded-lg"
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#e5e7eb"
        />
      </ReactFlow>

      <ContextMenu
        isVisible={contextMenu.isVisible}
        position={contextMenu.position}
        onClose={closeContextMenu}
        onCreateNode={handleCreateNode}
      />
    </div>
  );
};

export const GraphCanvas: React.FC<GraphCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <GraphCanvasInner {...props} />
    </ReactFlowProvider>
  );
};
