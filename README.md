# BizChat Project Layout

This repository is split into two runnable apps:

- `backend/` - Node.js + Express API, MongoDB models, Socket.IO server
- `zip/` - React frontend application (Vite)

## Run Commands (from repo root)

- Start frontend dev server: `npm run frontend:dev`
- Build frontend: `npm run frontend:build`
- Start backend in dev mode: `npm run backend:dev`
- Start backend in normal mode: `npm run backend:start`

## Realtime Setup

Backend emits realtime events over Socket.IO:

- `new_message`
- `order_update`

Frontend connects to Socket.IO using:

- `VITE_SOCKET_URL` (optional)
- falls back to `VITE_API_BASE_URL` host
- default fallback: `http://localhost:5000`

## API Base URL

Frontend API client reads:

- `VITE_API_BASE_URL` (default: `http://localhost:5000/api`)
