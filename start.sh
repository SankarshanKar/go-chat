#!/bin/bash
set -e

echo "Building Go backend..."
go build -o bin/go-chat ./cmd/

echo "Starting backend..."
./bin/go-chat &
BACKEND_PID=$!

trap "kill $BACKEND_PID 2>/dev/null" EXIT

echo "Starting frontend..."
cd frontend && npm run dev
