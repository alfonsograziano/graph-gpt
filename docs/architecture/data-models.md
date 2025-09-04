# Data Models

## Conversation

**Purpose:** Represents a complete conversation session with all nodes, edges, and metadata

**Key Attributes:**
- id: string - Unique conversation identifier
- title: string - User-defined conversation title
- createdAt: Date - Creation timestamp
- updatedAt: Date - Last modification timestamp
- nodes: Node[] - Array of conversation nodes
- edges: Edge[] - Array of connections between nodes
- metadata: ConversationMetadata - Additional conversation data

**TypeScript Interface:**
```typescript
interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  nodes: Node[];
  edges: Edge[];
  metadata: ConversationMetadata;
}

interface ConversationMetadata {
  nodeCount: number;
  lastActiveNodeId?: string;
  tags?: string[];
}
```

**Relationships:**
- Contains multiple Node entities
- Contains multiple Edge entities
- Owned by User (future consideration)

## Node

**Purpose:** Represents a single conversation node with user message and LLM response

**Key Attributes:**
- id: string - Unique node identifier
- conversationId: string - Parent conversation reference
- type: NodeType - Node state (input, loading, completed)
- userMessage: string - User's input message
- assistantResponse: string - LLM response content
- position: Position - Canvas position coordinates
- createdAt: Date - Creation timestamp
- updatedAt: Date - Last modification timestamp
- parentNodeId?: string - Reference to parent node for branching

**TypeScript Interface:**
```typescript
interface Node {
  id: string;
  conversationId: string;
  type: 'input' | 'loading' | 'completed';
  userMessage: string;
  assistantResponse: string;
  position: Position;
  createdAt: Date;
  updatedAt: Date;
  parentNodeId?: string;
}

interface Position {
  x: number;
  y: number;
}

type NodeType = 'input' | 'loading' | 'completed';
```

**Relationships:**
- Belongs to one Conversation
- Can have multiple child Nodes (via edges)
- Can have one parent Node

## Edge

**Purpose:** Represents connections between conversation nodes

**Key Attributes:**
- id: string - Unique edge identifier
- conversationId: string - Parent conversation reference
- sourceNodeId: string - Source node identifier
- targetNodeId: string - Target node identifier
- type: EdgeType - Connection type (auto, manual, markdown)
- createdAt: Date - Creation timestamp
- metadata?: EdgeMetadata - Additional edge information

**TypeScript Interface:**
```typescript
interface Edge {
  id: string;
  conversationId: string;
  sourceNodeId: string;
  targetNodeId: string;
  type: 'auto' | 'manual' | 'markdown';
  createdAt: Date;
  metadata?: EdgeMetadata;
}

interface EdgeMetadata {
  markdownElementId?: string;
  contextSnippet?: string;
}

type EdgeType = 'auto' | 'manual' | 'markdown';
```

**Relationships:**
- Belongs to one Conversation
- Connects two Node entities
- Can reference specific markdown elements
