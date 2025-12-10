#!/bin/bash

# ===============================
# Start Script for Next.js App
# ===============================

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Starting Next.js Commerce App${NC}"
echo -e "${YELLOW}========================================${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running!${NC}"
    exit 1
fi

# Check if container is already running
if [ "$(docker ps -q -f name=nextjs-commerce)" ]; then
    echo -e "${YELLOW}Container is already running!${NC}"
    echo -e "${BLUE}To restart, run: ${NC}${GREEN}./stop.sh && ./start.sh${NC}"
    exit 0
fi

# Start containers
echo -e "${YELLOW}[1/2] Starting Docker containers...${NC}"
docker-compose up -d

# Wait for container to be healthy
echo -e "${YELLOW}[2/2] Waiting for application to be ready...${NC}"
sleep 5

# Check if container is running
if [ "$(docker ps -q -f name=nextjs-commerce)" ]; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  Application started successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "${BLUE}Access the app at: ${NC}${GREEN}http://localhost:3000${NC}"
    echo -e "${BLUE}View logs: ${NC}${GREEN}docker-compose logs -f${NC}"
    echo -e "${BLUE}Stop the app: ${NC}${GREEN}./stop.sh${NC}"
else
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}  Failed to start application!${NC}"
    echo -e "${RED}========================================${NC}"
    echo -e "${YELLOW}Check logs with: ${NC}${GREEN}docker-compose logs${NC}"
    exit 1
fi
