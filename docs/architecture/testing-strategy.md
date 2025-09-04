# Testing Strategy

## Testing Pyramid

```
        E2E Tests
       /        \
   Integration Tests
   /            \
Frontend Unit  Backend Unit
```

## Test Organization

### Frontend Tests
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

### Backend Tests
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

### E2E Tests
```
tests/e2e/
├── conversation-flow.spec.ts
├── graph-interactions.spec.ts
└── llm-integration.spec.ts
```

## Test Examples

### Frontend Component Test
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

### Backend API Test
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

### E2E Test
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
