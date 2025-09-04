# Coding Standards

## Critical Fullstack Rules

- **Type Sharing:** Always define types in `src/types/` and import from there
- **API Calls:** Never make direct HTTP calls - use the service layer in `src/services/`
- **Environment Variables:** Access only through config objects, never `process.env` directly
- **Error Handling:** All API routes must use the standard error handler
- **State Updates:** Never mutate state directly - use proper state management patterns
- **Graph Operations:** All graph modifications must go through the GraphContext
- **LLM Integration:** Always use the chat service for OpenAI API calls
- **Database Access:** Use repository pattern, never direct MongoDB calls in components

## Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `ConversationNode.tsx` |
| Hooks | camelCase with 'use' | - | `useGraphState.ts` |
| API Routes | - | kebab-case | `/api/conversations` |
| Database Collections | - | snake_case | `conversations` |
| Types/Interfaces | PascalCase | PascalCase | `Conversation` |
| Functions | camelCase | camelCase | `createConversation` |
| Constants | UPPER_SNAKE_CASE | UPPER_SNAKE_CASE | `MAX_NODES` |
