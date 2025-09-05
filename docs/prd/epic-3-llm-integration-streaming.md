# Epic 3: LLM Integration & Streaming

**Goal:** Integrate OpenAI API with streaming support to provide real-time LLM responses within nodes. This epic delivers the core AI functionality that powers the conversation system with proper streaming and context management.

## Story 3.1: OpenAI API Integration

As a developer,
I want to integrate OpenAI API with the Next.js backend,
so that I can send user messages and receive LLM responses.

### Acceptance Criteria

1. OpenAI API is properly configured with environment variables
2. API route is created for handling LLM requests (/api/chat)
3. Request includes proper authentication and error handling
4. API accepts conversation context and user message
5. Response handling includes proper error cases and timeouts
6. API follows Next.js best practices for route handlers
7. Rate limiting and usage monitoring are implemented

## Story 3.2: Context Flattening and Path Traversal

As a developer,
I want to implement path traversal and context flattening,
so that the LLM receives proper conversation context from active nodes.

### Acceptance Criteria

1. Active node path is correctly calculated from clicked node to source
2. Path is flattened into user/assistant message pairs
3. Context includes proper message formatting for OpenAI API
4. Context length is managed to stay within API limits
5. Context preservation maintains conversation flow and meaning
6. Path calculation handles edge cases and complex branching
7. Context flattening is efficient and doesn't impact performance

## Story 3.3: Streaming Response Implementation

As a user,
I want to see LLM responses stream in real-time,
so that I can read the response as it's being generated.

### Acceptance Criteria

1. LLM responses stream in real-time to the frontend
2. Streaming uses Server-Sent Events or similar technology
3. Markdown content is rendered progressively as it streams
4. Loading state is properly managed during streaming
5. Streaming handles connection interruptions gracefully
6. Response quality and formatting are maintained during streaming
7. Streaming performance is smooth without noticeable delays

## Story 3.4: Markdown Rendering and Display

As a user,
I want to see properly formatted markdown content in nodes,
so that I can read LLM responses with proper formatting.

### Acceptance Criteria

1. Markdown content is rendered with proper styling and formatting
2. Code blocks, lists, headers, and other markdown elements display correctly
3. Markdown rendering is performant and doesn't cause layout shifts
4. Long markdown content is properly contained within node boundaries
5. Markdown rendering handles edge cases and malformed content
6. Styling is consistent with overall application design
7. Markdown content is accessible and readable

## Story 3.5: Mock API for Development

As a developer,
I want to have a mock OpenAI API for development and testing,
so that I can develop without external API dependencies.

### Acceptance Criteria

1. Mock API route provides consistent markdown responses
2. Mock responses include various markdown elements for testing
3. Mock API simulates streaming behavior for realistic testing
4. Mock responses are configurable for different test scenarios
5. Development environment automatically uses mock API
6. Mock API maintains same interface as real OpenAI API
7. Mock responses are realistic and useful for development

## Story 3.6: Node Submission to OpenAI API Integration

As a user,
I want my submitted message to trigger an actual OpenAI API call,
so that I receive a real LLM response instead of just a loading state.

### Acceptance Criteria

1. When a user submits a message, the system calls the `/api/chat` endpoint
2. The system passes the active node path as context to the API
3. The API processes the request and returns an LLM response
4. The node transitions from loading to completed state with the response
5. Error handling is implemented for failed API calls
6. The conversation state is properly updated with the response
7. Context flattening is integrated with the API call
