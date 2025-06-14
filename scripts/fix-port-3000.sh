#!/bin/bash

echo "🔧 Port 3000 Diagnostic & Fix Script"
echo "===================================="

# Kill any processes on port 3000
echo "🔫 Killing all processes on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null || true

# Clear system DNS cache
echo "🧹 Clearing DNS cache..."
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Clear Next.js and npm caches
echo "🗑️ Clearing all caches..."
rm -rf .next
rm -rf node_modules/.cache
npm cache clean --force

# Check for any lingering Next.js processes
echo "🔍 Checking for lingering Next.js processes..."
pkill -f "next-server" || true
pkill -f "next dev" || true

# Wait a moment for cleanup
sleep 2

# Set specific environment variables for port 3000
export PORT=3000
export HOSTNAME=127.0.0.1
export NODE_ENV=development
export NEXT_TELEMETRY_DISABLED=1

echo "🚀 Starting Next.js on port 3000 with specific configuration..."
echo "   - Port: $PORT"
echo "   - Host: $HOSTNAME"
echo "   - Environment: $NODE_ENV"
echo "   - Telemetry: Disabled"

# Start with verbose logging
npm run dev -- --port 3000 --hostname 127.0.0.1 