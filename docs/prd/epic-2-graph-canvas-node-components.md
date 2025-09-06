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

## Story 2.6: Branch Creation and Node Positioning

As a user,
I want to click the plus button to create a new input node that is properly positioned and connected,
so that I can continue the conversation in a new branch with clear visual relationships.

### Acceptance Criteria

1. Clicking the "+" button spawns a new node with type "input"
2. New node is positioned below the current node with proper spacing
3. An edge is automatically created connecting from bottom of current node to top of new node
4. New node appears with input field ready for user interaction
5. Node positioning maintains proper visual hierarchy and spacing
6. Edge connection is visually clear and properly styled
7. New node becomes the active node and is ready for user input

## Story 2.7: Node Deletion with Hover Delete Button

As a user,
I want to delete nodes by clicking a delete button that appears when I hover over a node,
so that I can remove unwanted conversation branches and clean up my graph.

### Acceptance Criteria

1. Delete button appears in the top-right corner of each node when hovered
2. Delete button is visually distinct and clearly indicates deletion action
3. Clicking the delete button immediately deletes the node without confirmation
4. All edges connected to the deleted node are also removed
5. Node deletion updates the conversation state and syncs with backend
6. Deleted nodes are completely removed from the graph visualization
7. Node deletion works for all node types (input, loading, completed)
8. Graph layout adjusts properly after node deletion
9. No orphaned edges remain after node deletion
10. Deletion is permanent and cannot be undone

## Story 2.8: Node Movement with Drag & Drop

As a user,
I want to move nodes by dragging and dropping them to new positions,
so that I can reorganize my conversation graph layout and improve visual organization.

### Acceptance Criteria

1. All nodes can be dragged by clicking and holding on them
2. Visual feedback shows the node being dragged with appropriate cursor changes
3. Nodes can be dropped at any valid position on the canvas
4. Node position updates are saved to the conversation state
5. Position changes sync with the backend through existing API
6. Dragged nodes maintain their connections to other nodes
7. Node movement works for all node types (input, loading, completed)
8. Graph layout updates smoothly after node repositioning
9. Node positions persist across page refreshes
10. Drag and drop functionality is accessible and works with keyboard navigation

## Story 2.9: Contextual Menu with Create New Node

As a user,
I want to right-click on the canvas to open a contextual menu with options to create new nodes,
so that I can quickly add new conversation nodes at specific positions on the graph.

### Acceptance Criteria

1. Right-clicking on empty canvas space opens a contextual menu
2. Contextual menu appears at the cursor position
3. Menu contains "Create new node" option as the first item
4. Clicking "Create new node" creates a new input node at the cursor position
5. New node is properly positioned and becomes active
6. Contextual menu closes after selecting an option or clicking elsewhere
7. Menu has proper styling and visual hierarchy
8. Right-clicking on existing nodes does not show the contextual menu
9. Menu is accessible and works with keyboard navigation
10. New node creation integrates with existing conversation state management
