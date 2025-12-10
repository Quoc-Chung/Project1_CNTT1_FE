#!/bin/bash

# ===============================
# Logs Script for Next.js App
# ===============================

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Viewing Application Logs${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if container is running
if [ ! "$(docker ps -q -f name=nextjs-commerce)" ]; then
    echo -e "${YELLOW}Container is not running!${NC}"
    echo -e "${YELLOW}Start it with: ${NC}${GREEN}./start.sh${NC}"
    exit 1
fi

# Show logs with follow
echo -e "${YELLOW}Following logs (Press Ctrl+C to exit)...${NC}"
echo ""
docker-compose logs -f --tail=100
