"use client";

import { useCallback, useMemo, useEffect } from "react";
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
import { Conversation, ReactFlowEdge, Node } from "@/types";
import { ConversationNode } from "./ConversationNode";
import { ActiveEdge } from "./ActiveEdge";
import { isEdgeActive } from "@/utils/graphTraversal";

interface GraphCanvasProps {
  conversation: Conversation;
  activeNodePath: string[];
  onNodeClick?: (nodeId: string) => void;
  onEdgeClick?: (edgeId: string) => void;
  onMessageSubmit?: (message: string, nodeId: string) => void;
  onMessageChange?: (message: string, nodeId: string) => void;
  onBranchCreate?: (nodeId: string, parentNodeHeight?: number) => void;
  onMarkdownBranchCreate?: (
    direction: "left" | "right",
    elementType: string,
    content: React.ReactNode,
    parentNodeId: string,
    handleId: string
  ) => void;
  onNodeDelete?: (nodeId: string) => void;
  onNodePositionUpdate?: (
    nodeId: string,
    position: { x: number; y: number }
  ) => void;
  streamingNodeId?: string | null;
  streamingContent?: string;
  isStreaming?: boolean;
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
  onMessageSubmit,
  onMessageChange,
  onBranchCreate,
  onMarkdownBranchCreate,
  onNodeDelete,
  onNodePositionUpdate,
  streamingNodeId,
  streamingContent,
  isStreaming,
}) => {
  const { getNode } = useReactFlow();
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
      console.log("Creating ReactFlow edge:", {
        edgeId: edge.id,
        source: edge.sourceNodeId,
        target: edge.targetNodeId,
        sourceHandle,
        metadata: edge.metadata,
      });

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

  // Custom node component wrapper to pass props
  const CustomNodeWrapper = useCallback(
    ({ data }: { data: { node: Node } }) => {
      const handleBranchCreate = (nodeId: string) => {
        // Get the React Flow node to access its dimensions
        const reactFlowNode = getNode(nodeId);
        const nodeHeight = reactFlowNode?.height ?? undefined;

        // Call the original onBranchCreate with the height
        onBranchCreate?.(nodeId, nodeHeight);
      };

      return (
        <ConversationNode
          node={data.node}
          isActive={activeNodePath.includes(data.node.id)}
          onNodeClick={onNodeClick}
          onMessageSubmit={onMessageSubmit}
          onMessageChange={onMessageChange}
          onBranchCreate={handleBranchCreate}
          onMarkdownBranchCreate={onMarkdownBranchCreate}
          onNodeDelete={onNodeDelete}
          streamingContent={
            streamingNodeId === data.node.id ? streamingContent : undefined
          }
        />
      );
    },
    [
      onNodeClick,
      onMessageSubmit,
      onBranchCreate,
      onMarkdownBranchCreate,
      onNodeDelete,
      getNode,
      activeNodePath,
      streamingNodeId,
      streamingContent,
      onMessageChange,
    ]
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
