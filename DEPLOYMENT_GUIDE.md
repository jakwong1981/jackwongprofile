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