# Deployment Guide: Jack Wong Personal Profile Management System

## 📋 Overview

This guide provides comprehensive instructions for deploying the personal profile management system in various environments. The system supports local development, SIT (System Integration Testing), and production deployments.

## 🚀 Quick Deployment Summary

### Local Development
```bash
# 1. Clone and setup
git clone https://github.com/quo8/jackwongprofile.git
cd jackwongprofile

# 2. Install dependencies
cd frontend && npm install
cd ../backend && ./mvnw clean compile

# 3. Configure environment
cp .env.local.example .env.local
# Edit .env.local with your settings

# 4. Start services
./scripts/start-local.sh
```

### SIT Environment (Docker)
```bash
# 1. Clone repository
git clone https://github.com/quo8/jackwongprofile.git
cd jackwongprofile

# 2. Build and deploy
./scripts/deploy-sit.sh
# OR
docker-compose -f docker-compose.sit.yml up -d --build
```

## 🐳 Docker Deployment

### Prerequisites
- Docker 20.10+ and Docker Compose 2.0+
- 2GB+ RAM available
- Ports 3000, 8080, 3306 available

### Directory Structure for Docker
```
jackwongprofile/
├── docker/
│   ├── mysql/
│   │   └── init.sql          # Database initialization
│   ├── nginx/
│   │   └── nginx.conf        # Reverse proxy config
│   └── .dockerignore         # Docker ignore patterns
├── Dockerfile.backend        # Backend Dockerfile
├── Dockerfile.frontend       # Frontend Dockerfile
├── docker-compose.sit.yml    # SIT environment compose
└── docker-compose.prod.yml   # Production compose
```

### SIT Environment (docker-compose.sit.yml)

#### Services Configuration:
1. **MySQL Database** (`db`):
   - Port: 3306 (container) → 3307 (host)
   - Persistent volume: `mysql_data_sit`
   - Initialization: `/docker/mysql/init.sql`

2. **Backend API** (`backend`):
   - Port: 8080
   - Depends on: `db`
   - Environment: `SPRING_PROFILES_ACTIVE=docker`
   - Health check: `/actuator/health`

3. **Frontend Application** (`frontend`):
   - Port: 3000
   - Depends on: `backend`
   - Build context: `./frontend`
   - Environment: `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1`

#### Quick Start SIT:
```bash
# Build and start all services
docker-compose -f docker-compose.sit.yml up -d --build

# View logs
docker-compose -f docker-compose.sit.yml logs -f

# Check service status
docker-compose -f docker-compose.sit.yml ps

# Stop services
docker-compose -f docker-compose.sit.yml down

# Stop and remove volumes
docker-compose -f docker-compose.sit.yml down -v
```

### Production Environment (docker-compose.prod.yml)

Production deployment includes additional components:

1. **Nginx Reverse Proxy**:
   - SSL termination
   - Load balancing
   - Static file serving

2. **Redis Cache**:
   - Session storage
   - News article caching

3. **Monitoring Stack**:
   - Prometheus metrics
   - Grafana dashboards

## 🔧 Manual Deployment Steps

### 1. Environment Preparation

#### Required Environment Variables
Create `.env.sit` file:
```bash
# Database
DB_HOST=db
DB_PORT=3306
DB_NAME=profile_db
DB_USER=profile_user
DB_PASSWORD=ProfilePass123!

# Backend
SPRING_PROFILES_ACTIVE=docker
SERVER_PORT=8080
JWT_SECRET=YourJwtSecretKeyHereChangeInProduction
JWT_EXPIRATION=86400000

# Frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_APP_NAME="Jack Wong Profile"
NEXT_PUBLIC_APP_VERSION=1.0.0

# DeepSeek API
DEEPSEEK_API_KEY=your-deepseek-api-key-here
DEEPSEEK_BASE_URL=https://api.deepseek.com

# News Sources
NEWS_RUNDOWN_AI_ENABLED=true
NEWS_TECHCRUNCH_AI_ENABLED=true
NEWS_MIT_TECH_REVIEW_ENABLED=true
NEWS_DEEPLEARNING_AI_ENABLED=true
NEWS_HUGGINGFACE_ENABLED=true
```

#### Database Setup
```bash
# Start MySQL container
docker run -d \
  --name profile-db \
  -e MYSQL_ROOT_PASSWORD=RootPass123! \
  -e MYSQL_DATABASE=profile_db \
  -e MYSQL_USER=profile_user \
  -e MYSQL_PASSWORD=ProfilePass123! \
  -p 3307:3306 \
  -v mysql_data_sit:/var/lib/mysql \
  mysql:8.0

# Initialize database
docker exec -i profile-db mysql -uroot -pRootPass123! profile_db < docker/mysql/init.sql
```

### 2. Backend Deployment

#### Build Backend Image
```bash
cd backend

# Build with Maven
./mvnw clean package -DskipTests

# Build Docker image
docker build -f ../Dockerfile.backend -t jackwongprofile-backend:1.0.0 .

# Run container
docker run -d \
  --name profile-backend \
  -p 8080:8080 \
  --env-file ../.env.sit \
  --network profile-network \
  jackwongprofile-backend:1.0.0
```

#### Backend Health Check
```bash
# Check if backend is running
curl http://localhost:8080/actuator/health

# Check API endpoints
curl http://localhost:8080/api/v1/public/profile

# View logs
docker logs profile-backend -f
```

### 3. Frontend Deployment

#### Build Frontend Image
```bash
cd frontend

# Build Next.js application
npm run build

# Build Docker image
docker build -f ../Dockerfile.frontend -t jackwongprofile-frontend:1.0.0 .

# Run container
docker run -d \
  --name profile-frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1 \
  --network profile-network \
  jackwongprofile-frontend:1.0.0
```

#### Frontend Verification
```bash
# Check if frontend is running
curl http://localhost:3000

# Access the application
# Open browser to: http://localhost:3000
```

## 📦 Deployment Scripts

### Main Deployment Script (`scripts/deploy-sit.sh`)

```bash
#!/bin/bash
# scripts/deploy-sit.sh

set -e  # Exit on error

echo "🚀 Starting SIT Deployment for Jack Wong Profile System"
echo "========================================================"

# Load environment variables
if [ -f .env.sit ]; then
    source .env.sit
    echo "✅ Loaded environment variables from .env.sit"
else
    echo "⚠️  Warning: .env.sit not found, using defaults"
fi

# Create network if not exists
if ! docker network ls | grep -q "profile-network"; then
    docker network create profile-network
    echo "✅ Created Docker network: profile-network"
fi

# Build and start services
echo ""
echo "🔨 Building Docker images..."
docker-compose -f docker-compose.sit.yml build

echo ""
echo "🚀 Starting services..."
docker-compose -f docker-compose.sit.yml up -d

echo ""
echo "⏳ Waiting for services to be healthy..."

# Wait for MySQL
echo "📊 Waiting for MySQL..."
while ! docker exec profile-db mysqladmin ping -h"127.0.0.1" -uroot -pRootPass123! --silent; do
    sleep 2
done
echo "✅ MySQL is ready"

# Wait for Backend
echo "⚙️  Waiting for Backend API..."
while ! curl -s http://localhost:8080/actuator/health > /dev/null; do
    sleep 2
done
echo "✅ Backend API is ready"

# Wait for Frontend
echo "🎨 Waiting for Frontend..."
while ! curl -s http://localhost:3000 > /dev/null; do
    sleep 2
done
echo "✅ Frontend is ready"

echo ""
echo "========================================================"
echo "🎉 Deployment Complete!"
echo ""
echo "📱 Access Points:"
echo "   Frontend:      http://localhost:3000"
echo "   Backend API:   http://localhost:8080"
echo "   MySQL Admin:   localhost:3307 (root/RootPass123!)"
echo "   Swagger UI:    http://localhost:8080/swagger-ui.html"
echo ""
echo "🔍 Quick Checks:"
echo "   View logs:     docker-compose -f docker-compose.sit.yml logs -f"
echo "   Check status:  docker-compose -f docker-compose.sit.yml ps"
echo "   Stop services: docker-compose -f docker-compose.sit.yml down"
echo ""
echo "👤 Default Admin Credentials:"
echo "   Username: admin"
echo "   Password: ChangeMe123!"
echo "========================================================"
```

### Additional Utility Scripts

#### Database Backup Script (`scripts/backup-db.sh`)
```bash
#!/bin/bash
# Backup database
docker exec profile-db mysqldump -uroot -pRootPass123! profile_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

#### Log Management Script (`scripts/logs.sh`)
```bash
#!/bin/bash
# View combined logs
docker-compose -f docker-compose.sit.yml logs -f --tail=100
```

#### Health Check Script (`scripts/health-check.sh`)
```bash
#!/bin/bash
# Comprehensive health check
curl -f http://localhost:8080/actuator/health || echo "Backend unhealthy"
curl -f http://localhost:3000 || echo "Frontend unhealthy"
docker exec profile-db mysqladmin ping -uroot -pRootPass123! || echo "MySQL unhealthy"
```

## 🧪 SIT Environment Verification

### Post-Deployment Validation

1. **Service Connectivity**:
```bash
# All services should respond
./scripts/health-check.sh
```

2. **API Endpoints**:
```bash
# Test public API
curl http://localhost:8080/api/v1/public/profile
curl http://localhost:8080/api/v1/public/news
```

3. **Database Integrity**:
```bash
# Verify database tables
docker exec profile-db mysql -uroot -pRootPass123! profile_db -e "SHOW TABLES;"
```

4. **Admin Access**:
```bash
# Test admin login (returns JWT token)
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"ChangeMe123!"}'
```

### Performance Testing
```bash
# Load test API endpoints
ab -n 1000 -c 10 http://localhost:8080/api/v1/public/profile

# Database connection test
docker exec profile-db mysqlslap -uroot -pRootPass123! --concurrency=10 --iterations=100 \
  --query="SELECT * FROM profiles WHERE published = 1"
```

## 🔄 Continuous Deployment

### GitHub Actions Pipeline

Example `.github/workflows/deploy-sit.yml`:
```yaml
name: Deploy to SIT

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
      
    - name: Login to Container Registry
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
        
    - name: Build and push Docker images
      run: |
        docker-compose -f docker-compose.sit.yml build
        docker-compose -f docker-compose.sit.yml push
        
    - name: Deploy to SIT server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SIT_HOST }}
        username: ${{ secrets.SIT_USER }}
        key: ${{ secrets.SIT_SSH_KEY }}
        script: |
          cd /opt/jackwongprofile
          git pull origin main
          ./scripts/deploy-sit.sh
```

## 🚨 Troubleshooting Guide

### Common Issues and Solutions

#### Issue: Services Won't Start
```bash
# Check Docker logs
docker-compose -f docker-compose.sit.yml logs

# Check for port conflicts
sudo lsof -i :3000
sudo lsof -i :8080
sudo lsof -i :3307

# Restart Docker daemon (if needed)
sudo systemctl restart docker
```

#### Issue: Database Connection Failed
```bash
# Check MySQL container
docker logs profile-db

# Test database connection from backend container
docker exec profile-backend curl db:3306

# Reset database (CAUTION: destroys data)
docker-compose -f docker-compose.sit.yml down -v
docker volume rm mysql_data_sit
```

#### Issue: API Calls Fail
```bash
# Check backend logs
docker logs profile-backend

# Test backend directly
curl -v http://localhost:8080/actuator/health

# Check environment variables
docker exec profile-backend env | grep DB_
```

#### Issue: Frontend Not Loading
```bash
# Check frontend logs
docker logs profile-frontend

# Verify build
docker exec profile-frontend ls -la /app/.next

# Check API connectivity from frontend
docker exec profile-frontend curl http://backend:8080/api/v1/public/profile
```

## 🔐 Security Considerations

### Production Security Checklist
- [ ] Change all default passwords
- [ ] Configure SSL certificates
- [ ] Set up firewall rules
- [ ] Implement rate limiting
- [ ] Enable database encryption
- [ ] Configure backup strategy
- [ ] Set up monitoring alerts
- [ ] Regular security updates

### Environment Variable Security
```bash
# Use secrets management
# Never commit .env files to version control

# Production secret rotation
./scripts/rotate-secrets.sh
```

## 📊 Monitoring & Maintenance

### Daily Operations
```bash
# Check system health
./scripts/health-check.sh

# Backup database (daily)
./scripts/backup-db.sh

# Review logs
./scripts/logs.sh | grep -E "(ERROR|WARN)"

# Monitor resource usage
docker stats
```

### Weekly Maintenance
```bash
# Clean up old containers/images
docker system prune -f

# Update dependencies
cd frontend && npm audit
cd backend && ./mvnw versions:display-dependency-updates

# Security scanning
docker scan jackwongprofile-backend:latest
```

## 🆘 Support & Recovery

### Emergency Procedures

#### Service Recovery
```bash
# Restart all services
./scripts/deploy-sit.sh restart

# Database recovery from backup
docker exec -i profile-db mysql -uroot -pRootPass123! profile_db < backup_file.sql
```

#### Data Recovery
```bash
# Export current data
docker exec profile-db mysqldump -uroot -pRootPass123! profile_db > emergency_backup.sql

# Import previous backup
docker exec -i profile-db mysql -uroot -pRootPass123! profile_db < previous_backup.sql
```

#### Rollback Deployment
```bash
# Revert to previous Docker image
docker-compose -f docker-compose.sit.yml down
docker pull jackwongprofile-backend:previous-version
docker pull jackwongprofile-frontend:previous-version
docker-compose -f docker-compose.sit.yml up -d
```

---

## 📝 Change Log

### Version 1.0.0 (Initial Deployment)
- Complete SIT environment setup
- Docker containerization for all services
- Automated deployment scripts
- Comprehensive documentation

### Future Enhancements
- Production deployment guide with SSL
- Load balancing configuration
- Auto-scaling setup
- Disaster recovery procedures

---

**For additional support, refer to the main README or create an issue in the repository.**


## 🔧 Deployment Issues & Fixes Log

### Issue 1: Frontend Dockerfile Missing `public` Directory
**Problem:** The Dockerfile.frontend was trying to copy `/app/public` directory which doesn't exist in the Next.js build output.

**Root Cause:** 
- Next.js standalone output doesn't include a `public` directory by default
- The original Dockerfile assumed a traditional Next.js structure

**Fix Applied:**
```dockerfile
# BEFORE (wrong):
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# AFTER (correct):
# Removed the problematic line - no public directory needed for standalone output
```

**Documentation Update:** Added this troubleshooting section to help others avoid the same issue.

### Issue 2: Docker Compose Version Warning
**Problem:** Docker Compose shows warning about obsolete `version` attribute.

**Root Cause:** Modern Docker Compose versions don't require the `version` field.

**Fix:**
```yaml
# In docker-compose.sit.yml, removed:
version: '3.8'  # This line is now obsolete

# Docker Compose now works without version specification
```

**Documentation Update:** Added note about Docker Compose version compatibility.

### Issue 3: Backend Container Dependency Failure
**Problem:** Backend container fails to start with dependency error.

**Possible Causes:**
1. Database connection issues
2. Environment variable configuration
3. Port conflicts
4. Application startup errors

**Troubleshooting Steps Added:**
```bash
# Check backend logs
docker logs profile-backend-sit

# Verify database connectivity
docker exec profile-mysql-sit mysql -uroot -pRootPass123! -e "SHOW DATABASES;"

# Check environment variables
docker exec profile-backend-sit printenv | grep -E "(DB_|DEEPSEEK_)"

# Test backend health endpoint (when running)
curl http://localhost:8080/actuator/health
```

## 📝 Updated Deployment Checklist

### Pre-Deployment Verification
1. **Check Dockerfile Compatibility:**
   ```bash
   # Verify Dockerfile syntax
   docker buildx bake --file docker-compose.sit.yml --print
   
   # Check for missing directories
   ls -la frontend/ | grep public
   ```

2. **Environment Configuration:**
   ```bash
   # Verify .env.sit file exists
   test -f .env.sit && echo "✅ .env.sit exists" || echo "❌ Missing .env.sit"
   
   # Check API key format
   grep DEEPSEEK_API_KEY .env.sit | grep -E "^sk-[a-zA-Z0-9]{32,}$"
   ```

3. **Port Availability:**
   ```bash
   # Check if ports are available
   lsof -i :3000  # Frontend
   lsof -i :8080  # Backend  
   lsof -i :3307  # MySQL (host port)
   ```

### Deployment Process Updates

#### Step 1: Clean Previous Deployment
```bash
# Stop and remove existing containers
docker-compose -f docker-compose.sit.yml down --volumes --remove-orphans

# Clean Docker network
docker network prune -f
```

#### Step 2: Build with Environment Variables
```bash
# Use explicit environment file
docker-compose --env-file .env.sit -f docker-compose.sit.yml build --no-cache
```

#### Step 3: Start Services with Health Checks
```bash
# Start with health check monitoring
docker-compose --env-file .env.sit -f docker-compose.sit.yml up -d --wait
```

#### Step 4: Verify Deployment
```bash
# Check all services
docker-compose -f docker-compose.sit.yml ps

# Monitor startup logs
docker-compose -f docker-compose.sit.yml logs -f --tail=50
```

## 🐛 Common Deployment Issues & Solutions

### Issue: "Target frontend: failed to solve"
**Symptoms:** Docker build fails with missing directory error.

**Solution:**
1. Check if the directory exists in the source code
2. Update Dockerfile to match actual project structure
3. For Next.js standalone output, only copy `.next/standalone` and `.next/static`

### Issue: Backend Container Exits Immediately
**Symptoms:** Container starts but exits with code 1.

**Debugging:**
```bash
# Check exit code
docker inspect profile-backend-sit --format='{{.State.ExitCode}}'

# View full logs
docker logs profile-backend-sit --tail=100

# Test database connection from container
docker exec profile-backend-sit curl db:3306
```

**Common Fixes:**
1. **Database Connection:** Ensure MySQL is healthy before backend starts
2. **Environment Variables:** Verify all required variables are set
3. **JVM Memory:** Check Java heap settings in Dockerfile
4. **Port Conflicts:** Ensure port 8080 is not in use

### Issue: Frontend Cannot Connect to Backend
**Symptoms:** Frontend shows "Cannot connect to API" errors.

**Verification:**
```bash
# Test backend from frontend container
docker exec profile-frontend-sit curl -s http://backend:8080/actuator/health

# Check network connectivity
docker network inspect jackwongprofile_profile-network
```

**Solution:** Ensure `NEXT_PUBLIC_API_BASE_URL` is correctly set to `http://backend:8080/api/v1` in Docker environment.

## 🔄 Updated Dockerfile Best Practices

### Frontend Dockerfile (Updated)
```dockerfile
# Key changes:
# 1. Removed COPY for non-existent /app/public directory
# 2. Only copy .next/standalone and .next/static
# 3. Added health check for container monitoring

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1
```

### Backend Dockerfile Enhancements
```dockerfile
# Added for better startup reliability:
# 1. Health check endpoint
# 2. Database connection retry logic in application
# 3. Environment variable validation

HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1
```

## 📊 Deployment Verification Script

Added new verification script `scripts/verify-deployment.sh`:
```bash
#!/bin/bash
# scripts/verify-deployment.sh

set -e

echo "🔍 Verifying SIT Deployment..."

# Check running containers
RUNNING=$(docker-compose -f docker-compose.sit.yml ps --services --filter "status=running")
EXPECTED="db backend frontend"

for service in $EXPECTED; do
  if echo "$RUNNING" | grep -q "$service"; then
    echo "✅ $service is running"
  else
    echo "❌ $service is NOT running"
    exit 1
  fi
done

# Test service connectivity
echo ""
echo "🌐 Testing service connectivity..."

# Test backend health
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health || echo "FAILED")
if [ "$BACKEND_HEALTH" = "200" ]; then
  echo "✅ Backend health check: HTTP $BACKEND_HEALTH"
else
  echo "❌ Backend health check failed: $BACKEND_HEALTH"
  exit 1
fi

# Test frontend
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "FAILED")
if [ "$FRONTEND_RESPONSE" = "200" ] || [ "$FRONTEND_RESPONSE" = "304" ]; then
  echo "✅ Frontend accessible: HTTP $FRONTEND_RESPONSE"
else
  echo "❌ Frontend not accessible: $FRONTEND_RESPONSE"
  exit 1
fi

# Test database
DB_CONNECTION=$(docker exec profile-mysql-sit mysql -uroot -pRootPass123! -e "SELECT 1" 2>/dev/null && echo "OK" || echo "FAILED")
if [ "$DB_CONNECTION" = "OK" ]; then
  echo "✅ Database connection successful"
else
  echo "❌ Database connection failed"
  exit 1
fi

echo ""
echo "🎉 All deployment checks passed!"
echo ""
echo "📱 Access Points:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8080"
echo "   Swagger UI: http://localhost:8080/swagger-ui.html"
echo "   Actuator: http://localhost:8080/actuator"
```

## 🚀 Updated Quick Deployment Command

Simplified deployment command that includes all fixes:
```bash
# One-command deployment with verification
./scripts/deploy-and-verify.sh
```

Where `deploy-and-verify.sh` combines:
1. Clean shutdown of previous deployment
2. Build with correct environment
3. Startup with health checks
4. Comprehensive verification

## 📈 Monitoring Improvements

Added to documentation:
1. **Log aggregation:** How to view combined logs
2. **Performance metrics:** Monitoring endpoints
3. **Alerting:** Setting up basic health alerts
4. **Backup procedures:** Database backup scripts

## 🔐 Security Updates

Documented security considerations:
1. **API Key Rotation:** Regular DeepSeek API key rotation
2. **Database Credentials:** Changing default passwords
3. **Network Security:** Docker network isolation
4. **Environment Variables:** Secure handling practices

This deployment log ensures future deployments will avoid the issues encountered and provides comprehensive troubleshooting guidance.


## 🐛 Critical Issues Encountered & Solutions

During the SIT deployment, the following critical issues were identified and resolved:

### Issue 1: JWT Secret Configuration Error
**Problem:** Backend container failed to start with error: `app.security.jwt.secret must decode to at least 256 bits`

**Root Cause:** The JWT secret in `.env.sit` was a plain text string instead of a base64-encoded 256-bit key.

**Solution:** 
1. Generated a proper 256-bit base64-encoded secret:
   ```bash
   openssl rand -base64 32
   ```
2. Updated `.env.sit` with the new secret:
   ```
   JWT_SECRET=BriQklHo+R7bEm19orXD7o0M6sm+toKF7/UTWuN1Y/I=
   ```

### Issue 2: Database Authentication Failure
**Problem:** Backend couldn't connect to MySQL with error: `Access denied for user 'profile_user'@'172.19.0.3'`

**Root Cause:** Multiple database user mismatches:
1. MySQL container was creating user `profile` with password from `MYSQL_PASSWORD`
2. Backend was configured to use `DB_USERNAME=profile` and `DB_PASSWORD=sit_profile_pass`
3. Application code was trying to connect as `profile_user`

**Solution:**
1. Updated `docker-compose.sit.yml` to use consistent default passwords:
   ```yaml
   # MySQL service
   MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD:-RootPass123!}
   MYSQL_PASSWORD: ${DB_PASSWORD:-ProfilePass123!}
   
   # Backend service  
   DB_PASSWORD: ${DB_PASSWORD:-ProfilePass123!}
   ```

2. Created enhanced MySQL initialization script (`docker/mysql/init.sql`):
   ```sql
   CREATE USER IF NOT EXISTS 'profile'@'%' IDENTIFIED BY 'ProfilePass123!';
   CREATE USER IF NOT EXISTS 'profile_user'@'%' IDENTIFIED BY 'ProfilePass123!';
   GRANT ALL PRIVILEGES ON jackwong_profile.* TO both users;
   ```

3. Added missing `DB_USERNAME` variable to `.env.sit`:
   ```
   DB_USERNAME=profile_user
   ```

### Issue 3: Frontend Docker Build Failure
**Problem:** Frontend Docker build failed trying to copy non-existent `/app/public` directory.

**Root Cause:** Next.js standalone output doesn't include a `public` directory by default.

**Solution:** Removed the problematic line from `Dockerfile.frontend`:
```dockerfile
# BEFORE (wrong):
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# AFTER (correct):
# Removed the line - no public directory needed for standalone output
```

### Issue 4: Docker Compose Version Warning
**Problem:** Docker Compose showed warning: `the attribute 'version' is obsolete`

**Root Cause:** Modern Docker Compose versions don't require the `version` field.

**Solution:** Removed `version: '3.8'` from `docker-compose.sit.yml`.

### Issue 5: Verification Script Issues
**Problem:** Verification script was restarting containers unnecessarily and had strict environment variable checks.

**Solution:** Updated `scripts/verify-deployment.sh` to:
1. Be more flexible with environment variable checking (accepts either `DB_USER` or `DB_USERNAME`)
2. Provide better error messages
3. Not automatically restart failing containers

## ✅ Deployment Verification

The deployment is now fully verified with:
- ✅ MySQL database: Running and accessible
- ✅ Backend API: Healthy (`UP` status from `/actuator/health`)
- ✅ Frontend: Ready and serving on port 3000
- ✅ Network: All containers communicating via `profile-network`
- ✅ Environment: All variables correctly configured

## 🔗 Access URLs
- **Frontend Application:** http://localhost:3000
- **Backend API:** http://localhost:8080
- **Swagger Documentation:** http://localhost:8080/swagger-ui.html
- **Actuator Health:** http://localhost:8080/actuator/health
- **MySQL Database:** localhost:3306 (root/RootPass123!)

## 📝 Key Lessons Learned

1. **JWT Secrets:** Must be proper base64-encoded 256-bit keys, not plain text
2. **Database Consistency:** Ensure MySQL user creation matches backend configuration
3. **Docker Compose:** Modern versions don't need `version` field
4. **Next.js Docker:** Standalone output doesn't include `public` directory
5. **Environment Variables:** Use consistent naming (`DB_USERNAME` vs `DB_USER`)
6. **Verification:** Scripts should validate without disrupting running services

## 🔄 Updated Deployment Command

Use the simplified deployment command:
```bash
./scripts/deploy-and-verify.sh
```

Or manually:
```bash
docker-compose --env-file .env.sit -f docker-compose.sit.yml up -d
```

The system is now fully deployed and operational in the SIT environment!