#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Building Next.js Commerce App${NC}"
echo -e "${YELLOW}========================================${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
  echo -e "${RED}Docker is not installed!${NC}"
  exit 1
fi

# Check Docker Compose V2
if ! docker compose version &> /dev/null; then
  echo -e "${RED}Docker Compose V2 is not installed!${NC}"
  exit 1
fi

echo -e "${YELLOW}[1/3] Stopping old containers...${NC}"
docker compose down || true

echo -e "${YELLOW}[2/3] Building image...${NC}"
docker compose build --no-cache

echo -e "${YELLOW}[3/3] Cleaning unused images...${NC}"
docker image prune -f

echo -e "${GREEN}================================
