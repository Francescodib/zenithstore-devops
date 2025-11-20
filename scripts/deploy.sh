#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Function to print colored messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to display usage
usage() {
    cat << EOF
Usage: ./deploy.sh <environment> [version]

Deploys ZenithStore application to specified environment.

Arguments:
  environment    Target environment (dev|staging|prod)
  version        Optional: specific version tag (e.g., v1.2.3)

Examples:
  ./deploy.sh dev
  ./deploy.sh staging v1.0.0
  ./deploy.sh prod v1.2.3

EOF
    exit 1
}

# Check arguments
if [ $# -lt 1 ]; then
    print_error "Missing environment argument"
    usage
fi

ENV=$1
VERSION=${2:-latest}

# Validate environment
if [[ ! "$ENV" =~ ^(dev|staging|prod)$ ]]; then
    print_error "Invalid environment: $ENV"
    print_info "Valid environments: dev, staging, prod"
    exit 1
fi

print_info "╔═══════════════════════════════════════╗"
print_info "║   ZenithStore Deployment Script      ║"
print_info "╚═══════════════════════════════════════╝"
print_info "Environment: $ENV"
print_info "Version: $VERSION"
print_info ""

# Navigate to project root
cd "$PROJECT_ROOT"

# Load environment file
ENV_FILE="./environments/.env.$ENV"
if [ ! -f "$ENV_FILE" ]; then
    print_error "Environment file not found: $ENV_FILE"
    exit 1
fi

print_info "Loading environment configuration..."
set -a
source "$ENV_FILE"
set +a

# Stop existing containers
print_info "Stopping existing containers..."
docker-compose -f docker-compose.$ENV.yml down || true

# Build new image
print_info "Building Docker image..."
docker-compose -f docker-compose.$ENV.yml build

# Tag image if version specified
if [ "$VERSION" != "latest" ]; then
    print_info "Tagging image with version: $VERSION"
    docker tag zenithstore:$ENV zenithstore:$VERSION
fi

# Start containers
print_info "Starting containers..."
docker-compose -f docker-compose.$ENV.yml up -d

# Wait for health check
print_info "Waiting for application to be healthy..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        print_info "✓ Application is healthy!"
        break
    fi

    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        print_error "Health check failed after $MAX_RETRIES attempts"
        print_info "Checking logs..."
        docker-compose -f docker-compose.$ENV.yml logs app
        exit 1
    fi

    echo -n "."
    sleep 2
done

echo ""

# Display deployment info
print_info ""
print_info "╔═══════════════════════════════════════╗"
print_info "║   Deployment Successful!              ║"
print_info "╚═══════════════════════════════════════╝"
print_info ""
print_info "Application:  http://localhost:3000"
print_info "Health Check: http://localhost:3000/api/health"
print_info "Metrics:      http://localhost:3000/metrics"
print_info "Prometheus:   http://localhost:9090"
print_info "Grafana:      http://localhost:3001"
print_info ""
print_info "View logs:    docker-compose -f docker-compose.$ENV.yml logs -f"
print_info "Stop:         docker-compose -f docker-compose.$ENV.yml down"
print_info ""
