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
Usage: ./rollback.sh <environment> <version>

Rolls back ZenithStore application to a previous version.

Arguments:
  environment    Target environment (dev|staging|prod)
  version        Version tag to rollback to (e.g., v1.2.2)

Examples:
  ./rollback.sh staging v1.0.0
  ./rollback.sh prod v1.2.2

EOF
    exit 1
}

# Check arguments
if [ $# -lt 2 ]; then
    print_error "Missing required arguments"
    usage
fi

ENV=$1
VERSION=$2

# Validate environment
if [[ ! "$ENV" =~ ^(dev|staging|prod)$ ]]; then
    print_error "Invalid environment: $ENV"
    exit 1
fi

print_warning "╔═══════════════════════════════════════╗"
print_warning "║   ZenithStore Rollback Script        ║"
print_warning "╚═══════════════════════════════════════╝"
print_warning "Environment: $ENV"
print_warning "Rolling back to: $VERSION"
print_warning ""

# Confirmation prompt
if [ "$ENV" == "prod" ]; then
    read -p "Are you sure you want to rollback PRODUCTION to $VERSION? (yes/no): " CONFIRM
    if [ "$CONFIRM" != "yes" ]; then
        print_info "Rollback cancelled"
        exit 0
    fi
fi

# Navigate to project root
cd "$PROJECT_ROOT"

# Check if version exists
if ! docker images | grep -q "zenithstore.*$VERSION"; then
    print_error "Version $VERSION not found in local images"
    print_info "Available versions:"
    docker images | grep zenithstore
    exit 1
fi

print_info "Stopping current deployment..."
docker-compose -f docker-compose.$ENV.yml down

print_info "Deploying version $VERSION..."
docker tag zenithstore:$VERSION zenithstore:$ENV
docker-compose -f docker-compose.$ENV.yml up -d

# Wait for health check
print_info "Waiting for application to be healthy..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        print_info "✓ Rollback successful!"
        break
    fi

    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        print_error "Health check failed after rollback"
        docker-compose -f docker-compose.$ENV.yml logs app
        exit 1
    fi

    echo -n "."
    sleep 2
done

echo ""
print_info ""
print_info "Rollback completed successfully to version $VERSION"
print_info "Application: http://localhost:3000"
print_info ""
