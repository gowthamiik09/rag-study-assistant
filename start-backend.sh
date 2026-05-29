#!/bin/bash
set -e
echo "🚀 Starting RAG Study Assistant Backend..."
cd "$(dirname "$0")/backend"

if [ ! -d "venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv venv
fi

source venv/bin/activate
echo "Installing dependencies..."
pip install -q -r requirements.txt

echo "✅ Starting FastAPI on http://localhost:8000"
echo "📖 API docs at http://localhost:8000/docs"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
