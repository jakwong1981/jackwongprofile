#!/bin/bash
# scripts/deploy-and-verify.sh
# Complete deployment and verification script for SIT environment
# Usage: ./scripts/deploy-and-verify.sh

set -e

echo "🚀 Starting SIT Deployment Process..."
echo ""

# Check if .env.sit exists
if [ ! -f ".env.sit" ]; then
    echo "❌ Error: .env.sit file not found!"
    echo "   Please create .env.sit from .env.sit.example"
    exit 1
fi

# Step 1: Clean previous deployment
echo "🧹 Step 1: Cleaning previous deployment..."
docker-compose -f docker-compose.sit.yml down --volumes --remove-orphans 2>/dev/null || true
docker network prune -f 2>/dev/null || true
echo "✅ Cleanup completed"

# Step 2: Build services
echo ""
echo "🔨 Step 2: Building services..."
docker-compose --env-file .env.sit -f docker-compose.sit.yml build --no-cache

# Step 3: Start services
echo ""
echo "🚢 Step 3: Starting services..."
docker-compose --env-file .env.sit -f docker-compose.sit.yml up -d

# Wait for services to start
echo ""
echo "⏳ Waiting for services to initialize..."
sleep 15

# Step 4: Check service status
echo ""
echo "📊 Step 4: Checking service status..."
docker-compose -f docker-compose.sit.yml ps

# Step 5: Run verification
echo ""
echo "🔍 Step 5: Running deployment verification..."
./scripts/verify-deployment.sh

# Final status
echo ""
echo "📈 Deployment Process Complete!"
echo ""
echo "💡 Next steps:"
echo "   1. Monitor logs: docker-compose -f docker-compose.sit.yml logs -f"
echo "   2. Test the application at http://localhost:3000"
echo "   3. Verify API endpoints at http://localhost:8080/swagger-ui.html"
echo "   4. Check AI news aggregation functionality"
echo ""
echo "🔗 Quick Access Links:"
echo "   • Frontend: http://localhost:3000"
echo "   • Backend API: http://localhost:8080"
echo "   • Swagger UI: http://localhost:8080/swagger-ui.html"
echo "   • Database Admin: Use MySQL client on port 3307"
echo ""
echo "🎉 Deployment completed successfully!"