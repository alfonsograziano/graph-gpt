# Technical Assumptions

## Repository Structure: Monorepo

Single repository containing both frontend and backend code for simplified development and deployment.

## Service Architecture

**Next.js Full-Stack Application:**

- Frontend: React with TypeScript, React Flow for graph visualization
- Backend: Next.js API routes for LLM integration and data persistence
- Database: MongoDB with Mongoose ODM
- Shared types between frontend and backend for data consistency

## Testing Requirements

**Unit + Integration Testing:**

- Unit tests for individual components and utility functions
- Integration tests for API routes and database operations
- Mock OpenAI API for consistent testing without external dependencies
- Component testing for React Flow interactions and node states

## Additional Technical Assumptions and Requests

- **LLM Integration:** OpenAI API with streaming support for real-time response generation
- **State Management:** React Context for graph state management within the canvas component
- **Data Persistence:** MongoDB as single source of truth for conversation data
- **Real-time Updates:** Server-sent events or polling for conversation synchronization
- **Markdown Rendering:** React markdown library for proper content display
- **Graph Traversal:** Custom algorithms for calculating active node paths and context flattening
- **Element Path Identification:** Unique identifiers for markdown elements to enable anchor connections
