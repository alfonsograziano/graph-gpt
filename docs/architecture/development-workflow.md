# Development Workflow

## Local Development Setup

### Prerequisites
```bash
# Required software
node --version  # v18.17.0 or later
npm --version   # v9.0.0 or later
mongodb --version  # v7.0 or later (or use MongoDB Atlas)
```

### Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd graph-gpt

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Set up MongoDB (if using local instance)
# Or configure MongoDB Atlas connection string

# Start development server
npm run dev
```

### Development Commands
```bash
# Start all services
npm run dev

# Start frontend only (if separated)
npm run dev:frontend

# Start backend only (if separated)
npm run dev:backend

# Run tests
npm test                    # Unit tests
npm run test:watch         # Watch mode
npm run test:e2e           # End-to-end tests
npm run test:coverage      # Coverage report

# Build for production
npm run build

# Start production server
npm start

# Lint and format
npm run lint
npm run format
```

## Environment Configuration

### Required Environment Variables
```bash
# Frontend (.env.local)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Backend (.env.local)
MONGODB_URI=mongodb://localhost:27017/graph-gpt
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/graph-gpt

OPENAI_API_KEY=sk-your-openai-api-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Shared
NODE_ENV=development
```
