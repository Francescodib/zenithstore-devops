#!/bin/bash

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT/app"

print_info "╔═══════════════════════════════════════╗"
print_info "║   Running ZenithStore Tests          ║"
print_info "╚═══════════════════════════════════════╝"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_info "Installing dependencies..."
    npm install
fi

# Run tests
print_info "Executing test suite..."
npm test

print_info ""
print_info "✓ All tests passed!"
print_info ""
