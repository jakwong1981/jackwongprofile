#!/bin/bash
# restart-app.sh - Smart restart script for frontend changes without full rebuild
# Part of Enhancements v1: Quick restart for development testing

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script metadata
SCRIPT_NAME="restart-app.sh"
SCRIPT_VERSION="1.0.0"
SCRIPT_DESC="Smart restart script for frontend changes without full rebuild"

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  $SCRIPT_NAME - v$SCRIPT_VERSION${NC}"
    echo -e "${BLUE}  $SCRIPT_DESC${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop first."
        exit 1
    fi
    print_success "Docker is running"
}

# Check if services are running
check_services() {
    print_info "Checking running services..."
    
    if docker-compose -f docker-compose.sit.yml ps --services --filter "status=running" | grep -q "frontend"; then
        print_success "Frontend service is running"
        FRONTEND_RUNNING=true
    else
        print_warning "Frontend service is not running"
        FRONTEND_RUNNING=false
    fi
    
    if docker-compose -f docker-compose.sit.yml ps --services --filter "status=running" | grep -q "backend"; then
        print_success "Backend service is running"
        BACKEND_RUNNING=true
    else
        print_warning "Backend service is not running"
        BACKEND_RUNNING=false
    fi
    
    if docker-compose -f docker-compose.sit.yml ps --services --filter "status=running" | grep -q "mysql"; then
        print_success "MySQL service is running"
        MYSQL_RUNNING=true
    else
        print_warning "MySQL service is not running"
        MYSQL_RUNNING=false
    fi
}

# Smart restart function
smart_restart() {
    print_info "Performing smart restart..."
    
    # Only restart frontend if it's running
    if [ "$FRONTEND_RUNNING" = true ]; then
        print_info "Rebuilding and restarting frontend service..."
        docker-compose -f docker-compose.sit.yml up -d --build frontend
        
        # Wait for frontend to be ready
        print_info "Waiting for frontend to be ready..."
        local max_attempts=30
        local attempt=1
        
        while [ $attempt -le $max_attempts ]; do
            if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
                print_success "Frontend is ready and responding"
                break
            fi
            
            if [ $attempt -eq $max_attempts ]; then
                print_warning "Frontend taking longer than expected to start..."
            fi
            
            echo -n "."
            sleep 2
            ((attempt++))
        done
    else
        print_warning "Frontend is not running. Starting full deployment..."
        ./scripts/deploy-sit.sh
    fi
}

# Quick health check
quick_health_check() {
    print_info "Performing quick health check..."
    
    # Check frontend
    if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend is accessible at http://localhost:3000"
    else
        print_error "Frontend is not accessible"
    fi
    
    # Check backend API
    if curl -s -f http://localhost:8080/api/v1/public/profile > /dev/null 2>&1; then
        print_success "Backend API is accessible at http://localhost:8080/api/v1/public/profile"
    else
        print_error "Backend API is not accessible"
    fi
}

# Main execution
main() {
    print_header
    
    # Check prerequisites
    check_docker
    check_services
    
    echo ""
    print_info "Current status:"
    echo "  Frontend running: $FRONTEND_RUNNING"
    echo "  Backend running: $BACKEND_RUNNING"
    echo "  MySQL running: $MYSQL_RUNNING"
    echo ""
    
    # Only restart if at least frontend is running
    if [ "$FRONTEND_RUNNING" = false ] && [ "$BACKEND_RUNNING" = false ] && [ "$MYSQL_RUNNING" = false ]; then
        print_warning "No services are running. Starting full deployment..."
        ./scripts/deploy-sit.sh
    else
        # Perform smart restart
        smart_restart
        
        # Quick health check
        quick_health_check
        
        echo ""
        print_success "Smart restart completed successfully!"
        print_info "Frontend: http://localhost:3000"
        print_info "Backend API: http://localhost:8080/api/v1"
        print_info "Admin login: http://localhost:3000/admin/login"
    fi
}

# Handle script termination
cleanup() {
    print_info "Script terminated"
    exit 0
}

# Set up trap for script termination
trap cleanup EXIT INT TERM

# Execute main function
main