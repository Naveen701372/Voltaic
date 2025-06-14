#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Voltaic Development Server Manager${NC}"
echo -e "${BLUE}=====================================${NC}"

# Function to kill processes on specific ports
kill_port_processes() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)
    
    if [ ! -z "$pids" ]; then
        echo -e "${YELLOW}⚡ Killing processes on port $port: $pids${NC}"
        kill -9 $pids 2>/dev/null
        sleep 1
    fi
}

# Function to activate virtual environment
activate_venv() {
    if [ -f ".venv/bin/activate" ]; then
        echo -e "${GREEN}🐍 Activating Python virtual environment...${NC}"
        source .venv/bin/activate
    else
        echo -e "${YELLOW}⚠️  No Python virtual environment found${NC}"
    fi
}

# Kill processes on ports 3000-3010
echo -e "${YELLOW}🔫 Cleaning up ports 3000-3010...${NC}"
for port in {3000..3010}; do
    kill_port_processes $port
done

# Kill any existing Next.js processes
echo -e "${YELLOW}🔫 Killing existing Next.js processes...${NC}"
pkill -f "next dev" 2>/dev/null || true
pkill -f "node.*next" 2>/dev/null || true

# Wait a moment for cleanup
sleep 2

# Change to project directory if script is run from elsewhere
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo -e "${BLUE}📁 Working directory: $(pwd)${NC}"

# Activate virtual environment
activate_venv

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Start the development server
echo -e "${GREEN}🚀 Starting Voltaic development server...${NC}"
echo -e "${GREEN}🌐 The server will be available at: http://localhost:3000${NC}"
echo -e "${YELLOW}💡 Press Ctrl+C to stop the server${NC}"
echo -e "${BLUE}🔧 If you encounter issues, run: npm run debug${NC}"
echo ""

# Start the server with explicit port to avoid webpack errors
PORT=3000 npm run dev 