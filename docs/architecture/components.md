# Components

## Frontend Components

**Responsibility:** User interface and graph visualization

**Key Interfaces:**
- React component props and state management
- React Flow node and edge definitions
- Graph state context and reducers

**Dependencies:** React Flow, Tailwind CSS, shared types

**Technology Stack:** React 18+, TypeScript, React Flow, Tailwind CSS

## API Layer

**Responsibility:** Backend API routes and business logic

**Key Interfaces:**
- REST API endpoints for CRUD operations
- OpenAI API integration
- MongoDB data access

**Dependencies:** Next.js API routes, OpenAI SDK, MongoDB driver

**Technology Stack:** Next.js API routes, TypeScript, OpenAI SDK, MongoDB

## Graph State Management

**Responsibility:** Centralized graph state and synchronization

**Key Interfaces:**
- React Context for global state
- useReducer for state updates
- Real-time synchronization with backend

**Dependencies:** React Context, backend sync API

**Technology Stack:** React Context, useReducer, Server-Sent Events

## LLM Integration Service

**Responsibility:** OpenAI API communication and streaming

**Key Interfaces:**
- Streaming response handling
- Context management and flattening
- Error handling and retry logic

**Dependencies:** OpenAI API, conversation context

**Technology Stack:** OpenAI SDK, Server-Sent Events, Node.js streams
