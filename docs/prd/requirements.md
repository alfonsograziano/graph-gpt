# Requirements

## Functional

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

## Non Functional

**NFR1:** The system shall respond to user interactions within 200ms for UI state changes.

**NFR2:** The system shall stream LLM responses with minimal latency, starting within 1 second of request submission.

**NFR3:** The system shall handle conversations with up to 100 nodes without performance degradation.

**NFR4:** The system shall maintain conversation state consistency across browser refreshes and navigation.

**NFR5:** The system shall provide responsive design that works on desktop and tablet devices.

**NFR6:** The system shall implement proper error handling for network failures and LLM API errors.

**NFR7:** The system shall use debounced syncing (1000ms) to prevent excessive backend requests during rapid changes.

**NFR8:** The system shall maintain data integrity with proper validation of conversation schema.
