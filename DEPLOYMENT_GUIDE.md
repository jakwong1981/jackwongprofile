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

## 📂 Scripts Directory Reference

The `scripts/` directory contains comprehensive automation scripts for deployment, testing, and maintenance.

### **Scripts Overview**

| Script | Purpose | Complexity | Typical Usage |
|--------|---------|------------|---------------|
| `deploy-sit.sh` | Complete SIT deployment | High | Initial setup, major changes |
| `deploy-and-verify.sh` | Full deployment pipeline | High | Production-like deployments |
| `verify-deployment.sh` | Deployment verification | Medium | Post-deployment checks |
| `validate-deployment.sh` | Pre-deployment validation | Low | Before deployment |
| `quick-test-data.sh` | Minimal test data | Low | UI/layout testing |
| `load-test-data.sh` | Comprehensive test data | Medium | Full system testing |
| `insert-dummy-data.sh` | Development data setup | Medium | Development environments |
| `restart-app.sh` | Smart restart for changes | Low | Frontend-only updates |

### **Detailed Script Documentation**

#### **1. `deploy-sit.sh` - Primary Deployment Script**
**Purpose**: Complete SIT environment deployment with all services
**Key Features**:
- Builds both backend and frontend Docker images
- Starts all services with proper dependencies
- Includes comprehensive health checks
- Initializes database with migration scripts
- Waits for each service to be ready before proceeding

**Usage**:
```bash
./scripts/deploy-sit.sh
```

#### **2. `deploy-and-verify.sh` - Complete Deployment & Verification**
**Purpose**: Full deployment pipeline with cleanup and verification
**Key Features**:
- Cleans previous deployment (volumes, networks)
- Builds services from scratch (no-cache)
- Starts all services
- Runs comprehensive verification checks
- Provides quick access links

**Usage**:
```bash
./scripts/deploy-and-verify.sh
```

#### **3. `verify-deployment.sh` - Deployment Verification Tool**
**Purpose**: Verify that deployment is working correctly
**Key Features**:
- Checks Docker container status
- Tests HTTP endpoints (backend, frontend)
- Verifies database connectivity
- Checks environment variables
- Provides colored status output
- Shows recent logs for troubleshooting

**Usage**:
```bash
./scripts/verify-deployment.sh
```

#### **4. `validate-deployment.sh` - Pre-deployment Validation**
**Purpose**: Validate configuration before deployment
**Key Features**:
- Checks if `.env.sit` file exists
- Validates API URL configuration
- Checks DeepSeek API key format
- Validates Docker Compose configuration
- Tests API connectivity

**Usage**:
```bash
./scripts/validate-deployment.sh
```

#### **5. `quick-test-data.sh` - Quick Layout Testing**
**Purpose**: Insert minimal test data for UI/layout testing
**Key Features**:
- Inserts single test profile with all related data
- Includes multilingual content (en/zhHant/zhHans)
- Adds experiences, education, certifications
- Includes test news articles
- Safe for repeated use (uses ON DUPLICATE KEY UPDATE)

**Usage**:
```bash
./scripts/quick-test-data.sh
```

#### **6. `load-test-data.sh` - Comprehensive Test Data**
**Purpose**: Load comprehensive test data for full system testing
**Key Features**:
- Creates detailed test SQL file
- Includes multiple profiles and related data
- Rich multilingual content
- Works with both direct MySQL and Docker
- Provides test URLs and verification

**Usage**:
```bash
./scripts/load-test-data.sh
```

#### **7. `insert-dummy-data.sh` - Development Data Setup**
**Purpose**: Insert dummy data for development and testing
**Key Features**:
- Checks if MySQL is running
- Waits for database to be ready
- Inserts comprehensive test dataset
- Verifies inserted data
- Safe for development environments

**Usage**:
```bash
./scripts/insert-dummy-data.sh
```

#### **8. `restart-app.sh` - Smart Restart Script** *(Enhanced in v1)*
**Purpose**: Quick restart for frontend changes without full rebuild
**Key Features**:
- Detects which services need rebuilding
- Only rebuilds changed components
- Preserves database and backend data
- Quick health checks
- Optimized for development testing

**Usage**:
```bash
./scripts/restart-app.sh
```

### **Workflow Examples**

#### **Typical Deployment Workflow:**
```bash
# 1. Validate configuration
./scripts/validate-deployment.sh

# 2. Full deployment
./scripts/deploy-sit.sh
# OR
./scripts/deploy-and-verify.sh

# 3. Add test data
./scripts/load-test-data.sh
# OR for quick testing
./scripts/quick-test-data.sh
```

#### **Development Testing Workflow:**
```bash
# 1. Initial setup
./scripts/deploy-sit.sh

# 2. Add test data
./scripts/quick-test-data.sh

# 3. Make frontend changes
# ... edit frontend code ...

# 4. Quick restart (frontend only)
./scripts/restart-app.sh

# 5. Test changes
open http://localhost:3000
```

### **Script Enhancement Status for v1**

Based on the enhancement_v1.md requirements, the following scripts need updates:

#### **Scripts requiring updates:**
1. **`deploy-sit.sh`** - Add file storage configuration for 500MB uploads
2. **`deploy-and-verify.sh`** - Add verification for new features (file upload, translation)
3. **`verify-deployment.sh`** - Test file upload endpoints and translation service
4. **`.env.sit.example`** - Add configuration for file uploads (500MB) and translation

#### **Scripts NOT requiring updates:**
1. **`quick-test-data.sh`** - Already properly formats multilingual JSON ✅
2. **`load-test-data.sh`** - Already properly formats multilingual JSON ✅
3. **`insert-dummy-data.sh`** - Already properly formats multilingual JSON ✅
4. **`validate-deployment.sh`** - Minor updates for new environment variables

### **Environment Variables for v1 Enhancements**

Add to `.env.sit.example` for v1 enhancements:
```bash
# ============================================
# FILE UPLOAD & IMAGE PROCESSING (v1 Enhancement)
# ============================================

# File Upload Settings (500MB support)
FILE_UPLOAD_MAX_SIZE=500MB
FILE_UPLOAD_CHUNK_SIZE=10MB
FILE_UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif
FILE_UPLOAD_ALLOWED_EXTENSIONS=jpg,jpeg,png,gif

# Image Optimization
IMAGE_OPTIMIZATION_ENABLED=true
IMAGE_MAX_WIDTH=1200
IMAGE_MAX_HEIGHT=1200
IMAGE_QUALITY=85
IMAGE_FORMAT=webp

# Storage Configuration
STORAGE_TYPE=local  # local, s3, cloudinary
STORAGE_LOCAL_PATH=/var/uploads
STORAGE_S3_BUCKET=your-bucket-name
STORAGE_S3_REGION=ap-east-1
STORAGE_CDN_URL=https://cdn.example.com

# ============================================
# DEEPSEEK TRANSLATION SERVICE (v1 Enhancement)
# ============================================

# Translation Configuration
TRANSLATION_ENABLED=true
TRANSLATION_AUTO_TRANSLATE=true
TRANSLATION_CACHE_ENABLED=true
TRANSLATION_CACHE_TTL=86400  # 24 hours
TRANSLATION_FALLBACK_TO_MANUAL=true

# Translation Quality
TRANSLATION_TEMPERATURE=0.2  # Lower for more consistent translations
TRANSLATION_MAX_TOKENS=2000
TRANSLATION_MODEL=deepseek-chat

# Supported Languages
TRANSLATION_SOURCE_LANGUAGES=en,zhHant,zhHans
TRANSLATION_TARGET_LANGUAGES=en,zhHant,zhHans
```

### **Quick Reference Commands**

```bash
# Most common commands
./scripts/deploy-sit.sh           # Full deployment
./scripts/verify-deployment.sh    # Check if everything works
./scripts/quick-test-data.sh      # Add test data for UI testing
./scripts/validate-deployment.sh  # Validate before deploying

# Docker management
docker-compose -f docker-compose.sit.yml ps      # Check status
docker-compose -f docker-compose.sit.yml logs -f # View logs
docker-compose -f docker-compose.sit.yml down    # Stop services

# Testing
curl http://localhost:8080/api/v1/public/profile # Test API
open http://localhost:3000                       # Open frontend
```

---
*Last Updated: 2024-09-02*
*Deployment Guide Version: 2.1.0*
*Enhancements v1 Documentation Added*
