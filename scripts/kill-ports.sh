#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔫 Killing all processes on ports 3000-3010...${NC}"

# Kill all processes on ports 3000-3010
for port in {3000..3010}; do
    pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo -e "${RED}⚡ Killing processes on port $port: $pids${NC}"
        kill -9 $pids 2>/dev/null
    fi
done

# Also kill any remaining Next.js processes
echo -e "${YELLOW}🔫 Killing any remaining Next.js processes...${NC}"
pkill -f "next dev" 2>/dev/null || true
pkill -f "node.*next" 2>/dev/null || true

echo -e "${GREEN}✅ Port cleanup complete!${NC}" 