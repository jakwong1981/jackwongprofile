# Docker Containerization Guide

## 📋 Overview

This guide covers the Docker containerization setup for the Jack Wong Personal Profile Management System. The project uses multi-container Docker deployment with separate services for frontend, backend, and database.

## 🏗️ Architecture

### Container Structure
```
┌─────────────────────────────────────────────────────┐
│                 Docker Host Machine                 │
│                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│  │  Frontend   │  │   Backend   │  │  Database   ││
│  │  (Next.js)  │  │ (Spring Boot)│  │   (MySQL)  ││
│  │   Port:3000 │  │   Port:8080  │  │   Port:3306││
│  └─────────────┘  └─────────────┘  └─────────────┘│
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │            Docker Network                     │ │
│  │            profile-network                    │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Container Communication
```
Frontend (3000) → Backend (8080) → Database (3306)
           ↑           ↑
        Browser      Internal
```

## 📁 Docker Configuration Files

### Root Directory
- `Dockerfile.backend` - Spring Boot backend Dockerfile
- `Dockerfile.frontend` - Next.js frontend Dockerfile  
- `docker-compose.sit.yml` - SIT environment compose file
- `docker-compose.prod.yml` - Production compose file (template)

### docker/ Directory
```
docker/
├── README.md               # This file
├── mysql/
│   └── init.sql           # Database initialization script
└── .dockerignore          # Docker ignore patterns
```

## 🐳 Dockerfiles

### Backend Dockerfile (`Dockerfile.backend`)

```dockerfile
# Multi-stage build for Spring Boot backend
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B
COPY backend/src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Key Features:**
- Multi-stage build for smaller final image
- Maven dependency caching for faster builds
- JRE-only runtime (no JDK overhead)
- Alpine Linux base for minimal size (~150MB)

### Frontend Dockerfile (`Dockerfile.frontend`)

```dockerfile
# Multi-stage build for Next.js frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

**Key Features:**
- Multi-stage build optimization
- Production-only dependencies
- Standalone Next.js output
- Minimal runtime dependencies

## 🚀 Docker Compose Configurations

### SIT Environment (`docker-compose.sit.yml`)

```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    container_name: profile-db
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: RootPass123!
      MYSQL_DATABASE: profile_db
      MYSQL_USER: profile_user
      MYSQL_PASSWORD: ProfilePass123!
    ports:
      - "3307:3306"
    volumes:
      - mysql_data_sit:/var/lib/mysql
      - ./docker/mysql/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - profile-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: profile-backend
    restart: unless-stopped
    environment:
      SPRING_PROFILES_ACTIVE: docker
      DB_HOST: db
      DB_PORT: 3306
      DB_NAME: profile_db
      DB_USER: profile_user
      DB_PASSWORD: ProfilePass123!
      DEEPSEEK_API_KEY: ${DEEPSEEK_API_KEY:-your-deepseek-api-key-here}
    ports:
      - "8080:8080"
    depends_on:
      db:
        condition: service_healthy
    networks:
      - profile-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: profile-frontend
    restart: unless-stopped
    environment:
      NEXT_PUBLIC_API_BASE_URL: http://localhost:8080/api/v1
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - profile-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  profile-network:
    driver: bridge

volumes:
  mysql_data_sit:
```

## 🔧 Building and Running

### Build All Images
```bash
# Build all services
docker-compose -f docker-compose.sit.yml build

# Build specific service
docker-compose -f docker-compose.sit.yml build backend
```

### Start Services
```bash
# Start in detached mode
docker-compose -f docker-compose.sit.yml up -d

# Start with logs
docker-compose -f docker-compose.sit.yml up

# Start and rebuild
docker-compose -f docker-compose.sit.yml up -d --build
```

### Manage Services
```bash
# View logs
docker-compose -f docker-compose.sit.yml logs -f
docker-compose -f docker-compose.sit.yml logs backend

# Check status
docker-compose -f docker-compose.sit.yml ps

# Stop services
docker-compose -f docker-compose.sit.yml down

# Stop and remove volumes
docker-compose -f docker-compose.sit.yml down -v

# Restart services
docker-compose -f docker-compose.sit.yml restart
```

### Individual Container Commands
```bash
# Access container shell
docker exec -it profile-backend sh
docker exec -it profile-db mysql -u root -p

# View container logs
docker logs profile-backend -f

# Inspect container
docker inspect profile-backend

# Resource usage
docker stats
```

## ⚙️ Environment Configuration

### Environment Variables File (.env.sit)
Create `.env.sit` in project root:
```bash
# Database
DB_HOST=db
DB_PORT=3306
DB_NAME=profile_db
DB_USER=profile_user
DB_PASSWORD=ProfilePass123!
DB_ROOT_PASSWORD=RootPass123!

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

# News Sources Configuration
NEWS_RUNDOWN_AI_ENABLED=true
NEWS_TECHCRUNCH_AI_ENABLED=true
NEWS_MIT_TECH_REVIEW_ENABLED=true
NEWS_DEEPLEARNING_AI_ENABLED=true
NEWS_HUGGINGFACE_ENABLED=true
```

### Using Environment Files
```bash
# Load environment from file
source .env.sit

# Pass environment file to docker-compose
docker-compose --env-file .env.sit -f docker-compose.sit.yml up
```

## 🗄️ Database Management

### Initialization Script (`docker/mysql/init.sql`)
```sql
-- Create database schema
CREATE DATABASE IF NOT EXISTS profile_db;
USE profile_db;

-- Create tables (Flyway will handle this in production)
-- This file is for initial test data

-- Insert admin user (password: ChangeMe123!)
INSERT INTO admin_users (username, password_hash, display_name, role, created_at, updated_at)
VALUES ('admin', '$2a$10$YourHashedPasswordHere', 'Administrator', 'ADMIN', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Insert sample profile
INSERT INTO profiles (slug, full_name, headline, job_title, company_name, location, summary, avatar_url, published, created_at, updated_at)
VALUES ('jack-wong', 'Jack Wong', 'Full-Stack Developer & AI Enthusiast', 'Senior Software Engineer', 'Tech Innovations Inc.', 'Hong Kong', 'Experienced software engineer with 8+ years...', '/avatars/jack-wong.jpg', true, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();
```

### Database Operations
```bash
# Backup database
docker exec profile-db mysqldump -uroot -pRootPass123! profile_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
docker exec -i profile-db mysql -uroot -pRootPass123! profile_db < backup_file.sql

# Access MySQL CLI
docker exec -it profile-db mysql -uroot -pRootPass123! profile_db

# View database logs
docker logs profile-db --tail=50
```

## 🔍 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check which processes are using ports
sudo lsof -i :3000
sudo lsof -i :8080
sudo lsof -i :3307

# Kill process on specific port
sudo kill -9 $(sudo lsof -t -i:3000)
```

#### Container Won't Start
```bash
# Check container logs
docker logs profile-backend

# Check Docker daemon
sudo systemctl status docker

# Restart Docker
sudo systemctl restart docker
```

#### Database Connection Issues
```bash
# Test database connection from backend
docker exec profile-backend curl db:3306

# Check MySQL logs
docker logs profile-db

# Reset database (CAUTION: destroys data)
docker-compose -f docker-compose.sit.yml down -v
docker volume rm mysql_data_sit
```

#### Build Failures
```bash
# Clear Docker cache
docker system prune -a

# Clear specific build cache
docker builder prune

# Check disk space
df -h
```

### Debug Commands
```bash
# Inspect running containers
docker ps -a
docker inspect profile-backend | jq '.[0].State'

# Resource usage
docker stats --no-stream

# Network inspection
docker network inspect profile-network

# Volume inspection
docker volume ls
docker volume inspect mysql_data_sit
```

## 🔐 Security Considerations

### Production Security
1. **Change Default Passwords**: Always change `RootPass123!` and `ProfilePass123!`
2. **Use Strong Secrets**: Generate strong JWT secrets and API keys
3. **Network Security**: Use internal networks, expose only necessary ports
4. **Regular Updates**: Keep base images updated
5. **Secret Management**: Use Docker secrets or external secret managers

### Security Scanning
```bash
# Scan images for vulnerabilities
docker scan jackwongprofile-backend:latest
docker scan jackwongprofile-frontend:latest

# Check for outdated packages
docker exec profile-backend ./mvnw versions:display-dependency-updates
docker exec profile-frontend npm audit
```

## 📊 Performance Optimization

### Image Size Optimization
- Use multi-stage builds
- Choose Alpine base images
- Remove build dependencies in final stage
- Use `.dockerignore` to exclude unnecessary files

### Resource Limits
```yaml
# In docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```

### Caching Strategy
- Use build cache for dependencies
- Layer optimization (frequently changed layers last)
- Use Docker BuildKit for parallel builds

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Build and Push Docker Images

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
      
    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
        
    - name: Build and push backend
      uses: docker/build-push-action@v4
      with:
        context: .
        file: ./Dockerfile.backend
        push: true
        tags: yourusername/jackwongprofile-backend:latest
        
    - name: Build and push frontend
      uses: docker/build-push-action@v4
      with:
        context: .
        file: ./Dockerfile.frontend
        push: true
        tags: yourusername/jackwongprofile-frontend:latest
```

## 🧪 Testing with Docker

### Run Tests in Container
```bash
# Backend tests
docker run --rm -v $(pwd)/backend:/app -w /app maven:3.9.6-eclipse-temurin-17 mvn test

# Frontend tests
docker run --rm -v $(pwd)/frontend:/app -w /app node:20-alpine npm test
```

### Integration Testing
```bash
# Start test environment
docker-compose -f docker-compose.sit.yml up -d

# Run integration tests
./scripts/test-integration.sh

# Tear down
docker-compose -f docker-compose.sit.yml down
```

## 📈 Monitoring

### Log Management
```bash
# Structured logging
docker-compose -f docker-compose.sit.yml logs --tail=100 --timestamps

# Log aggregation (example with ELK)
docker run --name elasticsearch -d elasticsearch:8.0
docker run --name logstash -d logstash:8.0
docker run --name kibana -d kibana:8.0
```

### Metrics Collection
```bash
# Prometheus scraping
docker run -d --name prometheus -p 9090:9090 prom/prometheus

# Grafana dashboard
docker run -d --name grafana -p 3001:3000 grafana/grafana
```

## 🆘 Support

### Getting Help
1. Check logs: `docker-compose -f docker-compose.sit.yml logs`
2. Verify configuration: `docker-compose -f docker-compose.sit.yml config`
3. Test connectivity: `./scripts/health-check.sh`
4. Consult documentation: `README.md`, `DEPLOYMENT_GUIDE.md`

### Common Commands Reference
```bash
# Quick reference
./scripts/deploy-sit.sh              # Full deployment
docker-compose -f docker-compose.sit.yml ps          # Status
docker-compose -f docker-compose.sit.yml logs -f     # Live logs
docker-compose -f docker-compose.sit.yml exec backend sh  # Shell access
```

---

**Next Steps**: Refer to [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) for comprehensive deployment instructions.