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
- **Admin Login**: Username: `admin`, Password: `ChangeMe123!`
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