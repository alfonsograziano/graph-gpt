# Unified Project Structure

```
graph-gpt/
├── .github/                    # CI/CD workflows
│   └── workflows/
│       ├── ci.yaml
│       └── deploy.yaml
├── src/                        # Next.js application
│   ├── app/                    # App Router
│   │   ├── api/                # API routes
│   │   │   ├── conversations/
│   │   │   ├── chat/
│   │   │   └── sync/
│   │   ├── chat/[id]/          # Conversation pages
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/             # React components
│   │   ├── ui/                 # Reusable UI components
│   │   ├── graph/              # Graph-specific components
│   │   ├── layout/             # Layout components
│   │   └── pages/              # Page components
│   ├── hooks/                  # Custom React hooks
│   ├── context/                # React Context providers
│   ├── services/               # API service layer
│   ├── types/                  # TypeScript type definitions
│   ├── utils/                  # Utility functions
│   └── lib/                    # Configuration and utilities
├── public/                     # Static assets
├── tests/                      # Test files
│   ├── components/             # Component tests
│   ├── api/                    # API tests
│   └── e2e/                    # End-to-end tests
├── docs/                       # Documentation
│   ├── prd.md
│   └── architecture.md
├── .env.example                # Environment template
├── .env.local                  # Local environment variables
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
└── README.md
```
