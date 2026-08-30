#!/bin/bash
# scripts/verify-deployment.sh
# Deployment verification script for SIT environment
# Usage: ./scripts/verify-deployment.sh

set -e

echo "🔍 Verifying SIT Deployment..."

# Define colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ "$1" = "success" ]; then
        echo -e "${GREEN}✅ $2${NC}"
    elif [ "$1" = "warning" ]; then
        echo -e "${YELLOW}⚠️  $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Function to check if a service is running
check_service() {
    local service=$1
    local running=$(docker-compose -f docker-compose.sit.yml ps --services --filter "status=running" 2>/dev/null || echo "")
    
    if echo "$running" | grep -q "^${service}$"; then
        print_status "success" "$service is running"
        return 0
    else
        print_status "error" "$service is NOT running"
        return 1
    fi
}

# Function to test HTTP endpoint
test_endpoint() {
    local url=$1
    local name=$2
    local expected_code=${3:-200}
    
    local response_code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$url" 2>/dev/null || echo "FAILED")
    
    if [ "$response_code" = "$expected_code" ] || [ "$response_code" = "304" ]; then
        print_status "success" "$name: HTTP $response_code"
        return 0
    elif [ "$response_code" = "FAILED" ]; then
        print_status "error" "$name: Connection failed"
        return 1
    else
        print_status "warning" "$name: HTTP $response_code (expected $expected_code)"
        return 1
    fi
}

# Function to test database connection
test_database() {
    local container=$1
    local command="mysql -uroot -pRootPass123! -e \"SELECT 1\""
    
    if docker exec "$container" sh -c "$command" >/dev/null 2>&1; then
        print_status "success" "Database connection successful"
        return 0
    else
        print_status "error" "Database connection failed"
        return 1
    fi
}

# Function to check environment variables
check_env_vars() {
    local missing_vars=()
    local required_vars=("DEEPSEEK_API_KEY" "DB_HOST" "DB_PORT" "DB_NAME" "DB_PASSWORD")
    
    if [ ! -f ".env.sit" ]; then
        print_status "error" "Environment file .env.sit not found"
        return 1
    fi
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" .env.sit; then
            missing_vars+=("$var")
        fi
    done
    
    # Check for either DB_USER or DB_USERNAME
    if ! grep -q "^DB_USER=" .env.sit && ! grep -q "^DB_USERNAME=" .env.sit; then
        missing_vars+=("DB_USER or DB_USERNAME")
    fi
    
    if [ ${#missing_vars[@]} -eq 0 ]; then
        print_status "success" "All required environment variables present"
        return 0
    else
        print_status "error" "Missing environment variables: ${missing_vars[*]}"
        return 1
    fi
}

# Main verification process
echo ""
echo "📋 Checking environment configuration..."
check_env_vars

echo ""
echo "🐳 Checking Docker containers..."
ALL_SERVICES="db backend frontend"
ALL_RUNNING=true

for service in $ALL_SERVICES; do
    if ! check_service "$service"; then
        ALL_RUNNING=false
    fi
done

if [ "$ALL_RUNNING" = false ]; then
    echo ""
    print_status "warning" "Some services are not running. Trying to start them..."
    docker-compose -f docker-compose.sit.yml up -d
    sleep 10
    
    # Check again after restart attempt
    ALL_RUNNING=true
    for service in $ALL_SERVICES; do
        if ! check_service "$service"; then
            ALL_RUNNING=false
        fi
    done
fi

echo ""
echo "🌐 Testing service connectivity..."

# Test backend health
if check_service "backend"; then
    test_endpoint "http://localhost:8080/actuator/health" "Backend health check"
fi

# Test frontend
if check_service "frontend"; then
    test_endpoint "http://localhost:3000" "Frontend accessibility" "200"
fi

# Test database
if check_service "db"; then
    test_database "profile-mysql-sit"
fi

echo ""
echo "📊 Checking container resource usage..."
docker-compose -f docker-compose.sit.yml ps

echo ""
echo "📝 Checking recent logs for errors..."
echo "--- Backend logs (last 5 lines) ---"
docker-compose -f docker-compose.sit.yml logs --tail=5 backend 2>/dev/null || echo "No backend logs available"

echo ""
echo "--- Frontend logs (last 5 lines) ---"
docker-compose -f docker-compose.sit.yml logs --tail=5 frontend 2>/dev/null || echo "No frontend logs available"

echo ""
echo "--- Database logs (last 5 lines) ---"
docker-compose -f docker-compose.sit.yml logs --tail=5 db 2>/dev/null || echo "No database logs available"

echo ""
echo "🎯 Summary:"
echo ""
echo "📱 Access Points:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8080"
echo "   Swagger UI: http://localhost:8080/swagger-ui.html"
echo "   Actuator: http://localhost:8080/actuator"
echo ""
echo "🔧 Troubleshooting Commands:"
echo "   View all logs: docker-compose -f docker-compose.sit.yml logs -f"
echo "   Restart services: docker-compose -f docker-compose.sit.yml restart"
echo "   Rebuild and deploy: ./scripts/deploy-sit.sh"
echo "   Check container status: docker-compose -f docker-compose.sit.yml ps"
echo ""

if [ "$ALL_RUNNING" = true ]; then
    print_status "success" "All deployment checks passed!"
    echo ""
    echo "🎉 Deployment verified successfully!"
    exit 0
else
    print_status "error" "Deployment verification failed. Some services are not running correctly."
    echo ""
    echo "💡 Troubleshooting steps:"
    echo "   1. Check Docker logs: docker-compose -f docker-compose.sit.yml logs"
    echo "   2. Verify environment variables in .env.sit"
    echo "   3. Check port availability (3000, 8080, 3307)"
    echo "   4. Try rebuilding: docker-compose -f docker-compose.sit.yml build --no-cache"
    exit 1
fi