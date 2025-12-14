#!/bin/bash
set -e

# ===============================
# Colors
# ===============================
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Starting Next.js Commerce App${NC}"
echo -e "${YELLOW}========================================${NC}"

# ===============================
# Check Docker
# ===============================
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Error: Docker is not running!${NC}"
  exit 1
fi

# ===============================
# Check running container
# ===============================
if [ "$(docker ps -q -f name=nextjs-commerce)" ]; then
  echo -e "${YELLOW}Container already running!${NC}"
  echo -e "${BLUE}Stop it first:${NC} ${GREEN}./stop.sh${NC}"
  exit 0
fi

# ===============================
# Start containers
# ===============================
echo -e "${YELLOW}[1/2] Starting Docker containers...${NC}"
docker compose up -d

# ===============================
# Wait for app
# ===============================
echo -e "${YELLOW}[2/2] Waiting for application...${NC}"
sleep 5

# ===============================
# Verify
# ===============================
if [ "$(docker ps -q -f name=nextjs-commerce)" ]; then
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}  Application STARTED SUCCESSFULLY 🚀${NC}"
  echo -e "${GREEN}========================================${NC}"
  echo -e "${BLUE}Access:${NC} ${GREEN}http://SERVER_IP:3000${NC}"
  echo -e "${BLUE}View logs:${NC} ${GREEN}docker compose logs -f${NC}"
  echo -e "${BLUE}Stop app:${NC} ${GREEN}./stop.sh${NC}"
else
  echo -e "${RED}========================================${NC}"
  echo -e "${RED}  Application FAILED TO START${NC}"
  echo -e "${RED}========================================${NC}"
  echo -e "${YELLOW}Check logs:${NC} ${GREEN}docker compose logs${NC}"
  exit 1
fi
