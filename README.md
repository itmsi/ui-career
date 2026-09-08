# Career UI

Applicant form portal, built with React 19, Vite, Tailwind CSS v4, and shadcn/ui.

## Requirements

- Node.js 22+
- npm

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment file and adjust as needed:

   ```bash
   cp .env.example .env.local
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   The app runs at `http://localhost:5173` by default.

## Scripts

| Command           | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`       | Start the Vite dev server with HMR   |
| `npm run build`     | Type-check and build for production  |
| `npm run preview`   | Preview the production build locally |
| `npm run lint`      | Run Oxlint                           |

## Environment Variables

See [.env.example](.env.example) for the full list. Copy it to `.env.local` before running the app.

| Variable              | Description                |
| ---------------------- | --------------------------- |
| `VITE_API_BASE_URL`     | Base URL of the backend API |

## Project Structure

```
src/
  applicant-form/   # Applicant form page
  login/            # Login page (not currently wired into routes)
  components/ui/    # shadcn/ui components
  lib/              # Shared utilities
  routes.tsx         # App routes
```
