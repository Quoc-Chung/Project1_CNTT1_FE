#!/bin/bash

# ===============================
# Clean Script for Next.js App
# ===============================

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${RED}========================================${NC}"
echo -e "${RED}  Cleaning Docker Resources${NC}"
echo -e "${RED}========================================${NC}"

# Warning
echo -e "${YELLOW}This will remove:${NC}"
echo -e "  - Stopped containers"
echo -e "  - Unused images"
echo -e "  - Build cache"
echo ""
read -p "Are you sure? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Cancelled.${NC}"
    exit 0
fi

# Stop containers
echo -e "${YELLOW}[1/5] Stopping containers...${NC}"
docker-compose down 2>/dev/null || true

# Remove containers
echo -e "${YELLOW}[2/5] Removing containers...${NC}"
docker container prune -f

# Remove images
echo -e "${YELLOW}[3/5] Removing unused images...${NC}"
docker image prune -a -f

# Remove volumes (optional - commented out by default)
# echo -e "${YELLOW}[4/5] Removing volumes...${NC}"
# docker volume prune -f

# Remove build cache
echo -e "${YELLOW}[4/5] Removing build cache...${NC}"
docker builder prune -f

# Show disk usage
echo -e "${YELLOW}[5/5] Docker disk usage:${NC}"
docker system df

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Cleanup completed!${NC}"
echo -e "${GREEN}========================================${NC}"
