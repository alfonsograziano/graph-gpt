# Graph GPT

A graph-style UI for interacting with LLMs using React Flow. Think non-linearly and create branching conversations with AI.

## Features

- **Graph-based Conversations**: Create non-linear conversation flows using nodes and edges
- **Interactive Nodes**: Each node can contain user input and AI responses
- **Streaming Responses**: Real-time streaming of AI responses with markdown support
- **Multiple Connection Types**: Connect nodes from bottom (sequential) or sides (contextual)
- **Markdown Anchors**: Click on any markdown element to create side connections
- **Active Node Tracking**: Visual indication of conversation context
- **Persistent Storage**: MongoDB integration for saving conversations
- **Editable Titles**: Rename conversations with a simple click

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud)

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with:

   ```
   MONGODB_URI=mongodb://admin:password@localhost:27017/graph-gpt?authSource=admin
   ```

4. Start MongoDB using Docker:

   ```bash
   npm run start:mongodb
   ```

5. Run the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### MongoDB Management

- **Start MongoDB**: `npm run start:mongodb`
- **Stop MongoDB**: `npm run stop:mongodb`
- **View MongoDB logs**: `npm run mongodb:logs`
- **Reset MongoDB data**: `npm run mongodb:reset`

**Note**: These scripts use Docker Compose. Make sure Docker is installed and running on your system.

**Mongo Express UI**: Access the MongoDB web interface at [http://localhost:8081](http://localhost:8081)

- Username: `admin`
- Password: `admin`

## Usage

1. **Create a Conversation**: Click "New Conversation" on the homepage
2. **Start Chatting**: Type your message in the initial node and click Submit
3. **Create Branches**: Use the + buttons to create new conversation branches
4. **Side Connections**: Hover over markdown elements and click to create contextual connections
5. **Navigate**: Click on nodes to see the conversation context

## Architecture

- **Frontend**: Next.js 15 with React Flow for graph visualization
- **Backend**: Next.js API routes with MongoDB/Mongoose
- **Database**: MongoDB for conversation storage
- **UI**: Tailwind CSS for styling

## Project Structure

```
src/
├── app/
│   ├── api/conversations/     # API routes for conversation CRUD
│   ├── chat/[id]/            # Chat page with React Flow canvas
│   └── page.tsx              # Homepage with conversation list
├── components/
│   └── ConversationNode.tsx  # Custom React Flow node component
├── lib/
│   └── mongodb.ts            # MongoDB connection
├── models/
│   └── Conversation.ts       # Mongoose schema
└── types/
    └── index.ts              # Shared TypeScript types
```

## Customization

The current implementation uses a mock LLM for demonstration. To integrate with a real LLM:

1. Update the `mockLLMStream` function in `/src/app/api/conversations/[id]/stream/route.ts`
2. Replace with your preferred LLM API (OpenAI, Anthropic, etc.)
3. Ensure the response format matches the expected streaming format

## Contributing

Feel free to submit issues and enhancement requests!
