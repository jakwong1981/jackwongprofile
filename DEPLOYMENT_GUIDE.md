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

# 2. Deploy with improved health checks
./scripts/deploy-sit.sh
# OR manually
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

## 🔧 Key Fixes & Improvements

### 1. Dual API URL Configuration
The system now uses two different API endpoints:
- **Browser-side (client)**: `http://localhost:8080/api/v1` - Accessible from browser
- **Server-side (SSR)**: `http://backend:8080/api/v1` - Internal Docker network access

### 2. Improved Health Checks
- **Backend**: Now tests actual API endpoint (`/api/v1/public/profile`) instead of just actuator
- **Frontend**: Uses proper SSR client without Next.js-specific fetch options
- **Database**: Correct container names and initialization scripts

### 3. Build Fixes
- Fixed TypeScript linting errors (`@typescript-eslint/no-explicit-any`)
- Improved error handling in SSR client
- Proper environment variable usage

### SIT Environment (docker-compose.sit.yml)

#### Services Configuration:
1. **MySQL Database** (`mysql`):
   - Port: 3306 (container) → 3306 (host)
   - Database name: `jackwong_profile`
   - Persistent volume: `mysql_data_sit`
   - Initialization: `/docker/mysql/init.sql`

2. **Backend API** (`backend`):
   - Port: 8080
   - Depends on: `mysql`
   - Environment: `SPRING_PROFILES_ACTIVE=docker`
   - Health check: `curl -f http://localhost:8080/api/v1/public/profile`

3. **Frontend Application** (`frontend`):
   - Port: 3000
   - Depends on: `backend`
   - Build context: `./frontend`
   - Environment variables:
     - `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1` (browser access)
     - `API_INTERNAL_BASE_URL=http://backend:8080/api/v1` (SSR access)

#### Quick Start SIT:
```bash
# Build and start all services
./scripts/deploy-sit.sh

# OR manually
docker-compose -f docker-compose.sit.yml up -d --build

# View logs
docker-compose -f docker-compose.sit.yml logs -f

# Check service status
docker-compose -f docker-compose.sit.yml ps

# Stop services
docker-compose -f docker-compose.sit.yml down
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

## 🔧 Environment Variables

### Required Environment Variables
Create `.env.sit` file:
```bash
# Database
DB_HOST=mysql
DB_PORT=3306
DB_NAME=jackwong_profile
DB_USER=profile_user
DB_PASSWORD=ProfilePass123!
DB_ROOT_PASSWORD=RootPass123!

# Backend
SPRING_PROFILES_ACTIVE=docker
SERVER_PORT=8080
JWT_SECRET=YourJwtSecretKeyHereChangeInProduction
JWT_EXPIRATION=86400000

# Frontend (CRITICAL: Dual URLs for different contexts)
# For browser access - use localhost for client-side rendering
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
# For server-side rendering inside Docker - use backend service name
API_INTERNAL_BASE_URL=http://backend:8080/api/v1

NEXT_PUBLIC_APP_NAME="Jack Wong Profile"
NEXT_PUBLIC_APP_VERSION=1.0.0

# DeepSeek API
DEEPSEEK_API_KEY=your-deepseek-api-key-here
DEEPSEEK_BASE_URL=https://api.deepseek.com

# News Sources
NEWS_RUNDOWN_AI_ENABLED=true
NEWS_TECHCRUNCH_AI_ENABLED=true
```

## 🚨 Troubleshooting Common Issues

### Issue 1: "Profile service could not be reached"
**Symptoms**: Frontend displays "The profile service could not be reached. Please try again shortly."

**Causes & Solutions**:
1. **Dual API URLs not configured**: Ensure both `NEXT_PUBLIC_API_BASE_URL` and `API_INTERNAL_BASE_URL` are set
2. **Container networking**: Services must be on same Docker network
3. **Health check failures**: Use `./scripts/deploy-sit.sh` which has improved health checks

### Issue 2: npm build failures
**Symptoms**: `npm run build` fails with TypeScript linting errors

**Solution**: 
```bash
cd frontend
npm run lint:fix
npm run build
```

### Issue 3: Deployment script errors
**Symptoms**: `deploy-sit.sh` fails with container or network errors

**Solution**: Updated script uses correct container names:
- Database: `mysql` (not `profile-db`)
- Backend: `backend`
- Frontend: `frontend`

## 📊 Health Check Endpoints

| Service | Health Check URL | Expected Response |
|---------|-----------------|-------------------|
| Backend | `http://localhost:8080/api/v1/public/profile` | 200 OK with JSON |
| Frontend | `http://localhost:3000` | 200 OK HTML |
| Database | `docker-compose exec mysql mysqladmin ping` | "mysqld is alive" |
| Actuator | `http://localhost:8080/actuator/health` | {"status":"UP"} |

## 🔍 Validation & Testing

### Deployment Validation
```bash
# Run full deployment with validation
./scripts/deploy-and-verify.sh

# Test specific endpoints
curl -f http://localhost:8080/api/v1/public/profile
curl -f http://localhost:3000
```

### Manual Testing
1. Access frontend: http://localhost:3000
2. Verify no "Profile service could not be reached" error
3. Test admin login: http://localhost:3000/admin/login
4. Check API documentation: http://localhost:8080/api/v1

## 📝 Change Log

### Version 2.0.0 (Current)
- Fixed dual API URL configuration for SSR vs client-side
- Improved health checks to test actual API endpoints
- Fixed TypeScript build errors in SSR client
- Updated deployment scripts with correct container names
- Enhanced error handling and logging

### Version 1.0.0 (Initial)
- Initial deployment configuration
- Basic Docker setup
- Simple health checks

## 🆘 Getting Help

For deployment issues:
1. Check logs: `docker-compose -f docker-compose.sit.yml logs -f`
2. Run validation: `./scripts/validate-deployment.sh`
3. Review environment variables in `.env.sit`

**Common Resolution**: Most "profile service could not be reached" errors are resolved by ensuring proper dual URL configuration and network connectivity between containers.

---
*Last Updated: $(date)*
*Deployment Guide Version: 2.0.0*
