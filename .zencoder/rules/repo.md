# Repository Overview

## Project Name
Mutual Fund Explorer

## Technology Stack
- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API routes (Node.js)
- **Database**: MongoDB
- **Languages**: JavaScript, TypeScript
- **Tooling**: ESLint, PostCSS

## Key Directories
- **src/app**: Route handlers and page components
- **src/components**: Reusable UI components
- **src/lib**: Utility libraries (e.g., API clients, database helpers)
- **src/models**: Data models and schema definitions
- **public**: Static assets served by Next.js
- **data**: JSON datasets used by the application
- **scripts**: Automation and data processing scripts

## Entry Points
- **src/app/page.js**: Home page
- **src/app/funds/page.js**: Fund exploration interface
- **src/app/api**: Serverless API routes

## Testing
- **N/A**: No formal tests detected in the current repository snapshot.

## Setup Steps
1. Install dependencies with `npm install`.
2. Start the development server using `npm run dev`.
3. Access the app at `http://localhost:3000`.

## Additional Notes
- Environment variables are stored in `.env.local` at the project root.
- MongoDB connection helpers reside in `src/lib/mongodb.js`.
- Active funds data appears under `data/activeFunds.json`.