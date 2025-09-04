# Graph-GPT Fullstack Architecture Document

## Introduction

This document outlines the complete fullstack architecture for Graph-GPT, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

This unified approach combines what would traditionally be separate backend and frontend architecture documents, streamlining the development process for modern fullstack applications where these concerns are increasingly intertwined.

### Starter Template or Existing Project

**Decision:** N/A - Greenfield project  
**Approach:** Standard Next.js 15+ with TypeScript, MongoDB integration, and React Flow for graph visualization

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-01-15 | 1.0 | Initial architecture document creation | Winston (Architect) |

## High Level Architecture

### Technical Summary

Graph-GPT implements a modern fullstack architecture using Next.js 15+ with App Router for seamless frontend-backend integration. The system leverages MongoDB for flexible graph data storage, React Flow for interactive graph visualization, and OpenAI API integration for streaming LLM responses. The architecture follows a monorepo structure with shared TypeScript types, enabling rapid development of the graph-based conversation interface. Deployment utilizes Vercel's serverless platform for optimal performance and scalability, with real-time state synchronization ensuring consistent graph state across sessions.

### Platform and Infrastructure Choice

**Platform:** Vercel  
**Key Services:** Vercel Functions, Vercel Edge Network, MongoDB Atlas, OpenAI API  
**Deployment Host and Regions:** Global Edge Network (Primary: US East, EU West, Asia Pacific)

**Rationale:** Vercel provides seamless Next.js integration, automatic scaling, and global edge deployment. MongoDB Atlas offers managed database services with excellent Next.js compatibility. This combination enables rapid development and deployment while maintaining high performance for the graph-based interface.

### Repository Structure

**Structure:** Monorepo with npm workspaces  
**Monorepo Tool:** npm workspaces (built-in)  
**Package Organization:** Apps (web) + Packages (shared, ui, config)

### High Level Architecture Diagram

```mermaid
graph TB
    User[User Browser] --> CDN[Vercel Edge CDN]
    CDN --> NextApp[Next.js App Router]
    
    NextApp --> API[API Routes]
    API --> OpenAI[OpenAI API]
    API --> MongoDB[(MongoDB Atlas)]
    
    NextApp --> ReactFlow[React Flow Canvas]
    ReactFlow --> GraphState[Graph State Management]
    
    subgraph "Frontend Components"
        HomePage[Homepage]
        Canvas[Conversation Canvas]
        NodeComp[Node Components]
        GraphViz[Graph Visualization]
    end
    
    subgraph "Backend Services"
        ConvAPI[Conversation API]
        ChatAPI[Chat/LLM API]
        SyncAPI[State Sync API]
    end
    
    subgraph "External Services"
        OpenAI[OpenAI API]
        MongoDB[(MongoDB Atlas)]
    end
    
    NextApp --> HomePage
    NextApp --> Canvas
    Canvas --> NodeComp
    Canvas --> GraphViz
    
    API --> ConvAPI
    API --> ChatAPI
    API --> SyncAPI
```

### Architectural Patterns

- **Jamstack Architecture:** Static site generation with serverless APIs - _Rationale:_ Optimal performance and scalability for the graph interface
- **Component-Based UI:** Reusable React components with TypeScript - _Rationale:_ Maintainability and type safety across the graph visualization system
- **Repository Pattern:** Abstract data access logic - _Rationale:_ Enables testing and future database migration flexibility
- **State Management Pattern:** React Context with useReducer - _Rationale:_ Centralized graph state management with predictable updates
- **Streaming Pattern:** Server-Sent Events for real-time LLM responses - _Rationale:_ Efficient real-time communication without WebSocket complexity
- **Graph Traversal Pattern:** Custom algorithms for path calculation - _Rationale:_ Optimized for conversation context and node activation logic

## Tech Stack

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.3+ | Type-safe development | Ensures consistency between frontend and backend |
| Frontend Framework | Next.js | 15+| Full-stack React framework | Built-in API routes, App Router, and optimization |
| UI Component Library | React Flow | 11+ | Graph visualization | Specialized for node-based interfaces |
| State Management | React Context + useReducer | Built-in | Graph state management | Predictable state updates for complex graph operations |
| Backend Language | TypeScript | 5.3+ | Unified language | Shared types and consistent development experience |
| Backend Framework | Next.js API Routes | 15+| Serverless functions | Seamless integration with frontend |
| API Style | REST | - | Simple integration | Straightforward for LLM and database operations |
| Database | MongoDB | 7+ | Document storage | Flexible schema for graph nodes and edges |
| Cache | Vercel Edge Cache | Built-in | Performance optimization | Automatic caching for static assets |
| File Storage | Vercel Blob | - | Asset storage | Integrated file storage solution |
| Authentication | NextAuth.js | 4+ | User authentication | Secure authentication with multiple providers |
| Frontend Testing | Jest + React Testing Library | Latest | Component testing | Comprehensive frontend testing |
| Backend Testing | Jest + Supertest | Latest | API testing | Backend API and integration testing |
| E2E Testing | Playwright | Latest | End-to-end testing | Cross-browser testing for graph interactions |
| Build Tool | Next.js | 15+| Built-in build system | Optimized for React applications |
| Bundler | Turbopack | Built-in | Fast bundling | Next.js 15+ default bundler |
| IaC Tool | Vercel CLI | Latest | Infrastructure as code | Platform-specific deployment |
| CI/CD | GitHub Actions | - | Automated deployment | Integrated with Vercel for seamless deployment |
| Monitoring | Vercel Analytics | Built-in | Performance monitoring | Built-in analytics and monitoring |
| Logging | Vercel Functions Logs | Built-in | Application logging | Integrated logging solution |
| CSS Framework | Tailwind CSS | 3+ | Utility-first styling | Rapid UI development with consistent design |

## Data Models

### Conversation

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

### Node

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

### Edge

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

## API Specification

### REST API Specification

```yaml
openapi: 3.0.0
info:
  title: Graph-GPT API
  version: 1.0.0
  description: API for graph-based LLM conversation interface
servers:
  - url: /api
    description: Next.js API routes
paths:
  /conversations:
    get:
      summary: Get all conversations
      responses:
        '200':
          description: List of conversations
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Conversation'
    post:
      summary: Create new conversation
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                title:
                  type: string
      responses:
        '201':
          description: Conversation created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Conversation'
  /conversations/{id}:
    get:
      summary: Get conversation by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Conversation details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Conversation'
    put:
      summary: Update conversation
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Conversation'
      responses:
        '200':
          description: Conversation updated
    delete:
      summary: Delete conversation
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '204':
          description: Conversation deleted
  /chat:
    post:
      summary: Send message to LLM
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
                context:
                  type: array
                  items:
                    type: object
                    properties:
                      role:
                        type: string
                        enum: [user, assistant]
                      content:
                        type: string
                nodeId:
                  type: string
      responses:
        '200':
          description: Streaming LLM response
          content:
            text/event-stream:
              schema:
                type: string
components:
  schemas:
    Conversation:
      type: object
      properties:
        id:
          type: string
        title:
          type: string
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
        nodes:
          type: array
          items:
            $ref: '#/components/schemas/Node'
        edges:
          type: array
          items:
            $ref: '#/components/schemas/Edge'
    Node:
      type: object
      properties:
        id:
          type: string
        conversationId:
          type: string
        type:
          type: string
          enum: [input, loading, completed]
        userMessage:
          type: string
        assistantResponse:
          type: string
        position:
          $ref: '#/components/schemas/Position'
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
    Edge:
      type: object
      properties:
        id:
          type: string
        conversationId:
          type: string
        sourceNodeId:
          type: string
        targetNodeId:
          type: string
        type:
          type: string
          enum: [auto, manual, markdown]
    Position:
      type: object
      properties:
        x:
          type: number
        y:
          type: number
```

## Components

### Frontend Components

**Responsibility:** User interface and graph visualization

**Key Interfaces:**
- React component props and state management
- React Flow node and edge definitions
- Graph state context and reducers

**Dependencies:** React Flow, Tailwind CSS, shared types

**Technology Stack:** React 18+, TypeScript, React Flow, Tailwind CSS

### API Layer

**Responsibility:** Backend API routes and business logic

**Key Interfaces:**
- REST API endpoints for CRUD operations
- OpenAI API integration
- MongoDB data access

**Dependencies:** Next.js API routes, OpenAI SDK, MongoDB driver

**Technology Stack:** Next.js API routes, TypeScript, OpenAI SDK, MongoDB

### Graph State Management

**Responsibility:** Centralized graph state and synchronization

**Key Interfaces:**
- React Context for global state
- useReducer for state updates
- Real-time synchronization with backend

**Dependencies:** React Context, backend sync API

**Technology Stack:** React Context, useReducer, Server-Sent Events

### LLM Integration Service

**Responsibility:** OpenAI API communication and streaming

**Key Interfaces:**
- Streaming response handling
- Context management and flattening
- Error handling and retry logic

**Dependencies:** OpenAI API, conversation context

**Technology Stack:** OpenAI SDK, Server-Sent Events, Node.js streams

## External APIs

### OpenAI API

- **Purpose:** LLM response generation and streaming
- **Documentation:** https://platform.openai.com/docs/api-reference
- **Base URL(s):** https://api.openai.com/v1
- **Authentication:** Bearer token (API key)
- **Rate Limits:** Based on usage tier and model

**Key Endpoints Used:**
- `POST /chat/completions` - Generate streaming LLM responses

**Integration Notes:** Implement streaming responses, context management, and error handling for API failures

## Core Workflows

### Conversation Creation and Node Interaction

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant O as OpenAI
    participant D as MongoDB
    
    U->>F: Create new conversation
    F->>A: POST /conversations
    A->>D: Save conversation
    D-->>A: Conversation created
    A-->>F: Return conversation
    F->>F: Initialize default node
    
    U->>F: Submit message
    F->>F: Update node to loading state
    F->>A: POST /chat (with context)
    A->>A: Flatten active node path
    A->>O: Stream LLM response
    O-->>A: Streaming response
    A-->>F: Server-Sent Events
    F->>F: Update node with response
    F->>A: PUT /conversations/{id}
    A->>D: Update conversation state
```

### Graph State Synchronization

```mermaid
sequenceDiagram
    participant F as Frontend
    participant A as API
    participant D as MongoDB
    
    F->>F: User modifies graph (drag, create edge)
    F->>F: Debounce changes (1000ms)
    F->>A: PUT /conversations/{id}
    A->>D: Update conversation
    D-->>A: Success
    A-->>F: Updated conversation
    
    Note over F,D: Real-time sync for collaborative features
```

## Database Schema

### MongoDB Collections

```javascript
// conversations collection
{
  _id: ObjectId,
  id: String, // UUID for frontend reference
  title: String,
  createdAt: Date,
  updatedAt: Date,
  nodes: [
    {
      id: String,
      type: String, // 'input' | 'loading' | 'completed'
      userMessage: String,
      assistantResponse: String,
      position: {
        x: Number,
        y: Number
      },
      createdAt: Date,
      updatedAt: Date,
      parentNodeId: String // optional
    }
  ],
  edges: [
    {
      id: String,
      sourceNodeId: String,
      targetNodeId: String,
      type: String, // 'auto' | 'manual' | 'markdown'
      createdAt: Date,
      metadata: {
        markdownElementId: String, // optional
        contextSnippet: String // optional
      }
    }
  ],
  metadata: {
    nodeCount: Number,
    lastActiveNodeId: String, // optional
    tags: [String] // optional
  }
}

// Indexes
db.conversations.createIndex({ "id": 1 }, { unique: true })
db.conversations.createIndex({ "createdAt": -1 })
db.conversations.createIndex({ "updatedAt": -1 })
db.conversations.createIndex({ "nodes.id": 1 })
db.conversations.createIndex({ "edges.sourceNodeId": 1 })
db.conversations.createIndex({ "edges.targetNodeId": 1 })
```

## Frontend Architecture

### Component Architecture

#### Component Organization
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

#### Component Template
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

### State Management Architecture

#### State Structure
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

#### State Management Patterns
- **Centralized State:** Single source of truth for graph data
- **Immutable Updates:** All state changes through reducers
- **Optimistic Updates:** Immediate UI updates with rollback on failure
- **Debounced Sync:** Batch backend updates to prevent excessive API calls

### Routing Architecture

#### Route Organization
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

#### Protected Route Pattern
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

### Frontend Services Layer

#### API Client Setup
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

#### Service Example
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

## Backend Architecture

### Service Architecture

#### Function Organization
```
src/app/api/
├── conversations/
│   ├── route.ts            # GET, POST /conversations
│   └── [id]/
│       └── route.ts        # GET, PUT, DELETE /conversations/[id]
├── chat/
│   └── route.ts            # POST /chat (LLM integration)
├── sync/
│   └── route.ts            # Real-time state synchronization
└── health/
    └── route.ts            # Health check endpoint
```

#### Function Template
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { ConversationService } from '@/services/conversationService';

export async function GET(request: NextRequest) {
  try {
    const conversations = await ConversationService.getAll();
    return NextResponse.json(conversations);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const conversation = await ConversationService.create(body);
    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
```

### Database Architecture

#### Schema Design
```typescript
// MongoDB Schema with Mongoose
import mongoose from 'mongoose';

const PositionSchema = new mongoose.Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true }
});

const NodeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, enum: ['input', 'loading', 'completed'], required: true },
  userMessage: { type: String, required: true },
  assistantResponse: { type: String, default: '' },
  position: { type: PositionSchema, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  parentNodeId: { type: String, required: false }
});

const EdgeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  sourceNodeId: { type: String, required: true },
  targetNodeId: { type: String, required: true },
  type: { type: String, enum: ['auto', 'manual', 'markdown'], required: true },
  createdAt: { type: Date, default: Date.now },
  metadata: {
    markdownElementId: { type: String, required: false },
    contextSnippet: { type: String, required: false }
  }
});

const ConversationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  nodes: [NodeSchema],
  edges: [EdgeSchema],
  metadata: {
    nodeCount: { type: Number, default: 0 },
    lastActiveNodeId: { type: String, required: false },
    tags: [{ type: String }]
  }
});

export const Conversation = mongoose.model('Conversation', ConversationSchema);
```

#### Data Access Layer
```typescript
export class ConversationRepository {
  static async create(data: Partial<Conversation>): Promise<Conversation> {
    const conversation = new Conversation(data);
    return await conversation.save();
  }
  
  static async findById(id: string): Promise<Conversation | null> {
    return await Conversation.findOne({ id });
  }
  
  static async findAll(): Promise<Conversation[]> {
    return await Conversation.find().sort({ updatedAt: -1 });
  }
  
  static async update(id: string, data: Partial<Conversation>): Promise<Conversation | null> {
    return await Conversation.findOneAndUpdate(
      { id },
      { ...data, updatedAt: new Date() },
      { new: true }
    );
  }
  
  static async delete(id: string): Promise<boolean> {
    const result = await Conversation.deleteOne({ id });
    return result.deletedCount > 0;
  }
}
```

### Authentication and Authorization

#### Auth Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant N as NextAuth
    
    U->>F: Access protected route
    F->>N: Check authentication
    N-->>F: User session
    F->>A: API request with session
    A->>N: Validate session
    N-->>A: User data
    A->>A: Process request
    A-->>F: Response
```

#### Middleware/Guards
```typescript
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Additional middleware logic
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
);

export const config = {
  matcher: ['/chat/:path*', '/api/conversations/:path*']
};
```

## Unified Project Structure

```
graph-gpt/
├── .github/                    # CI/CD workflows
│   └── workflows/
│       ├── ci.yaml
│       └── deploy.yaml
├── src/                        # Next.js application
│   ├── app/                    # App Router
│   │   ├── api/                # API routes
│   │   │   ├── conversations/
│   │   │   ├── chat/
│   │   │   └── sync/
│   │   ├── chat/[id]/          # Conversation pages
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/             # React components
│   │   ├── ui/                 # Reusable UI components
│   │   ├── graph/              # Graph-specific components
│   │   ├── layout/             # Layout components
│   │   └── pages/              # Page components
│   ├── hooks/                  # Custom React hooks
│   ├── context/                # React Context providers
│   ├── services/               # API service layer
│   ├── types/                  # TypeScript type definitions
│   ├── utils/                  # Utility functions
│   └── lib/                    # Configuration and utilities
├── public/                     # Static assets
├── tests/                      # Test files
│   ├── components/             # Component tests
│   ├── api/                    # API tests
│   └── e2e/                    # End-to-end tests
├── docs/                       # Documentation
│   ├── prd.md
│   └── architecture.md
├── .env.example                # Environment template
├── .env.local                  # Local environment variables
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
└── README.md
```

## Development Workflow

### Local Development Setup

#### Prerequisites
```bash
# Required software
node --version  # v18.17.0 or later
npm --version   # v9.0.0 or later
mongodb --version  # v7.0 or later (or use MongoDB Atlas)
```

#### Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd graph-gpt

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Set up MongoDB (if using local instance)
# Or configure MongoDB Atlas connection string

# Start development server
npm run dev
```

#### Development Commands
```bash
# Start all services
npm run dev

# Start frontend only (if separated)
npm run dev:frontend

# Start backend only (if separated)
npm run dev:backend

# Run tests
npm test                    # Unit tests
npm run test:watch         # Watch mode
npm run test:e2e           # End-to-end tests
npm run test:coverage      # Coverage report

# Build for production
npm run build

# Start production server
npm start

# Lint and format
npm run lint
npm run format
```

### Environment Configuration

#### Required Environment Variables
```bash
# Frontend (.env.local)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Backend (.env.local)
MONGODB_URI=mongodb://localhost:27017/graph-gpt
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/graph-gpt

OPENAI_API_KEY=sk-your-openai-api-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Shared
NODE_ENV=development
```

## Deployment Architecture

### Deployment Strategy

**Frontend Deployment:**
- **Platform:** Vercel
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **CDN/Edge:** Vercel Edge Network

**Backend Deployment:**
- **Platform:** Vercel Functions
- **Build Command:** `npm run build`
- **Deployment Method:** Git-based automatic deployment

### CI/CD Pipeline

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Environments

| Environment | Frontend URL | Backend URL | Purpose |
|-------------|--------------|-------------|---------|
| Development | http://localhost:3000 | http://localhost:3000/api | Local development |
| Staging | https://graph-gpt-staging.vercel.app | https://graph-gpt-staging.vercel.app/api | Pre-production testing |
| Production | https://graph-gpt.vercel.app | https://graph-gpt.vercel.app/api | Live environment |

## Security and Performance

### Security Requirements

**Frontend Security:**
- CSP Headers: Strict Content Security Policy with nonce-based scripts
- XSS Prevention: React's built-in XSS protection with proper sanitization
- Secure Storage: No sensitive data in localStorage, use httpOnly cookies

**Backend Security:**
- Input Validation: Zod schema validation for all API inputs
- Rate Limiting: 100 requests per minute per IP
- CORS Policy: Restrict to production domains only

**Authentication Security:**
- Token Storage: httpOnly cookies with secure flags
- Session Management: JWT tokens with short expiration
- Password Policy: Minimum 8 characters with complexity requirements

### Performance Optimization

**Frontend Performance:**
- Bundle Size Target: < 500KB initial bundle
- Loading Strategy: Code splitting with dynamic imports
- Caching Strategy: Service worker with cache-first strategy

**Backend Performance:**
- Response Time Target: < 200ms for API responses
- Database Optimization: Proper indexing and query optimization
- Caching Strategy: Redis for frequently accessed data

## Testing Strategy

### Testing Pyramid

```
        E2E Tests
       /        \
   Integration Tests
   /            \
Frontend Unit  Backend Unit
```

### Test Organization

#### Frontend Tests
```
tests/
├── components/
│   ├── ConversationNode.test.tsx
│   ├── GraphCanvas.test.tsx
│   └── HomePage.test.tsx
├── hooks/
│   ├── useGraphState.test.ts
│   └── useConversation.test.ts
└── utils/
    ├── graphTraversal.test.ts
    └── markdownUtils.test.ts
```

#### Backend Tests
```
tests/
├── api/
│   ├── conversations.test.ts
│   ├── chat.test.ts
│   └── sync.test.ts
├── services/
│   ├── conversationService.test.ts
│   └── chatService.test.ts
└── utils/
    ├── validation.test.ts
    └── database.test.ts
```

#### E2E Tests
```
tests/e2e/
├── conversation-flow.spec.ts
├── graph-interactions.spec.ts
└── llm-integration.spec.ts
```

### Test Examples

#### Frontend Component Test
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ConversationNode } from '@/components/graph/ConversationNode';

describe('ConversationNode', () => {
  const mockNode = {
    id: '1',
    type: 'input' as const,
    userMessage: 'Test message',
    assistantResponse: '',
    position: { x: 0, y: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  it('renders input state correctly', () => {
    render(
      <ConversationNode
        node={mockNode}
        isActive={false}
        onNodeClick={jest.fn()}
        onMessageSubmit={jest.fn()}
      />
    );
    
    expect(screen.getByPlaceholderText('What do you have in mind?')).toBeInTheDocument();
  });
});
```

#### Backend API Test
```typescript
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/conversations/route';

describe('/api/conversations', () => {
  it('should create a new conversation', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { title: 'Test Conversation' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toHaveProperty('id');
  });
});
```

#### E2E Test
```typescript
import { test, expect } from '@playwright/test';

test('should create and interact with conversation nodes', async ({ page }) => {
  await page.goto('/');
  
  // Create new conversation
  await page.click('text=New Conversation');
  await expect(page).toHaveURL(/\/chat\/[a-f0-9-]+/);
  
  // Submit first message
  await page.fill('[placeholder="What do you have in mind?"]', 'Hello world');
  await page.click('button[type="submit"]');
  
  // Wait for response
  await expect(page.locator('.node.completed')).toBeVisible();
  
  // Create branch
  await page.click('.node .add-branch-button');
  await expect(page.locator('.node.input')).toHaveCount(2);
});
```

## Coding Standards

### Critical Fullstack Rules

- **Type Sharing:** Always define types in `src/types/` and import from there
- **API Calls:** Never make direct HTTP calls - use the service layer in `src/services/`
- **Environment Variables:** Access only through config objects, never `process.env` directly
- **Error Handling:** All API routes must use the standard error handler
- **State Updates:** Never mutate state directly - use proper state management patterns
- **Graph Operations:** All graph modifications must go through the GraphContext
- **LLM Integration:** Always use the chat service for OpenAI API calls
- **Database Access:** Use repository pattern, never direct MongoDB calls in components

### Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `ConversationNode.tsx` |
| Hooks | camelCase with 'use' | - | `useGraphState.ts` |
| API Routes | - | kebab-case | `/api/conversations` |
| Database Collections | - | snake_case | `conversations` |
| Types/Interfaces | PascalCase | PascalCase | `Conversation` |
| Functions | camelCase | camelCase | `createConversation` |
| Constants | UPPER_SNAKE_CASE | UPPER_SNAKE_CASE | `MAX_NODES` |

## Error Handling Strategy

### Error Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant E as External Service
    
    U->>F: User action
    F->>A: API request
    A->>E: External API call
    E-->>A: Error response
    A->>A: Log error
    A-->>F: Standardized error response
    F->>F: Show user-friendly message
    F->>F: Log error details
```

### Error Response Format

```typescript
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
  };
}

// Example error responses
{
  "error": {
    "code": "CONVERSATION_NOT_FOUND",
    "message": "The requested conversation could not be found",
    "timestamp": "2025-01-15T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

### Frontend Error Handling

```typescript
export class ErrorHandler {
  static handleApiError(error: ApiError): string {
    const errorMessages = {
      'CONVERSATION_NOT_FOUND': 'Conversation not found. Please try again.',
      'INVALID_INPUT': 'Please check your input and try again.',
      'NETWORK_ERROR': 'Network error. Please check your connection.',
      'DEFAULT': 'Something went wrong. Please try again.'
    };
    
    return errorMessages[error.error.code] || errorMessages.DEFAULT;
  }
  
  static logError(error: Error, context: string): void {
    console.error(`[${context}]`, error);
    // Send to error tracking service
  }
}
```

### Backend Error Handling

```typescript
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID()
        }
      },
      { status: error.statusCode }
    );
  }
  
  // Log unexpected errors
  console.error('Unexpected error:', error);
  
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID()
      }
    },
    { status: 500 }
  );
}
```

## Monitoring and Observability

### Monitoring Stack

- **Frontend Monitoring:** Vercel Analytics + Custom error tracking
- **Backend Monitoring:** Vercel Functions logs + Custom metrics
- **Error Tracking:** Sentry integration for error aggregation
- **Performance Monitoring:** Web Vitals + API response time tracking

### Key Metrics

**Frontend Metrics:**
- Core Web Vitals (LCP, FID, CLS)
- JavaScript errors and exceptions
- API response times and success rates
- User interactions and graph operations

**Backend Metrics:**
- Request rate and response times
- Error rate by endpoint
- Database query performance
- LLM API usage and costs

---

This architecture document provides a comprehensive foundation for building the Graph-GPT application. It balances technical excellence with practical implementation considerations, ensuring the system can scale while maintaining developer productivity and user experience quality.
