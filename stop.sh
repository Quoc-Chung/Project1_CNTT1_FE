#!/bin/bash

# ===============================
# Stop Script for Next.js App
# ===============================

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Stopping Next.js Commerce App${NC}"
echo -e "${YELLOW}========================================${NC}"

# Check if container is running
if [ ! "$(docker ps -q -f name=nextjs-commerce)" ]; then
    echo -e "${YELLOW}Container is not running!${NC}"
    exit 0
fi

# Stop containers
echo -e "${YELLOW}[1/2] Stopping Docker containers...${NC}"
docker-compose down

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Application stopped successfully!${NC}"
echo -e "${GREEN}========================================${NC}"

# Optional: Show stopped containers
echo -e "${YELLOW}[2/2] Container status:${NC}"
docker ps -a -f name=nextjs-commerce --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
