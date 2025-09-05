"use client";

import { useCallback, useMemo, useEffect } from "react";
import ReactFlow, {
  Node as ReactFlowNodeType,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  BackgroundVariant,
  NodeTypes,
  EdgeTypes,
  ReactFlowProvider,
  PanOnScrollMode,
} from "reactflow";
import "reactflow/dist/style.css";
import { Conversation, ReactFlowEdge, Node } from "@/types";
import { ConversationNode } from "./ConversationNode";

interface GraphCanvasProps {
  conversation: Conversation;
  onNodeClick?: (nodeId: string) => void;
  onEdgeClick?: (edgeId: string) => void;
  onMessageSubmit?: (message: string, nodeId: string) => void;
  onBranchCreate?: (nodeId: string) => void;
}

// Custom node types - will be defined inline with wrapper

const edgeTypes: EdgeTypes = {
  // Will be expanded in future stories
};

const GraphCanvasInner: React.FC<GraphCanvasProps> = ({
  conversation,
  onNodeClick,
  onEdgeClick,
  onMessageSubmit,
  onBranchCreate,
}) => {
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
      data: {
        node: node,
      },
    }));
  }, [conversation.nodes]);

  const initialEdges: ReactFlowEdge[] = useMemo(() => {
    return conversation.edges.map((edge) => ({
      id: edge.id,
      source: edge.sourceNodeId,
      target: edge.targetNodeId,
      type: "default",
      data: {
        type: edge.type,
        createdAt: edge.createdAt,
        metadata: edge.metadata,
      },
    }));
  }, [conversation.edges]);

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

  // Custom node component wrapper to pass props
  const CustomNodeWrapper = useCallback(
    ({ data }: { data: { node: Node } }) => {
      return (
        <ConversationNode
          node={data.node}
          onNodeClick={onNodeClick}
          onMessageSubmit={onMessageSubmit}
          onBranchCreate={onBranchCreate}
        />
      );
    },
    [onNodeClick, onMessageSubmit, onBranchCreate]
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
