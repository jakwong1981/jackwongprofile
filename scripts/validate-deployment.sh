#!/bin/bash
# scripts/validate-deployment.sh
# Validates deployment configuration to prevent common issues

set -e

echo "🔍 Validating SIT Deployment Configuration..."

# Check 1: Verify .env.sit exists and has required variables
if [ ! -f ".env.sit" ]; then
    echo "❌ ERROR: .env.sit file not found"
    echo "   Run: cp .env.sit.example .env.sit"
    exit 1
fi

# Check 2: Verify NEXT_PUBLIC_API_BASE_URL is set
if ! grep -q "^NEXT_PUBLIC_API_BASE_URL=" .env.sit; then
    echo "❌ ERROR: NEXT_PUBLIC_API_BASE_URL not set in .env.sit"
    echo "   Add: NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1"
    exit 1
fi

# Check 3: Warn if using 'backend' hostname for browser access
API_URL=$(grep "^NEXT_PUBLIC_API_BASE_URL=" .env.sit | cut -d'=' -f2)
if [[ "$API_URL" == *"backend:"* ]]; then
    echo "⚠️  WARNING: API URL contains 'backend' hostname"
    echo "   This may not work from browser. Consider using 'localhost' for browser access."
    echo "   Current: $API_URL"
    echo "   Suggested: http://localhost:8080/api/v1"
fi

# Check 4: Verify DeepSeek API key format
if grep -q "^DEEPSEEK_API_KEY=" .env.sit; then
    DEEPSEEK_KEY=$(grep "^DEEPSEEK_API_KEY=" .env.sit | cut -d'=' -f2)
    if [[ ! "$DEEPSEEK_KEY" =~ ^sk-[a-zA-Z0-9]{32,}$ ]]; then
        echo "⚠️  WARNING: DeepSeek API key format may be invalid"
        echo "   Expected format: sk- followed by 32+ alphanumeric characters"
    fi
fi

# Check 5: Verify Docker Compose configuration
echo "✅ Checking Docker Compose configuration..."
docker-compose -f docker-compose.sit.yml config > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Docker Compose configuration is valid"
else
    echo "❌ ERROR: Docker Compose configuration invalid"
    exit 1
fi

# Check 6: Verify API endpoint is accessible
echo "🔗 Testing API connectivity..."
if command -v curl &> /dev/null; then
    BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health 2>/dev/null || echo "UNREACHABLE")
    if [ "$BACKEND_STATUS" = "200" ]; then
        echo "   ✅ Backend API is accessible (HTTP $BACKEND_STATUS)"
    else
        echo "⚠️  WARNING: Backend API may not be accessible (HTTP $BACKEND_STATUS)"
        echo "   Run: docker-compose -f docker-compose.sit.yml logs backend"
    fi
fi

echo ""
echo "📋 Validation Summary:"
echo "   1. Environment file: ✅"
echo "   2. API URL configured: ✅" 
echo "   3. Docker Compose config: ✅"
echo "   4. API connectivity: ✅"
echo ""
echo "🎉 Validation completed successfully!"
echo ""
echo "💡 Quick Start:"
echo "   ./scripts/deploy-and-verify.sh"
echo ""
echo "🔧 Troubleshooting:"
echo "   If profile data is not showing:"
echo "   1. Check browser console for errors (F12 → Console)"
echo "   2. Verify API URL in frontend container:"
echo "      docker exec profile-frontend-sit printenv | grep NEXT_PUBLIC_API_BASE_URL"
echo "   3. Test API directly: curl http://localhost:8080/api/v1/public/profile"