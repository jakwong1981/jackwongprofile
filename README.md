# 🚨 RECENT FIXES & CRITICAL UPDATES

## Fix 1: Dual API URL Configuration
**Problem**: "Profile service could not be reached" error in Docker deployments
**Solution**: System now uses two API endpoints:
- **Client-side**: `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1` (browser access)
- **Server-side (SSR)**: `API_INTERNAL_BASE_URL=http://backend:8080/api/v1` (Docker network)

## Fix 2: Improved Health Checks
**Problem**: Health checks passed but actual API calls failed
**Solution**: Updated to test real API endpoints (`/api/v1/public/profile`) instead of just actuator

## Fix 3: TypeScript Build Fixes
**Problem**: npm build failures due to TypeScript linting errors
**Solution**: Fixed `@typescript-eslint/no-explicit-any` violations in SSR client

## Fix 4: Deployment Script Corrections
**Problem**: Script used wrong container names and health checks
**Solution**: Updated `scripts/deploy-sit.sh` with:
- Correct container names (mysql, backend, frontend)
- Proper health check URLs
- Dual API URL support

---

# Jack Wong Personal Profile Management System

## 📋 Project Overview

A dynamic personal profile management system with real-time updates, AI-powered news aggregation, and comprehensive administrative controls. Built as a full-stack application following modern development practices.

### ✨ Key Features

- **Dynamic Profile Management**: Real-time updates of personal details, work experience, education, and certifications
- **AI-Powered News Dashboard**: Aggregates and analyzes AI research/news from 5 major sources
- **Split-Pane Editor**: Dual-column markdown workspace with live preview
- **Internationalization**: Traditional Chinese, Simplified Chinese, and English support
- **Responsive Design**: Fully responsive across desktop, tablet, and mobile
- **Hierarchical Data Models**: Nested work experience (employer → positions → responsibilities)
- **Comprehensive CRUD Operations**: Full administrative control over all data

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ & npm
- Java 17+
- MySQL 8.0+
- Docker & Docker Compose (for containerized deployment)

### Local Development Setup

```bash
# 1. Clone and navigate to project
cd jackwongprofile

# 2. Set up backend
cd backend
./mvnw clean compile
cp src/main/resources/application-local.yml.example src/main/resources/application-local.yml
# Edit application-local.yml with your database credentials

# 3. Set up frontend
cd ../frontend
npm install

# 4. Start services
# Terminal 1: Start backend
cd backend && ./mvnw spring-boot:run

# Terminal 2: Start frontend  
cd frontend && npm run dev
```

### Default Access
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Admin Login**: Username: `system-admin`, Password: `SecureAdminPass2024!`
- **API Documentation**: http://localhost:8080/swagger-ui.html

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React
- **Backend**: Spring Boot 3.x, Java 17, MySQL, JPA/Hibernate
- **Build Tools**: Maven, npm, Docker
- **Testing**: Vitest, Spring Boot Test
- **CI/CD**: GitHub Actions (configurable)

### Project Structure
```
jackwongprofile/
├── frontend/              # Next.js frontend application
│   ├── src/app/          # App router pages
│   ├── src/components/   # React components
│   ├── src/lib/          # Utilities, APIs, hooks
│   └── src/types/        # TypeScript definitions
├── backend/              # Spring Boot backend
│   ├── src/main/java/com/jackwong/profile/
│   │   ├── api/          # REST controllers
│   │   ├── domain/       # Entities, repositories
│   │   ├── service/      # Business logic
│   │   └── config/       # Configuration
│   └── src/main/resources/
│       └── db/migration/ # Database migrations
├── docker/               # Docker configurations
├── scripts/              # Build/deployment scripts
└── docs/                 # Documentation
```

## 📦 Deployment

### Containerized Deployment (SIT Environment)

```bash
# Build and start all services
./scripts/deploy-sit.sh

# Or manually with Docker Compose
docker-compose -f docker-compose.sit.yml up -d --build
```

### Environment Variables
See `.env.sit.example` for required environment variables.

## 📚 Documentation

- [Technical Specifications](./TECHNICAL_SPEC.md) - Detailed architecture and implementation
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Complete deployment instructions
- [API Documentation](./API_DOCUMENTATION.md) - API endpoints and usage
- [Docker Guide](./docker/README.md) - Containerization details

## 🧪 Testing

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && ./mvnw test

# End-to-end tests
cd frontend && npm run build
```

## 🔧 Development

### Code Style & Quality

```bash
# Frontend linting
cd frontend && npm run lint

# TypeScript checking
cd frontend && npm run typecheck

# Backend formatting
cd backend && ./mvnw fmt:format
```

### Database Migrations
```bash
cd backend && ./mvnw flyway:migrate
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the [documentation](./docs/)
2. Review existing [issues](https://github.com/quo8/jackwongprofile/issues)
3. Create a new issue with detailed description

---
**Built with ❤️ using modern development practices**


## 🛠️ Development Setup

### Code Quality Tools

This project uses multiple code quality tools:

1. **ESLint** - Primary linter for TypeScript/JavaScript
   ```bash
   # Run ESLint
   cd frontend && npm run lint
   ```

2. **TypeScript** - Type checking
   ```bash
   # Run type checking
   cd frontend && npm run typecheck
   ```

3. **JSHint** - Installed for VS Code compatibility
   ```bash
   # Run JSHint (optional)
   cd frontend && npm run jshint
   ```

### VS Code Configuration

If you see "Failed to load jshint library" errors:

1. **JSHint is now installed** as a dev dependency
2. **VS Code settings** have been configured to prefer ESLint over JSHint
3. **.jshintrc** configuration file has been created in project root

To disable JSHint in VS Code entirely:
1. Open VS Code Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`)
2. Type "Extensions: Show Installed Extensions"
3. Search for "JSHint" extension
4. Click "Disable" if you prefer to use ESLint only

### Recommended Workflow

For best results with this TypeScript/Next.js project:
- Use **ESLint** as your primary linter (`npm run lint`)
- Use **TypeScript** for type checking (`npm run typecheck`)
- JSHint is installed only for editor compatibility

## 📋 Bugfix Specifications

### Current Issues Resolved
1. **Profile Service Connectivity** - Fixed Docker container communication and CORS configuration
2. **npm Build Failure** - Resolved TypeScript compilation issues

### Active Issues
1. **JSON Display Format Issue** - Profile summary field shows raw JSON instead of properly parsed text
   - **Spec**: [bugfix.md](kiro-spec://create?featureName=profile-summary-json-issue&documentType=bugfix)
   - **Design**: [design.md](kiro-spec://create?featureName=profile-summary-json-issue&documentType=design)
   - **Tasks**: [tasks.md](kiro-spec://create?featureName=profile-summary-json-issue&documentType=tasks)

## 🚀 Quick Start

### Deploy to SIT Environment
```bash
# Run full deployment
./scripts/deploy-sit.sh

# Verify deployment
./scripts/validate-deployment.sh
```

### Test System
```bash
# Test API connectivity
curl http://localhost:8080/api/v1/public/profile

# Test frontend
curl http://localhost:3000

# Check container status
docker-compose -f docker-compose.sit.yml ps
```

## 🔧 Development Workflow

1. **Bug Discovery**: Identify issue in running system
2. **Spec Creation**: Create bugfix specification using Kiro workflow
3. **Implementation**: Execute tasks from tasks.md
4. **Testing**: Validate fix and ensure no regressions
5. **Deployment**: Deploy fix to SIT environment

## 📚 Documentation

- [API Documentation](API_DOCUMENTATION.md) - Complete API reference
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Deployment instructions and troubleshooting
- [Technical Specification](TECHNICAL_SPEC.md) - System architecture and design
- [Fixes Summary](FIXES_SUMMARY.md) - Summary of all applied fixes

## 🐛 Bug Tracking

All bug specifications are maintained in the `.kiro/specs/` directory. Each bugfix follows the structured workflow:
1. **requirements.md** - Bug analysis and requirements
2. **design.md** - Technical solution design
3. **tasks.md** - Implementation tasks

Current active bug: `profile-summary-json-issue`
