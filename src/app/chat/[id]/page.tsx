"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  EdgeTypes,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ConversationNode from "@/components/ConversationNode";
import {
  Conversation,
  ConversationNode as ConversationNodeType,
  FlowNode,
  FlowEdge,
} from "@/types";
import { v4 as uuidv4 } from "uuid";

const nodeTypes: NodeTypes = {
  conversation: ConversationNode,
};

function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState("");

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const reactFlowInstance = useRef<any>(null);

  useEffect(() => {
    if (conversationId) {
      fetchConversation();
    }
  }, [conversationId]);

  useEffect(() => {
    if (conversation) {
      setTitle(conversation.title);
      setNodes(
        conversation.nodes.map((node) => ({
          id: node.id,
          type: "conversation",
          position: node.data.position,
          data: node.data,
        }))
      );
      setEdges(conversation.edges);
    }
  }, [conversation]);

  const fetchConversation = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setConversation(data);
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const updateConversation = useCallback(
    async (updates: Partial<Conversation>) => {
      try {
        const response = await fetch(`/api/conversations/${conversationId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        });

        if (response.ok) {
          const updatedConversation = await response.json();
          setConversation(updatedConversation);
        }
      } catch (error) {
        console.error("Error updating conversation:", error);
      }
    },
    [conversationId]
  );

  const handleUpdateNode = useCallback(
    (nodeId: string, data: Partial<ConversationNodeType["data"]>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...data } }
            : node
        )
      );
    },
    [setNodes]
  );

  const handleCreateChildNode = useCallback(
    (parentId: string, connectionType: "bottom" | "side", context?: string) => {
      const newNodeId = `node-${uuidv4()}`;
      const parentNode = nodes.find((n) => n.id === parentId);

      if (!parentNode) return;

      const newPosition =
        connectionType === "bottom"
          ? { x: parentNode.position.x, y: parentNode.position.y + 200 }
          : { x: parentNode.position.x + 300, y: parentNode.position.y };

      const newNode: FlowNode = {
        id: newNodeId,
        type: "conversation",
        position: newPosition,
        data: {
          position: newPosition,
          isActive: true,
        },
      };

      const newEdge: FlowEdge = {
        id: `edge-${parentId}-${newNodeId}`,
        source: parentId,
        target: newNodeId,
        sourceHandle: connectionType === "bottom" ? "bottom" : "right",
        targetHandle: "top",
      };

      setNodes((nds) => [...nds, newNode]);
      setEdges((eds) => [...eds, newEdge]);

      // Update conversation in backend
      const updatedNodes = [...nodes, newNode].map((node) => ({
        id: node.id,
        type: "conversation",
        data: node.data,
      }));

      const updatedEdges = [...edges, newEdge].map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: edge.type,
      }));

      updateConversation({
        nodes: updatedNodes,
        edges: updatedEdges,
        activeNodeId: newNodeId,
      });
    },
    [nodes, edges, setNodes, setEdges, updateConversation]
  );

  const handleStreamMessage = useCallback(
    async (nodeId: string, message: string, context?: string) => {
      try {
        const response = await fetch(
          `/api/conversations/${conversationId}/stream`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ message, context }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to stream message");
        }

        const reader = response.body?.getReader();
        if (!reader) return;

        let assistantMessage = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === "content" && data.content) {
                  assistantMessage = data.content;
                  handleUpdateNode(nodeId, {
                    assistantMessage,
                    isStreaming: true,
                  });
                } else if (data.type === "done") {
                  handleUpdateNode(nodeId, {
                    isStreaming: false,
                  });

                  // Update conversation in backend
                  const updatedNodes = nodes.map((node) =>
                    node.id === nodeId
                      ? {
                          id: node.id,
                          type: "conversation",
                          data: {
                            ...node.data,
                            assistantMessage,
                            isStreaming: false,
                          },
                        }
                      : node
                  );

                  updateConversation({ nodes: updatedNodes });
                  break;
                }
              } catch (e) {
                console.error("Error parsing SSE data:", e);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error streaming message:", error);
        handleUpdateNode(nodeId, { isStreaming: false });
      }
    },
    [conversationId, nodes, handleUpdateNode, updateConversation]
  );

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // Update active nodes - all nodes from current to source
      const activeNodeIds = new Set<string>();
      const visited = new Set<string>();

      const findActiveNodes = (nodeId: string) => {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);
        activeNodeIds.add(nodeId);

        // Find parent nodes
        const parentEdges = edges.filter((edge) => edge.target === nodeId);
        parentEdges.forEach((edge) => findActiveNodes(edge.source));
      };

      findActiveNodes(node.id);

      // Update node active states
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: {
            ...node.data,
            isActive: activeNodeIds.has(node.id),
          },
        }))
      );

      updateConversation({ activeNodeId: node.id });
    },
    [edges, setNodes, updateConversation]
  );

  const handleTitleSave = useCallback(() => {
    if (title.trim() && title !== conversation?.title) {
      updateConversation({ title: title.trim() });
    }
    setIsEditingTitle(false);
  }, [title, conversation?.title, updateConversation]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSave();
    } else if (e.key === "Escape") {
      setTitle(conversation?.title || "");
      setIsEditingTitle(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-lg">Loading conversation...</div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Conversation not found</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/")}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>

            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleKeyPress}
                className="text-xl font-semibold bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                autoFocus
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="text-xl font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 rounded px-2 py-1"
              >
                {title}
              </h1>
            )}
          </div>

          <div className="text-sm text-gray-500">{nodes.length} nodes</div>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}

// Wrap with ReactFlowProvider
export default function ChatPageWrapper() {
  return (
    <ReactFlowProvider>
      <ChatPage />
    </ReactFlowProvider>
  );
}
