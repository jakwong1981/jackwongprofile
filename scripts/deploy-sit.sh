#!/bin/bash

# Jack Wong Profile System - SIT Deployment Script
# This script deploys the complete profile management system in a SIT environment

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 Starting SIT Deployment for Jack Wong Profile System"
echo "========================================================"
echo "Project Root: $PROJECT_ROOT"
echo ""

# Load environment variables
ENV_FILE="$PROJECT_ROOT/.env.sit"
if [ -f "$ENV_FILE" ]; then
    echo "✅ Loading environment variables from $ENV_FILE"
    # Source the environment file
    set -a
    source "$ENV_FILE"
    set +a
else
    echo "⚠️  Warning: $ENV_FILE not found"
    echo "Using default environment variables"
    
    # Set defaults
    export DB_HOST="db"
    export DB_PORT=3306
    export DB_NAME="profile_db"
    export DB_USER="profile_user"
    export DB_PASSWORD="ProfilePass123!"
    export SPRING_PROFILES_ACTIVE="docker"
    export DEEPSEEK_API_KEY="your-deepseek-api-key-here"
    export NEXT_PUBLIC_API_BASE_URL="http://localhost:8080/api/v1"
    export API_INTERNAL_BASE_URL="http://backend:8080/api/v1"
fi

# Build Docker images
echo ""
echo "🔨 Building Docker images..."
cd "$PROJECT_ROOT"

echo "   Building backend image..."
docker build -f Dockerfile.backend -t jackwongprofile-backend:1.0.0 .

echo "   Building frontend image..."
docker build -f Dockerfile.frontend -t jackwongprofile-frontend:1.0.0 .

# Start services using docker-compose
echo ""
echo "🚀 Starting services with docker-compose..."
docker-compose -f docker-compose.sit.yml down 2>/dev/null || true
docker-compose -f docker-compose.sit.yml up -d

echo ""
echo "⏳ Waiting for services to be healthy..."

# Wait for MySQL
echo "📊 Waiting for MySQL to be ready..."
MAX_WAIT=60
WAITED=0
while ! docker-compose -f docker-compose.sit.yml exec -T mysql mysqladmin ping -h"127.0.0.1" -uroot -p"${DB_ROOT_PASSWORD:-RootPass123!}" --silent 2>/dev/null; do
    sleep 2
    WAITED=$((WAITED + 2))
    if [ $WAITED -ge $MAX_WAIT ]; then
        echo "❌ MySQL did not become ready within $MAX_WAIT seconds"
        docker-compose -f docker-compose.sit.yml logs mysql
        exit 1
    fi
    echo -n "."
done
echo ""
echo "✅ MySQL is ready"

# Initialize database
echo ""
echo "🗄️  Initializing database..."
if [ -f "$PROJECT_ROOT/docker/mysql/init.sql" ]; then
    echo "   Running database initialization script..."
    docker-compose -f docker-compose.sit.yml exec -T mysql mysql -uroot -p"${DB_ROOT_PASSWORD:-RootPass123!}" jackwong_profile < "$PROJECT_ROOT/docker/mysql/init.sql"
    echo "✅ Database initialized"
else
    echo "⚠️  No database initialization script found at docker/mysql/init.sql"
fi

# Wait for Backend API (using updated health check)
echo ""
echo "⚙️  Waiting for Backend API..."
MAX_WAIT=90
WAITED=0
while ! curl -s -f "http://localhost:8080/api/v1/public/profile" > /dev/null 2>&1; do
    sleep 2
    WAITED=$((WAITED + 2))
    if [ $WAITED -ge $MAX_WAIT ]; then
        echo "❌ Backend API did not become ready within $MAX_WAIT seconds"
        docker-compose -f docker-compose.sit.yml logs backend
        exit 1
    fi
    echo -n "."
done
echo ""
echo "✅ Backend API is ready (tested actual API endpoint)"

# Wait for Frontend
echo ""
echo "🎨 Waiting for Frontend..."
MAX_WAIT=60
WAITED=0
while ! curl -s -f "http://localhost:3000" > /dev/null 2>&1; do
    sleep 2
    WAITED=$((WAITED + 2))
    if [ $WAITED -ge $MAX_WAIT ]; then
        echo "❌ Frontend did not become ready within $MAX_WAIT seconds"
        docker-compose -f docker-compose.sit.yml logs frontend
        exit 1
    fi
    echo -n "."
done
echo ""
echo "✅ Frontend is ready"

# Run validation script
echo ""
echo "🔍 Running deployment validation..."
if [ -f "$SCRIPT_DIR/validate-deployment.sh" ]; then
    bash "$SCRIPT_DIR/validate-deployment.sh"
else
    echo "⚠️  Validation script not found, skipping validation"
fi

echo ""
echo "========================================================"
echo "🎉 Deployment Complete!"
echo ""
echo "📱 Access Points:"
echo "   Frontend Application:      http://localhost:3000"
echo "   Backend API:              http://localhost:8080"
echo "   API Documentation:        http://localhost:8080/api/v1"
echo "   Spring Boot Actuator:     http://localhost:8080/actuator"
echo "   MySQL Database:           localhost:3306"
echo "     Username: root"
echo "     Password: ${DB_ROOT_PASSWORD:-RootPass123!}"
echo ""
echo "👤 Default Admin Credentials:"
echo "   Username: admin"
echo "   Password: ${ADMIN_PASSWORD:-ChangeMe123!}"
echo ""
echo "🔧 Management Commands:"
echo "   View logs:                docker-compose -f docker-compose.sit.yml logs -f"
echo "   Check status:             docker-compose -f docker-compose.sit.yml ps"
echo "   Stop services:            docker-compose -f docker-compose.sit.yml down"
echo "   Restart services:         docker-compose -f docker-compose.sit.yml restart"
echo "   Rebuild and restart:      docker-compose -f docker-compose.sit.yml up -d --build"
echo "   Verify deployment:        ./scripts/verify-deployment.sh"
echo "   Full deployment:          ./scripts/deploy-and-verify.sh"
echo ""
echo "📝 Next Steps:"
echo "   1. Access the frontend at http://localhost:3000"
echo "   2. Login to admin panel with credentials above"
echo "   3. Configure your DeepSeek API key in .env.sit file"
echo "   4. Test news aggregation by visiting /admin/news"
echo ""
echo "⚠️  Important Notes:"
echo "   - The frontend uses dual API URLs:"
echo "     - Browser: $NEXT_PUBLIC_API_BASE_URL"
echo "     - SSR (Server-side): $API_INTERNAL_BASE_URL"
echo "   - Change default passwords in production"
echo "   - Configure proper SSL certificates"
echo "   - Set up firewall rules"
echo "   - Regular database backups"
echo ""
echo "========================================================"
echo "Deployment completed at: $(date)"
echo "Script version: 2.0.0 (Updated for improved health checks)"
