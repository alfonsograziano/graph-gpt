This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- MongoDB (via Docker or local installation)

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```bash
# MongoDB Configuration
MONGODB_URI=mongodb://admin:password@localhost:27017/graph_gpt?authSource=admin

# OpenAI Configuration (if needed)
# OPENAI_API_KEY=your_openai_api_key_here
```

### Starting MongoDB

To start MongoDB using Docker Compose:

```bash
npm run start:mongodb
```

This will start MongoDB on port 27017 with the following default credentials:
- Username: `admin`
- Password: `password`
- Database: `graph_gpt`

You can also access MongoDB Express (web interface) at [http://localhost:8081](http://localhost:8081) with credentials `admin/admin`.

### Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
