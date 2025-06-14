#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BOLD}${BLUE}🔍 Voltaic Port & Process Diagnostic Tool${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to check port usage
check_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)
    
    if [ ! -z "$pids" ]; then
        echo -e "${YELLOW}📌 Port $port is in use:${NC}"
        for pid in $pids; do
            local proc_info=$(ps -p $pid -o pid,ppid,etime,command --no-headers 2>/dev/null)
            if [ ! -z "$proc_info" ]; then
                echo -e "   ${RED}PID $pid:${NC} $proc_info"
                
                # Check if it's a Next.js process
                if ps -p $pid -o command --no-headers 2>/dev/null | grep -q "next"; then
                    echo -e "   ${CYAN}   └─ Next.js process detected${NC}"
                fi
            fi
        done
        echo ""
        return 1
    else
        echo -e "${GREEN}✅ Port $port is free${NC}"
        return 0
    fi
}

# Function to check Next.js processes
check_nextjs_processes() {
    echo -e "${BOLD}${YELLOW}🔍 Checking for Next.js processes...${NC}"
    
    local next_processes=$(ps aux | grep -E "(next dev|next-server)" | grep -v grep)
    
    if [ ! -z "$next_processes" ]; then
        echo -e "${RED}⚠️  Found Next.js processes:${NC}"
        echo "$next_processes" | while read line; do
            echo -e "   ${YELLOW}$line${NC}"
        done
        echo ""
        return 1
    else
        echo -e "${GREEN}✅ No Next.js processes found${NC}"
        echo ""
        return 0
    fi
}

# Function to check environment issues
check_environment() {
    echo -e "${BOLD}${YELLOW}🔍 Checking environment configuration...${NC}"
    
    # Check for duplicate environment variables
    if [ -f ".env.local" ]; then
        local duplicates=$(grep -E "^[A-Z_]+=" .env.local | cut -d'=' -f1 | sort | uniq -d)
        if [ ! -z "$duplicates" ]; then
            echo -e "${RED}⚠️  Duplicate environment variables found:${NC}"
            echo "$duplicates" | while read var; do
                echo -e "   ${YELLOW}$var${NC}"
                grep "^$var=" .env.local | while read line; do
                    echo -e "     ${CYAN}$line${NC}"
                done
            done
            echo ""
            return 1
        else
            echo -e "${GREEN}✅ No duplicate environment variables${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  No .env.local file found${NC}"
    fi
    echo ""
    return 0
}

# Function to check .next directory
check_next_directory() {
    echo -e "${BOLD}${YELLOW}🔍 Checking .next directory...${NC}"
    
    if [ -d ".next" ]; then
        local size=$(du -sh .next 2>/dev/null | cut -f1)
        local files=$(find .next -type f | wc -l | tr -d ' ')
        echo -e "${YELLOW}📁 .next directory exists: $size ($files files)${NC}"
        
        # Check for common problematic files
        if [ -f ".next/server/app/page.js" ]; then
            echo -e "${GREEN}   ✅ page.js exists${NC}"
        else
            echo -e "${RED}   ❌ page.js missing - this could cause ENOENT errors${NC}"
        fi
        
        # Check cache age
        local cache_age=$(find .next -name "*.js" -mtime +1 | wc -l | tr -d ' ')
        if [ "$cache_age" -gt 0 ]; then
            echo -e "${YELLOW}   ⚠️  Some cache files are older than 1 day${NC}"
        fi
    else
        echo -e "${GREEN}✅ No .next directory (clean state)${NC}"
    fi
    echo ""
}

# Function to suggest solutions
suggest_solutions() {
    echo -e "${BOLD}${BLUE}💡 Quick Solutions:${NC}"
    echo ""
    echo -e "${CYAN}Kill all processes on ports 3000-3010:${NC}"
    echo -e "   npm run kill-ports"
    echo -e "   # or"
    echo -e "   for port in {3000..3010}; do lsof -ti:\$port | xargs -r kill -9; done 2>/dev/null"
    echo ""
    echo -e "${CYAN}Clean restart:${NC}"
    echo -e "   npm run dev:clean"
    echo ""
    echo -e "${CYAN}Nuclear option (full cleanup):${NC}"
    echo -e "   npm run kill-ports && rm -rf .next && npm run dev:clean"
    echo ""
    echo -e "${CYAN}Manual debugging:${NC}"
    echo -e "   lsof -i :3000                    # Check what's using port 3000"
    echo -e "   ps aux | grep next               # Find Next.js processes"
    echo -e "   kill -9 <PID>                    # Kill specific process"
    echo ""
}

# Main diagnostic flow
echo -e "${BOLD}${YELLOW}🔍 Checking ports 3000-3010...${NC}"
echo ""

port_issues=0
for port in {3000..3010}; do
    if ! check_port $port; then
        port_issues=$((port_issues + 1))
    fi
done

echo ""
nextjs_issues=0
if ! check_nextjs_processes; then
    nextjs_issues=1
fi

env_issues=0
if ! check_environment; then
    env_issues=1
fi

check_next_directory

# Summary
echo -e "${BOLD}${BLUE}📊 Diagnostic Summary:${NC}"
echo -e "   Port conflicts: ${RED}$port_issues${NC}"
echo -e "   Next.js processes: ${RED}$nextjs_issues${NC}"
echo -e "   Environment issues: ${RED}$env_issues${NC}"
echo ""

if [ $port_issues -gt 0 ] || [ $nextjs_issues -gt 0 ] || [ $env_issues -gt 0 ]; then
    echo -e "${RED}❌ Issues detected!${NC}"
    echo ""
    suggest_solutions
else
    echo -e "${GREEN}✅ Everything looks good!${NC}"
    echo ""
    echo -e "${CYAN}Ready to start development:${NC}"
    echo -e "   npm run dev:clean"
fi 