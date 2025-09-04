# Epic 2: Graph Canvas & Node Components

**Goal:** Implement the core graph visualization interface using React Flow, including node components with different states (input, loading, completed) and basic graph interaction patterns. This epic delivers the visual foundation for the graph-based conversation interface.

## Story 2.1: React Flow Canvas Integration

As a developer,
I want to integrate React Flow into the conversation canvas,
so that I can display and interact with graph-based conversation nodes.

### Acceptance Criteria

1. React Flow is properly installed and configured
2. Canvas displays with appropriate dimensions and styling
3. Basic zoom and pan functionality works correctly
4. Canvas handles node positioning and layout
5. Proper TypeScript types are defined for React Flow elements
6. Canvas is responsive and works on different screen sizes

## Story 2.2: Node Component with Input State

As a user,
I want to see a default node with input field when I start a new conversation,
so that I can begin typing my first message.

### Acceptance Criteria

1. Default node is created when conversation is first accessed
2. Node contains text input field with placeholder "What do you have in mind?"
3. Submit button is positioned on the right side of the input
4. Node has light-gray background color by default
5. Input field accepts text input and handles Enter key submission
6. Node is properly positioned on the canvas
7. Node component is reusable and follows React best practices

## Story 2.3: Node State Management and Loading

As a user,
I want to see my message displayed and a loading state when I submit,
so that I know my request is being processed.

### Acceptance Criteria

1. When user submits message, input field is hidden and message is displayed
2. Loading state shows "Generating..." text with appropriate loading indicator
3. Node background remains light-gray during loading
4. Loading state is visually distinct and user-friendly
5. Node maintains proper dimensions during state transitions
6. State transitions are smooth and don't cause layout shifts

## Story 2.4: Node Completion and Branch Creation

As a user,
I want to see the completed node with LLM response and option to create branches,
so that I can continue the conversation in different directions.

### Acceptance Criteria

1. Completed node displays user message, separator, and LLM response
2. LLM response is rendered as markdown with proper formatting
3. Circular "+" button appears at bottom of node after completion
4. Node background changes to white when it becomes active
5. "+" button is visually distinct and properly positioned
6. Node maintains readable layout with proper spacing
7. Markdown content is properly styled and formatted

## Story 2.5: Node Activation and Path Calculation

As a user,
I want to click on nodes to activate them and see the conversation path,
so that I can understand which nodes will be used as context for new messages.

### Acceptance Criteria

1. Clicking a node activates it and all nodes in path back to source
2. Active nodes have white background, inactive nodes have light-gray background
3. Path calculation correctly identifies all nodes from clicked node to root
4. Visual feedback clearly shows which nodes are active
5. Node activation works correctly regardless of graph complexity
6. Activation state is maintained until user clicks different node
7. Path calculation handles complex branching scenarios correctly
