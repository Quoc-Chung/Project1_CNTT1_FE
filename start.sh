#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Starting Next.js Commerce App${NC}"
echo -e "${YELLOW}========================================${NC}"

if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Docker is not running!${NC}"
  exit 1
fi

if [ "$(docker ps -q -f name=nextjs-commerce)" ]; then
  echo -e "${YELLOW}Container already running!${NC}"
  exit 0
fi

echo -e "${YELLOW}[1/2] Starting containers...${NC}"
docker compose up -d

echo -e "${YELLOW}[2/2] Waiting for app...${NC}"
sleep 5

if [ "$(docker ps -q -f name=nextjs-commerce)" ]; then
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}  App STARTED SUCCESSFULLY${NC}"
  echo -e "${GREEN}========================================${NC}"
  echo -e "${BLUE}Access:${NC} ${GREEN}http://SERVER_IP:30_
