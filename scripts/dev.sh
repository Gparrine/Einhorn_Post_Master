#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [ ! -f "$ROOT/backend/.env" ]; then
  cp "$ROOT/backend/.env.example" "$ROOT/backend/.env"
  echo "Created backend/.env from .env.example (demo mode enabled)"
fi

if [ ! -d "$ROOT/backend/node_modules" ] || [ ! -d "$ROOT/frontend/node_modules" ]; then
  echo "Installing dependencies..."
  npm run install:all --prefix "$ROOT"
fi

cleanup() {
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Starting backend on http://localhost:3001"
npm run dev:backend --prefix "$ROOT" &
BACKEND_PID=$!

echo "Starting frontend on http://localhost:5173"
npm run dev:frontend --prefix "$ROOT" &
FRONTEND_PID=$!

echo ""
echo "Einhorn Postmaster is running."
echo "  App:     http://localhost:5173"
echo "  API:     http://localhost:3001/api/health"
echo "Press Ctrl+C to stop both servers."
echo ""

wait
