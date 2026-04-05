# Eco-Tracker Frontend

This is the React + TypeScript + Vite frontend for the Eco-Tracker project.

## Development

We recommend running the project from the root directory using the monorepo scripts:

```bash
# In the root project directory:
npm run dev
```

To run only the frontend:
```bash
npm install
npm run dev
```

## Features
- Vite Proxy: Configured in `vite.config.ts` to forward /api requests to localhost:8000.
- Framer Motion: Handles all cinematic page transitions and telemetry animations.
- Design System: Custom CSS tokens in src/index.css.

For full documentation on the architecture and carbon calculations, see the Root README or the in-app Docs page.
