# Frontend Architecture

## Component Architecture

### Component Organization
```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── LoadingSpinner.tsx
│   ├── graph/              # Graph-specific components
│   │   ├── GraphCanvas.tsx
│   │   ├── ConversationNode.tsx
│   │   ├── NodeInput.tsx
│   │   └── MarkdownRenderer.tsx
│   ├── layout/             # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Layout.tsx
│   └── pages/              # Page components
│       ├── HomePage.tsx
│       └── ConversationPage.tsx
├── hooks/                  # Custom React hooks
│   ├── useGraphState.ts
│   ├── useConversation.ts
│   └── useLLMStream.ts
├── context/                # React Context providers
│   ├── GraphContext.tsx
│   └── ConversationContext.tsx
├── services/               # API service layer
│   ├── conversationService.ts
│   ├── chatService.ts
│   └── apiClient.ts
├── types/                  # TypeScript type definitions
│   ├── conversation.ts
│   ├── node.ts
│   └── edge.ts
└── utils/                  # Utility functions
    ├── graphTraversal.ts
    ├── markdownUtils.ts
    └── validation.ts
```

### Component Template
```typescript
import React from 'react';
import { Node } from '@/types/node';

interface ConversationNodeProps {
  node: Node;
  isActive: boolean;
  onNodeClick: (nodeId: string) => void;
  onMessageSubmit: (message: string) => void;
}

export const ConversationNode: React.FC<ConversationNodeProps> = ({
  node,
  isActive,
  onNodeClick,
  onMessageSubmit
}) => {
  return (
    <div 
      className={`node ${isActive ? 'active' : 'inactive'}`}
      onClick={() => onNodeClick(node.id)}
    >
      {/* Node content based on type */}
    </div>
  );
};
```

## State Management Architecture

### State Structure
```typescript
interface GraphState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  activeNodePath: string[];
  isLoading: boolean;
  error: string | null;
}

interface GraphAction {
  type: 'SET_CONVERSATIONS' | 'SET_CURRENT_CONVERSATION' | 'UPDATE_NODE' | 'ADD_EDGE' | 'SET_ACTIVE_PATH';
  payload: any;
}
```

### State Management Patterns
- **Centralized State:** Single source of truth for graph data
- **Immutable Updates:** All state changes through reducers
- **Optimistic Updates:** Immediate UI updates with rollback on failure
- **Debounced Sync:** Batch backend updates to prevent excessive API calls

## Routing Architecture

### Route Organization
```
app/
├── page.tsx                 # Homepage
├── chat/
│   └── [id]/
│       └── page.tsx        # Conversation canvas
├── api/
│   ├── conversations/
│   │   ├── route.ts        # CRUD operations
│   │   └── [id]/
│   │       └── route.ts    # Individual conversation
│   └── chat/
│       └── route.ts        # LLM integration
└── layout.tsx              # Root layout
```

### Protected Route Pattern
```typescript
import { redirect } from 'next/navigation';

export default function ConversationPage({ params }: { params: { id: string } }) {
  // Check if conversation exists and user has access
  const conversation = await getConversation(params.id);
  
  if (!conversation) {
    redirect('/');
  }
  
  return <ConversationCanvas conversation={conversation} />;
}
```

## Frontend Services Layer

### API Client Setup
```typescript
class ApiClient {
  private baseUrl = '/api';
  
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }
}

export const apiClient = new ApiClient();
```

### Service Example
```typescript
export class ConversationService {
  static async getConversations(): Promise<Conversation[]> {
    return apiClient.request<Conversation[]>('/conversations');
  }
  
  static async createConversation(title: string): Promise<Conversation> {
    return apiClient.request<Conversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  }
  
  static async updateConversation(id: string, conversation: Conversation): Promise<Conversation> {
    return apiClient.request<Conversation>(`/conversations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(conversation),
    });
  }
}
```
