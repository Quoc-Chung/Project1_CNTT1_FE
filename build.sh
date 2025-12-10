#!/bin/bash

# ===============================
# Build Script for Next.js App
# ===============================

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Building Next.js Commerce App${NC}"
echo -e "${YELLOW}========================================${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed!${NC}"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed!${NC}"
    exit 1
fi

# Stop existing containers
echo -e "${YELLOW}[1/4] Stopping existing containers...${NC}"
docker-compose down 2>/dev/null || true

# Remove old images (optional - uncomment if needed)
# echo -e "${YELLOW}[2/4] Removing old images...${NC}"
# docker rmi nextjs-commerce 2>/dev/null || true

# Build new image
echo -e "${YELLOW}[2/4] Building Docker image...${NC}"
docker-compose build --no-cache

# Prune unused images to save space
echo -e "${YELLOW}[3/4] Cleaning up unused Docker images...${NC}"
docker image prune -f

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Build completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${YELLOW}[4/4] To start the app, run: ${NC}${GREEN}./start.sh${NC}"
