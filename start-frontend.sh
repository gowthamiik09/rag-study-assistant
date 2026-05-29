#!/bin/bash
set -e
echo "🚀 Starting RAG Study Assistant Frontend..."
cd "$(dirname "$0")/frontend"

if [ ! -d "node_modules" ]; then
  echo "Installing npm packages..."
  npm install
fi

echo "✅ Starting Next.js on http://localhost:3000"
npm run dev
