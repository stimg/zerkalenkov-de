# Project Overview

This is a personal portfolio website built with:
- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Backend API**: Bun runtime
- **3D Graphics**: React Three Fiber

## Project Structure

```
├── src/              # Frontend React application
├── api/              # Backend API server (Bun)
├── public/           # Static assets
└── index.html        # Vite entry point
```

## Development

Use Bun as the package manager and runtime:

- `bun install` - Install dependencies
- `bun run dev` - Start Vite dev server (frontend only, port 3000)
- `bun run dev:api` - Start Bun API server (backend only)
- `bun run dev:all` - Start both frontend and backend
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run lint` - Type check with TypeScript
- `bun run build:lambda` - Bundle Lambda handler to `lambda/dist/handler.js`

## Package Management

- Use `bun install` instead of `npm install`
- Use `bun add <package>` instead of `npm install <package>`
- Use `bun remove <package>` instead of `npm uninstall <package>`
- Use `bunx <package>` instead of `npx <package>`

## Backend API (src/api/server.ts)

The API server uses Bun's built-in server capabilities:
- `Bun.serve()` for HTTP server
- Bun automatically loads `.env` files
- Use `Bun.file()` for file operations
- Built-in WebSocket support

Key modules in `src/api/`:
- `server.ts` — Bun dev server (chat + JD match endpoints)
- `prompts.ts` — shared system prompt builder (used by server and Lambda)
- `sanitize.ts` — JD sanitization and injection-pattern detection
- `anthropic.ts` — frontend client (sanitize → length guards → Lambda fetch)

## Lambda (AWS)

Production JD matcher runs as an AWS Lambda function:
- Source: `lambda/handler.ts`
- Build: `bun run build:lambda` → outputs `lambda/dist/handler.js`
- Deploy manually via AWS Console or CLI after each build
- Uses `resume.txt` (not `resume.json`) as LLM context

## Frontend (Vite + React)

- Entry point: `src/main.tsx`
- Uses Vite for bundling and dev server
- React 19 with TypeScript
- Tailwind CSS for styling
- Path alias: `@/` maps to `./src/`

## Environment Variables

- `.env` - Local environment variables (not committed)
- `.env.example` - Template for environment variables
- Bun automatically loads `.env` without needing dotenv package

Required in `.env`:
- `ANTHROPIC_API_KEY` — used by Lambda and local dev server
- `OPENAI_API_KEY` — used by local dev server (chat endpoint)

## Code Style

- Always use semicolons at the end of statements
- Use arrow functions everywhere possible instead of function declarations
- React components must be typed arrow functions: `export const Foo: React.FC<Props> = ({ ... }) => { ... }`
