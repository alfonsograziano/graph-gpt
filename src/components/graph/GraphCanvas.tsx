"use client";

import { useCallback, useMemo } from "react";
import ReactFlow, {
  Node,
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
} from "reactflow";
import "reactflow/dist/style.css";
import { Conversation } from "@/types";

interface GraphCanvasProps {
  conversation: Conversation;
  onNodeClick?: (nodeId: string) => void;
  onEdgeClick?: (edgeId: string) => void;
}

// Basic node types for now
const nodeTypes: NodeTypes = {
  // Will be expanded in future stories
};

const edgeTypes: EdgeTypes = {
  // Will be expanded in future stories
};

const GraphCanvasInner: React.FC<GraphCanvasProps> = ({
  conversation,
  onNodeClick,
  onEdgeClick,
}) => {
  // Transform conversation data to React Flow format
  const initialNodes: Node[] = useMemo(() => {
    return conversation.nodes.map((node) => ({
      id: node.id,
      type: "default",
      position: node.position,
      data: {
        label: node.userMessage || "Node",
        userMessage: node.userMessage,
        assistantResponse: node.assistantResponse,
        type: node.type,
        createdAt: node.createdAt,
      },
    }));
  }, [conversation.nodes]);

  const initialEdges: Edge[] = useMemo(() => {
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

  const onNodeClickHandler = useCallback(
    (event: React.MouseEvent, node: Node) => {
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

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClickHandler}
        onEdgeClick={onEdgeClickHandler}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{
          padding: 0.1,
          includeHiddenNodes: false,
        }}
        className="bg-gray-50"
      >
        <Controls />
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
