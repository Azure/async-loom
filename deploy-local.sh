#!/bin/bash

# Local deployment script for async-loom
# This script builds and runs all components locally using Docker

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed. Please install it first."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose is not installed. Please install it first."
    exit 1
fi

log_info "Starting local deployment for async-loom..."

# Stop any existing containers
log_info "Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Build all images
log_info "Building Docker images..."
docker build -t asyncloom-backend:latest ./backend
docker build -t asyncloom-frontend:latest --build-arg VITE_API_URL=http://localhost:8000 ./frontend
docker build -t asyncloom-copilot-extension:latest ./copilot-extension
docker build -t asyncloom-teams-sdk:latest ./teams-v2-sdk

# Create docker-compose.yml
cat > docker-compose.yml << EOF
version: '3.8'

services:
  backend:
    image: asyncloom-backend:latest
    container_name: asyncloom-backend
    ports:
      - "8000:8000"
    environment:
      - PORT=8000
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  frontend:
    image: asyncloom-frontend:latest
    container_name: asyncloom-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  copilot-extension:
    image: asyncloom-copilot-extension:latest
    container_name: asyncloom-copilot-extension
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - BACKEND_URL=http://backend:8000
    depends_on:
      - backend
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  teams-sdk:
    image: asyncloom-teams-sdk:latest
    container_name: asyncloom-teams-sdk
    ports:
      - "3978:3978"
    environment:
      - PORT=3978
      - BACKEND_URL=http://backend:8000
    depends_on:
      - backend
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3978/"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

networks:
  default:
    driver: bridge
EOF

# Start the application
log_info "Starting application with Docker Compose..."
docker-compose up -d

# Wait for services to be ready
log_info "Waiting for services to be ready..."
sleep 15

# Check health of all services
log_info "Checking service health..."
services=("backend:8000/healthz" "copilot-extension:3000/health" "teams-sdk:3978/")

for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    endpoint=$(echo $service | cut -d: -f2-3)
    
    if curl -s -f "http://localhost:$endpoint" > /dev/null; then
        log_success "$name is healthy"
    else
        log_warning "$name health check failed"
    fi
done

log_success "Local deployment completed!"
echo ""
echo "=== APPLICATION URLS ==="
echo "Frontend: http://localhost"
echo "Backend: http://localhost:8000"
echo "Backend Health: http://localhost:8000/healthz"
echo "Copilot Extension: http://localhost:3000"
echo "Copilot Extension Health: http://localhost:3000/health"
echo "Teams SDK: http://localhost:3978"
echo ""
echo "=== USEFUL COMMANDS ==="
echo "View logs: docker-compose logs -f [service-name]"
echo "Stop all services: docker-compose down"
echo "Restart a service: docker-compose restart [service-name]"
echo "View running containers: docker-compose ps"
echo ""
log_success "Local deployment script completed!" 