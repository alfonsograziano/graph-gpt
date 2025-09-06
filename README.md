# Graph GPT

A graph-based interface for LLM interactions that mirrors human thinking patterns. Instead of linear chat conversations, Graph GPT allows you to explore multiple conversation paths simultaneously, creating a visual knowledge graph of your AI interactions.

## 🌟 Key Features

- **Non-linear Conversations**: Create multiple conversation branches from any point in your interaction
- **Visual Graph Interface**: Intuitive node-based conversation management using React Flow
- **Real-time Streaming**: Live markdown rendering as the AI responds
- **Contextual Branching**: Create new nodes from specific parts of AI responses
- **Conversation Persistence**: Save and manage multiple conversation graphs
- **Interactive Node Management**: Click to activate conversation paths, drag to reposition nodes
- **Smart Context**: Automatically includes relevant conversation history when branching

## 🚀 Quick Start

### Prerequisites

- Node.js v20+
- MongoDB (local with Docker, or cloud instance)
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/graph-gpt.git
   cd graph-gpt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your configuration:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   MONGODB_URI=mongodb://localhost:27017/graph-gpt
   ```

4. **Start MongoDB** (if running locally with Docker)
   ```bash
   npm run start:mongodb
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 How It Works

### Traditional Chat vs Graph GPT

**Traditional Chat**: Linear conversation flow
```
User → AI → User → AI → User → AI
```

**Graph GPT**: Non-linear, explorative flow
```
User → AI → [Branch A: User → AI] → [Branch B: User → AI]
         ↘ [Branch C: User → AI] 
```

### Core Concepts

1. **Nodes**: Each conversation point becomes a visual node
2. **Branches**: Create new conversation paths from any node
3. **Context**: Active conversation path provides context to the AI
4. **Visualization**: See your entire conversation as an interactive graph

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Library**: Tailwind CSS, Lucide React icons
- **Graph Visualization**: React Flow
- **Backend**: Next.js API routes
- **Database**: MongoDB with Mongoose
- **AI Integration**: OpenAI API with streaming
- **Testing**: Jest, Vitest, Playwright
- **Development**: Storybook, ESLint

## 🎨 User Interface

### Homepage
- View all saved conversations
- Create new conversations
- Delete existing conversations
- Responsive grid layout

### Conversation Canvas
- Interactive graph visualization
- Editable conversation titles
- Node creation and management
- Real-time streaming responses
- Context-aware branching
## 🤝 Contributing

We welcome contributions! Please feel free to open a PR or an issue to request features :D 

## 🙏 Acknowledgments

This project was inspired by and built using:

- **[BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD)** - Breakthrough Method for Agile AI Driven Development that provided the development methodology and framework
- **[Maxly.chat](https://www.maxly.chat/)** - The original inspiration for the graph-based conversation interface concept



## License

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
