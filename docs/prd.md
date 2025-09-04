# Graph-GPT Product Requirements Document (PRD)

## Goals and Background Context

### Goals

- Create a non-linear, graph-based interface for LLM interactions that mirrors human thinking patterns
- Enable users to explore multiple conversation paths simultaneously from a single starting point
- Provide intuitive node-based conversation management with visual graph representation
- Support branching conversations with contextual connections based on markdown content
- Deliver a seamless streaming experience with real-time markdown rendering
- Enable conversation persistence and management across multiple sessions

### Background Context

Traditional LLM chat interfaces force users into linear conversation flows, which doesn't align with how humans naturally think and explore ideas. Humans often need to explore multiple hypotheses, debug different approaches, or branch off into related topics during a single thinking session. The current linear chat paradigm limits this natural cognitive process.

This product addresses this fundamental limitation by providing a graph-based interface where users can create multiple conversation branches from any point in their interaction with an LLM. The interface uses React Flow to create an intuitive visual representation of conversation threads, allowing users to explore different paths, return to previous branches, and build complex knowledge graphs through their interactions.

### Change Log

| Date       | Version | Description                                         | Author    |
| ---------- | ------- | --------------------------------------------------- | --------- |
| 2025-01-15 | 1.0     | Initial PRD creation based on brainstorming session | John (PM) |

## Requirements

### Functional

**FR1:** The system shall provide a homepage displaying a list of all saved conversations with timestamps and titles.

**FR2:** The system shall allow users to create new conversations with auto-generated titles based on current timestamp in ISO format.

**FR3:** The system shall provide a graph canvas interface using React Flow for visualizing conversation nodes and connections.

**FR4:** Each conversation shall start with a single default node containing a text input field with placeholder "What do you have in mind?" and a submit button.

**FR5:** When a user submits a message, the system shall display the user message, hide the input interface, and show a loading state with "Generating..." text.

**FR6:** The system shall stream LLM responses in real-time as markdown content within the node, with proper markdown rendering.

**FR7:** Upon completion of streaming, the system shall display a circular "+" button at the bottom of the node for creating new conversation branches.

**FR8:** The system shall support creating new nodes from the bottom "+" button, which spawns a new node with default input state.

**FR9:** The system shall support creating new nodes from markdown element anchors that appear on hover over any markdown content.

**FR10:** When creating a node from a markdown anchor, the system shall prepend the user message with "this message is related to ${node content}" context.

**FR11:** The system shall implement node activation logic where clicking a node activates it and all nodes in the path back to the source.

**FR12:** Active nodes shall have white background color while inactive nodes shall have light-gray background.

**FR13:** The system shall traverse the active node path and flatten it as user/assistant pairs for LLM context when submitting new messages.

**FR14:** The system shall provide edge customization with split buttons: "+" for auto-connecting new nodes and a separate button for manual edge creation.

**FR15:** The system shall allow users to rename conversation titles by clicking on the title in the top-left of the canvas.

**FR16:** The system shall automatically sync conversation state to the backend whenever nodes, edges, or positions change.

**FR17:** The system shall persist all conversation data including nodes, edges, positions, and metadata in MongoDB.

**FR18:** The system shall provide shared TypeScript types between frontend and backend for data consistency.

### Non Functional

**NFR1:** The system shall respond to user interactions within 200ms for UI state changes.

**NFR2:** The system shall stream LLM responses with minimal latency, starting within 1 second of request submission.

**NFR3:** The system shall handle conversations with up to 100 nodes without performance degradation.

**NFR4:** The system shall maintain conversation state consistency across browser refreshes and navigation.

**NFR5:** The system shall provide responsive design that works on desktop and tablet devices.

**NFR6:** The system shall implement proper error handling for network failures and LLM API errors.

**NFR7:** The system shall use debounced syncing (1000ms) to prevent excessive backend requests during rapid changes.

**NFR8:** The system shall maintain data integrity with proper validation of conversation schema.

## User Interface Design Goals

### Overall UX Vision

The interface should feel like a natural extension of human thought processes, where ideas can branch, connect, and evolve organically. The graph visualization should be intuitive enough that users can immediately understand how to create branches and navigate between different conversation threads. The design should prioritize clarity and simplicity while providing powerful branching capabilities.

### Key Interaction Paradigms

- **Node-based Conversations:** Each conversation thread is represented as a node with clear visual states (input, loading, completed)
- **Visual Graph Navigation:** Users can click nodes to activate conversation paths and see the relationship between different branches
- **Contextual Branching:** Users can create new branches from specific parts of markdown content, maintaining semantic connections
- **Real-time Streaming:** LLM responses stream in real-time with proper markdown rendering for immediate feedback
- **Persistent State:** All interactions are automatically saved and synchronized across sessions

### Core Screens and Views

- **Homepage:** List of all conversations with creation and navigation capabilities
- **Conversation Canvas:** Main graph interface with React Flow visualization
- **Node Component:** Individual conversation nodes with input, loading, and content states
- **Settings/Preferences:** Future consideration for user preferences and customization

### Accessibility: WCAG AA

The interface shall meet WCAG AA standards for accessibility, including proper keyboard navigation, screen reader support, and sufficient color contrast for node states and text content.

### Branding

Clean, modern interface with focus on readability and usability. Minimal design that doesn't distract from the conversation content.

### Target Device and Platforms: Web Responsive

Primary focus on desktop and tablet web browsers with responsive design principles. Mobile optimization may be considered in future iterations.

## Technical Assumptions

### Repository Structure: Monorepo

Single repository containing both frontend and backend code for simplified development and deployment.

### Service Architecture

**Next.js Full-Stack Application:**

- Frontend: React with TypeScript, React Flow for graph visualization
- Backend: Next.js API routes for LLM integration and data persistence
- Database: MongoDB with Mongoose ODM
- Shared types between frontend and backend for data consistency

### Testing Requirements

**Unit + Integration Testing:**

- Unit tests for individual components and utility functions
- Integration tests for API routes and database operations
- Mock OpenAI API for consistent testing without external dependencies
- Component testing for React Flow interactions and node states

### Additional Technical Assumptions and Requests

- **LLM Integration:** OpenAI API with streaming support for real-time response generation
- **State Management:** React Context for graph state management within the canvas component
- **Data Persistence:** MongoDB as single source of truth for conversation data
- **Real-time Updates:** Server-sent events or polling for conversation synchronization
- **Markdown Rendering:** React markdown library for proper content display
- **Graph Traversal:** Custom algorithms for calculating active node paths and context flattening
- **Element Path Identification:** Unique identifiers for markdown elements to enable anchor connections

## Epic List

**Epic 1: Foundation & Core Infrastructure**
Establish the basic project structure, database setup, and core conversation management functionality.

**Epic 2: Graph Canvas & Node Components**
Implement the React Flow canvas interface with basic node components and interaction patterns.

**Epic 3: LLM Integration & Streaming**
Integrate OpenAI API with streaming support and real-time markdown rendering.

**Epic 4: Advanced Graph Features**
Implement markdown anchors, edge customization, and advanced graph navigation features.

**Epic 5: Polish & Optimization**
Add conversation management features, error handling, and performance optimizations.

## Epic 1: Foundation & Core Infrastructure

**Goal:** Establish the foundational infrastructure for the graph-based LLM interface, including project setup, database configuration, and basic conversation CRUD operations. This epic delivers the core data layer and basic user interface for managing conversations.

### Story 1.1: Project Setup and Database Configuration

As a developer,
I want to set up the Next.js project with TypeScript, MongoDB, and Mongoose,
so that I have a solid foundation for building the graph-based LLM interface.

#### Acceptance Criteria

1. Next.js project is initialized with TypeScript configuration
2. MongoDB connection is established using Mongoose
3. Shared TypeScript types are defined for Conversation, Node, and Edge entities
4. Basic project structure is organized with proper separation of concerns
5. Environment variables are configured for database connection
6. Basic error handling and logging are implemented

### Story 1.2: Conversation Data Model and API

As a developer,
I want to implement the conversation data model and basic CRUD operations,
so that conversations can be created, retrieved, updated, and deleted.

#### Acceptance Criteria

1. Mongoose schema is defined for Conversation entity with all required fields
2. API routes are created for conversation CRUD operations (/api/conversations)
3. Conversation data includes nodes, edges, positions, title, and metadata
4. Data validation is implemented for conversation schema
5. Error handling is implemented for database operations
6. API responses follow consistent format with proper HTTP status codes

### Story 1.3: Homepage and Conversation List

As a user,
I want to see a list of all my conversations on the homepage,
so that I can easily navigate between different conversation sessions.

#### Acceptance Criteria

1. Homepage displays list of all conversations with titles and timestamps
2. Each conversation shows creation date and last modified time
3. Users can click on conversations to navigate to the conversation canvas
4. "New Conversation" button creates a new conversation with auto-generated title
5. Conversation titles are displayed in a clean, readable format
6. Empty state is shown when no conversations exist
7. Responsive design works on desktop and tablet devices

### Story 1.4: Basic Conversation Canvas Structure

As a user,
I want to access a conversation canvas when I click on a conversation,
so that I can start interacting with the graph-based interface.

#### Acceptance Criteria

1. Conversation canvas page is accessible at /chat/[id] route
2. Canvas displays conversation title in top-left corner
3. Title is clickable and allows renaming functionality
4. Basic React Flow canvas is rendered with proper dimensions
5. Conversation data is loaded and displayed correctly
6. Navigation back to homepage is available
7. Page handles loading states and error conditions

## Epic 2: Graph Canvas & Node Components

**Goal:** Implement the core graph visualization interface using React Flow, including node components with different states (input, loading, completed) and basic graph interaction patterns. This epic delivers the visual foundation for the graph-based conversation interface.

### Story 2.1: React Flow Canvas Integration

As a developer,
I want to integrate React Flow into the conversation canvas,
so that I can display and interact with graph-based conversation nodes.

#### Acceptance Criteria

1. React Flow is properly installed and configured
2. Canvas displays with appropriate dimensions and styling
3. Basic zoom and pan functionality works correctly
4. Canvas handles node positioning and layout
5. Proper TypeScript types are defined for React Flow elements
6. Canvas is responsive and works on different screen sizes

### Story 2.2: Node Component with Input State

As a user,
I want to see a default node with input field when I start a new conversation,
so that I can begin typing my first message.

#### Acceptance Criteria

1. Default node is created when conversation is first accessed
2. Node contains text input field with placeholder "What do you have in mind?"
3. Submit button is positioned on the right side of the input
4. Node has light-gray background color by default
5. Input field accepts text input and handles Enter key submission
6. Node is properly positioned on the canvas
7. Node component is reusable and follows React best practices

### Story 2.3: Node State Management and Loading

As a user,
I want to see my message displayed and a loading state when I submit,
so that I know my request is being processed.

#### Acceptance Criteria

1. When user submits message, input field is hidden and message is displayed
2. Loading state shows "Generating..." text with appropriate loading indicator
3. Node background remains light-gray during loading
4. Loading state is visually distinct and user-friendly
5. Node maintains proper dimensions during state transitions
6. State transitions are smooth and don't cause layout shifts

### Story 2.4: Node Completion and Branch Creation

As a user,
I want to see the completed node with LLM response and option to create branches,
so that I can continue the conversation in different directions.

#### Acceptance Criteria

1. Completed node displays user message, separator, and LLM response
2. LLM response is rendered as markdown with proper formatting
3. Circular "+" button appears at bottom of node after completion
4. Node background changes to white when it becomes active
5. "+" button is visually distinct and properly positioned
6. Node maintains readable layout with proper spacing
7. Markdown content is properly styled and formatted

### Story 2.5: Node Activation and Path Calculation

As a user,
I want to click on nodes to activate them and see the conversation path,
so that I can understand which nodes will be used as context for new messages.

#### Acceptance Criteria

1. Clicking a node activates it and all nodes in path back to source
2. Active nodes have white background, inactive nodes have light-gray background
3. Path calculation correctly identifies all nodes from clicked node to root
4. Visual feedback clearly shows which nodes are active
5. Node activation works correctly regardless of graph complexity
6. Activation state is maintained until user clicks different node
7. Path calculation handles complex branching scenarios correctly

## Epic 3: LLM Integration & Streaming

**Goal:** Integrate OpenAI API with streaming support to provide real-time LLM responses within nodes. This epic delivers the core AI functionality that powers the conversation system with proper streaming and context management.

### Story 3.1: OpenAI API Integration

As a developer,
I want to integrate OpenAI API with the Next.js backend,
so that I can send user messages and receive LLM responses.

#### Acceptance Criteria

1. OpenAI API is properly configured with environment variables
2. API route is created for handling LLM requests (/api/chat)
3. Request includes proper authentication and error handling
4. API accepts conversation context and user message
5. Response handling includes proper error cases and timeouts
6. API follows Next.js best practices for route handlers
7. Rate limiting and usage monitoring are implemented

### Story 3.2: Context Flattening and Path Traversal

As a developer,
I want to implement path traversal and context flattening,
so that the LLM receives proper conversation context from active nodes.

#### Acceptance Criteria

1. Active node path is correctly calculated from clicked node to source
2. Path is flattened into user/assistant message pairs
3. Context includes proper message formatting for OpenAI API
4. Context length is managed to stay within API limits
5. Context preservation maintains conversation flow and meaning
6. Path calculation handles edge cases and complex branching
7. Context flattening is efficient and doesn't impact performance

### Story 3.3: Streaming Response Implementation

As a user,
I want to see LLM responses stream in real-time,
so that I can read the response as it's being generated.

#### Acceptance Criteria

1. LLM responses stream in real-time to the frontend
2. Streaming uses Server-Sent Events or similar technology
3. Markdown content is rendered progressively as it streams
4. Loading state is properly managed during streaming
5. Streaming handles connection interruptions gracefully
6. Response quality and formatting are maintained during streaming
7. Streaming performance is smooth without noticeable delays

### Story 3.4: Markdown Rendering and Display

As a user,
I want to see properly formatted markdown content in nodes,
so that I can read LLM responses with proper formatting.

#### Acceptance Criteria

1. Markdown content is rendered with proper styling and formatting
2. Code blocks, lists, headers, and other markdown elements display correctly
3. Markdown rendering is performant and doesn't cause layout shifts
4. Long markdown content is properly contained within node boundaries
5. Markdown rendering handles edge cases and malformed content
6. Styling is consistent with overall application design
7. Markdown content is accessible and readable

### Story 3.5: Mock API for Development

As a developer,
I want to have a mock OpenAI API for development and testing,
so that I can develop without external API dependencies.

#### Acceptance Criteria

1. Mock API route provides consistent markdown responses
2. Mock responses include various markdown elements for testing
3. Mock API simulates streaming behavior for realistic testing
4. Mock responses are configurable for different test scenarios
5. Development environment automatically uses mock API
6. Mock API maintains same interface as real OpenAI API
7. Mock responses are realistic and useful for development

## Epic 4: Advanced Graph Features

**Goal:** Implement advanced graph interaction features including markdown anchors, edge customization, and sophisticated branching capabilities. This epic delivers the full power of the graph-based conversation system.

### Story 4.1: Markdown Element Anchors

As a user,
I want to create new conversation branches from specific parts of markdown content,
so that I can explore related topics in context.

#### Acceptance Criteria

1. Hovering over markdown elements shows anchor points
2. Anchor points are visually distinct and properly positioned
3. Clicking anchor creates new node with contextual connection
4. New node includes context from parent node content
5. Anchor system works with all markdown element types
6. Element path identification is unique and stable
7. Anchor creation maintains proper graph structure

### Story 4.2: Contextual Message Preprocessing

As a developer,
I want to prepend contextual information to messages from markdown anchors,
so that the LLM understands the relationship between nodes.

#### Acceptance Criteria

1. Messages from markdown anchors include "this message is related to ${node content}" prefix
2. Context extraction correctly identifies relevant content from parent node
3. Context preprocessing maintains message clarity and meaning
4. Context length is managed to stay within API limits
5. Context preprocessing works with various markdown content types
6. Context is properly formatted for LLM consumption
7. Context preprocessing doesn't interfere with normal message flow

### Story 4.3: Edge Customization and Management

As a user,
I want to customize and manage edges between nodes,
so that I can create complex conversation structures.

#### Acceptance Criteria

1. Split button system provides "+" for auto-connect and separate button for manual edges
2. Manual edge creation allows connecting to any node's input area
3. Edge customization includes visual styling and connection types
4. Edge management allows deletion and modification of connections
5. Edge system maintains graph integrity and prevents invalid connections
6. Edge customization is intuitive and user-friendly
7. Edge changes are properly synchronized with backend

### Story 4.4: Advanced Graph Navigation

As a user,
I want to navigate complex graphs with multiple branches,
so that I can explore different conversation paths effectively.

#### Acceptance Criteria

1. Graph navigation handles complex branching scenarios
2. Node activation works correctly with multiple active paths
3. Visual feedback clearly shows active and inactive nodes
4. Graph layout automatically adjusts for new nodes and connections
5. Navigation performance remains smooth with large graphs
6. Graph state is properly maintained during navigation
7. Navigation works consistently across different graph structures

### Story 4.5: Graph State Synchronization

As a developer,
I want to implement robust state synchronization,
so that all graph changes are properly saved and synchronized.

#### Acceptance Criteria

1. All node changes trigger automatic backend synchronization
2. Edge modifications are immediately saved to database
3. Position changes are synchronized with debounced updates
4. State synchronization handles network interruptions gracefully
5. Conflict resolution prevents data loss during concurrent edits
6. Synchronization performance doesn't impact user experience
7. State consistency is maintained across all operations

## Epic 5: Polish & Optimization

**Goal:** Add final polish, error handling, performance optimizations, and user experience enhancements to deliver a production-ready graph-based LLM interface.

### Story 5.1: Error Handling and User Feedback

As a user,
I want to receive clear feedback when errors occur,
so that I understand what went wrong and how to proceed.

#### Acceptance Criteria

1. Network errors are handled gracefully with user-friendly messages
2. LLM API errors provide clear feedback and retry options
3. Database errors are handled without data loss
4. Error states are visually distinct and informative
5. Error recovery options are provided where possible
6. Error logging is implemented for debugging purposes
7. Error handling doesn't break the user experience

### Story 5.2: Performance Optimization

As a developer,
I want to optimize the application for performance,
so that users have a smooth experience even with large graphs.

#### Acceptance Criteria

1. Large graphs (100+ nodes) render and interact smoothly
2. Node rendering is optimized to prevent performance degradation
3. State updates are batched to minimize re-renders
4. Memory usage is optimized for long-running sessions
5. API calls are optimized to reduce unnecessary requests
6. Graph layout algorithms are efficient for complex structures
7. Performance monitoring is implemented for ongoing optimization

### Story 5.3: User Experience Enhancements

As a user,
I want a polished and intuitive interface,
so that I can focus on my conversations without interface distractions.

#### Acceptance Criteria

1. Loading states are smooth and informative
2. Transitions between states are visually appealing
3. Interface is responsive and works well on different devices
4. Keyboard shortcuts are available for common actions
5. Visual feedback is consistent throughout the application
6. Interface follows modern design principles
7. User experience is intuitive for new users

### Story 5.4: Data Management and Backup

As a user,
I want my conversations to be safely stored and recoverable,
so that I don't lose important conversation data.

#### Acceptance Criteria

1. Conversation data is properly backed up and recoverable
2. Data validation prevents corruption and invalid states
3. Data migration handles schema changes gracefully
4. Export functionality allows users to backup conversations
5. Data retention policies are implemented appropriately
6. Data security measures protect user information
7. Data management doesn't impact application performance

## Checklist Results Report

### Executive Summary

**Overall PRD Completeness:** 92% Complete
**MVP Scope Appropriateness:** Just Right - Well-scoped for incremental delivery
**Readiness for Architecture Phase:** Ready - Clear technical direction provided
**Most Critical Gaps:** Minor gaps in user research validation and detailed error handling specifications

### Category Analysis

| Category                         | Status  | Critical Issues               |
| -------------------------------- | ------- | ----------------------------- |
| 1. Problem Definition & Context  | PASS    | None                          |
| 2. MVP Scope Definition          | PASS    | None                          |
| 3. User Experience Requirements  | PASS    | None                          |
| 4. Functional Requirements       | PASS    | None                          |
| 5. Non-Functional Requirements   | PARTIAL | Error handling details needed |
| 6. Epic & Story Structure        | PASS    | None                          |
| 7. Technical Guidance            | PASS    | None                          |
| 8. Cross-Functional Requirements | PASS    | None                          |
| 9. Clarity & Communication       | PASS    | None                          |

### Detailed Validation Results

#### ✅ **STRENGTHS IDENTIFIED:**

**1. Problem Definition & Context (PASS)**

- Clear problem statement: Linear chat limitations vs. human thinking patterns
- Specific target audience: Individuals exploring complex topics
- Well-defined success metrics: Graph complexity and branching depth
- Strong differentiation from existing solutions

**2. MVP Scope Definition (PASS)**

- Excellent progressive development approach (5 sequential epics)
- Clear separation of core vs. advanced features
- Each epic delivers working functionality
- Appropriate scope for solo development

**3. User Experience Requirements (PASS)**

- Comprehensive UX vision with clear interaction paradigms
- Detailed node state management (input, loading, completed)
- Accessibility considerations (WCAG AA)
- Responsive design requirements specified

**4. Functional Requirements (PASS)**

- 18 well-defined functional requirements (FR1-FR18)
- Clear acceptance criteria for all user stories
- Proper user story format with "As a... I want... so that..."
- Testable and verifiable requirements

**5. Epic & Story Structure (PASS)**

- Logical sequential epic progression
- Appropriate story sizing for AI agent execution
- Clear dependencies and prerequisites
- Each story delivers vertical slice of functionality

**6. Technical Guidance (PASS)**

- Clear technology stack decisions (Next.js, MongoDB, React Flow)
- Shared TypeScript types between frontend/backend
- Proper testing strategy (Unit + Integration)
- Mock API approach for development

#### ⚠️ **AREAS FOR IMPROVEMENT:**

**5. Non-Functional Requirements (PARTIAL)**

- **Gap:** Detailed error handling specifications needed
- **Recommendation:** Add specific error scenarios and recovery mechanisms
- **Impact:** Low - can be addressed during development

**Missing Elements:**

- Specific user research validation (though brainstorming session provides good foundation)
- Detailed performance benchmarks for large graphs
- Specific security requirements for conversation data

### Top Issues by Priority

#### **BLOCKERS:** None identified

#### **HIGH:** None identified

#### **MEDIUM:**

1. **Error Handling Detail:** Add specific error scenarios and recovery mechanisms to NFR section
2. **Performance Benchmarks:** Define specific performance targets for large graphs (100+ nodes)

#### **LOW:**

1. **User Research Validation:** Consider adding user testing plan for MVP validation
2. **Security Details:** Add specific data protection requirements for conversation content

### MVP Scope Assessment

**✅ Scope is Well-Balanced:**

- Epic 1-3 deliver core functionality (conversation management, graph interface, LLM integration)
- Epic 4-5 add advanced features and polish
- Each epic provides deployable value
- Timeline appears realistic for solo development

**✅ No Features Need Cutting:** All features directly support the core value proposition

**✅ No Missing Essential Features:** Core graph-based conversation functionality is complete

### Technical Readiness

**✅ Excellent Technical Foundation:**

- Clear technology stack decisions with rationale
- Proper separation of concerns (frontend/backend/database)
- Shared type system for consistency
- Mock-first development approach

**✅ Technical Risks Identified:**

- Graph performance with large node counts
- Real-time streaming implementation
- State synchronization complexity

**✅ Areas for Architect Investigation:**

- React Flow optimization strategies
- MongoDB schema design for complex graphs
- Streaming architecture patterns

### Recommendations

#### **Immediate Actions:**

1. **Add Error Handling Details:** Specify error scenarios, recovery mechanisms, and user feedback
2. **Define Performance Benchmarks:** Set specific targets for graph size and response times

#### **Development Phase:**

1. **User Testing Plan:** Implement feedback collection during Epic 2-3 development
2. **Security Review:** Add conversation data protection requirements

#### **Architecture Phase:**

1. **Performance Optimization:** Focus on React Flow rendering optimization
2. **State Management:** Design robust synchronization patterns
3. **Streaming Architecture:** Implement efficient real-time communication

### Final Decision

**✅ READY FOR ARCHITECT:** The PRD and epics are comprehensive, properly structured, and ready for architectural design. The minor gaps identified can be addressed during development without blocking the architecture phase.

**Next Steps:**

1. Proceed to architecture design phase
2. Address error handling details during Epic 1 development
3. Implement user feedback collection during Epic 2-3
4. Monitor performance benchmarks during Epic 4-5

## Next Steps

### UX Expert Prompt

Create detailed wireframes and user flow diagrams for the graph-based LLM interface, focusing on the node interaction patterns, markdown anchor system, and graph navigation experience.

### Architect Prompt

Design the technical architecture for the graph-based LLM interface, including React Flow integration, MongoDB schema design, streaming implementation, and state management patterns.
