# Technical Specification: Jack Wong Personal Profile Management System

## 📐 System Architecture

### High-Level Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser                            │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐    │
│  │  Next.js    │  │   React     │  │   Tailwind CSS   │    │
│  │  (App Router)│  │ Components  │  │                  │    │
│  └─────────────┘  └─────────────┘  └──────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Spring Boot Backend (REST API)              │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐    │
│  │ Controllers │  │   Services  │  │    Security      │    │
│  └─────────────┘  └─────────────┘  └──────────────────┘    │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐    │
│  │   JPA/Hib.  │  │  Repositori │  │  News Aggregator │    │
│  └─────────────┘  └─────────────┘  └──────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │ JDBC
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     MySQL Database                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tables: profiles, experiences, positions, educations│  │
│  │  certifications, news_articles, users, etc.          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

#### Frontend Architecture
- **Framework**: Next.js 14 with App Router
- **State Management**: React Context API + useState/useReducer
- **Styling**: Tailwind CSS with custom design tokens
- **Internationalization**: Runtime locale switching with client-side dictionaries
- **Build System**: npm scripts with TypeScript compilation

#### Backend Architecture
- **Framework**: Spring Boot 3.3.4
- **Persistence**: JPA/Hibernate with MySQL
- **API Design**: RESTful with HATEOAS principles
- **Security**: JWT-based authentication with Spring Security
- **Validation**: Jakarta Bean Validation with custom constraints
- **Scheduling**: Spring Task Scheduler for news aggregation

## 🗄️ Data Models

### Core Entities

#### Profile Entity
```java
@Entity
public class Profile {
    private Long id;
    private String slug;              // URL-friendly identifier
    private String fullName;
    private LocalizedText localizedFullName;
    private LocalizedText headline;
    private LocalizedText jobTitle;
    private String companyName;
    private String location;
    private LocalizedText summary;    // Markdown biography
    private String avatarUrl;
    private boolean published;
    private Contact contact;          // Embedded contact info
    private List<Experience> experiences;
    private List<Education> educations;
    private List<Certification> certifications;
}
```

#### Hierarchical Experience Model
```
Experience (1) ──┐
    ├── JobPosition (N) ──┐
    │    └── Responsibility (N)
    ├── Employment dates
    └── Company metadata
```

#### News Aggregation Model
```
NewsArticle
├── Source (RUNDOWN_AI, TECHCRUNCH_AI, etc.)
├── Content (title, url, excerpt)
├── DeepSeek Analysis (summary, keywords, category)
└── Metadata (fetchedAt, analysisStatus, impactLevel)
```

## 🔌 API Specifications

### REST API Endpoints

#### Public Endpoints
```
GET    /api/v1/public/profile          # Get published profile
GET    /api/v1/public/profile/{slug}   # Get profile by slug
GET    /api/v1/public/news             # Search news articles
GET    /api/v1/public/news/{id}        # Get specific article
GET    /api/v1/public/news/stats       # Get aggregation statistics
```

#### Admin Endpoints (Authenticated)
```
# Profile Management
PUT    /api/v1/admin/profiles/{id}     # Update profile
POST   /api/v1/admin/profiles/{id}/experiences     # Add experience
PUT    /api/v1/admin/profiles/{id}/experiences/{expId}  # Update experience
DELETE /api/v1/admin/profiles/{id}/experiences/{expId}  # Delete experience
POST   /api/v1/admin/profiles/{id}/experiences/reorder  # Reorder experiences

# Education & Certification (similar patterns)

# News Management
POST   /api/v1/admin/news/ingest       # Manual ingestion
POST   /api/v1/admin/news/analyze      # Analyze pending articles
POST   /api/v1/admin/news/{id}/analyze # Analyze specific article
DELETE /api/v1/admin/news/{id}         # Delete article
```

#### Authentication
```
POST   /api/v1/auth/login              # Get JWT tokens
POST   /api/v1/auth/refresh            # Refresh access token
```

### API Response Format
```json
{
  "success": true,
  "code": 20000,
  "message": "Operation successful",
  "data": { /* Response payload */ },
  "errors": [],  // Field validation errors
  "timestamp": "2024-01-01T00:00:00Z",
  "traceId": "correlation-id"
}
```

## 🔐 Security Architecture

### Authentication Flow
1. **Login**: Username/password → JWT access + refresh tokens
2. **Token Validation**: Spring Security filters validate JWT on each request
3. **Refresh**: Expired access tokens can be refreshed using refresh token
4. **Logout**: Client-side token invalidation (stateless JWT)

### Authorization
- **Role-based**: Admin vs Public access
- **Resource-level**: Profile ownership validation
- **Method-level**: @PreAuthorize annotations

### Security Headers
- CORS configured with origin whitelisting
- CSRF protection (stateful for form submissions)
- Security headers (HSTS, X-Frame-Options, etc.)
- Input validation at controller and service layers

## 📡 News Aggregator System

### Source Configuration
```yaml
app.news.sources:
  - key: RUNDOWN_AI
    type: HTML
    feed-url: https://www.therundown.ai/archive
    item-selector: "a[href*='/p/']"
  - key: TECHCRUNCH_AI
    type: RSS
    feed-url: https://techcrunch.com/category/artificial-intelligence/feed/
```

### Fetching Strategies
- **RSS Feeds**: Standard RSS/Atom parsing with Jsoup
- **HTML Scraping**: CSS selector-based extraction
- **Rate Limiting**: Configurable delays between requests
- **Error Handling**: Circuit breaker pattern with retry logic

### DeepSeek Integration
```java
public ArticleAnalysis analyze(String title, String source, String url, String excerpt) {
    // Structured prompt for consistent JSON output
    String systemPrompt = """
        You are an analyst covering AI research and news.
        Return JSON with: summary, keyPoints, keywords, category, impactLevel
        """;
    
    return deepSeekClient.analyze(title, source, url, excerpt);
}
```

## 🌐 Internationalization System

### Localization Architecture
- **Frontend**: Runtime locale switching with React Context
- **Backend**: LocalizedText entity with fallback chains
- **Storage**: JSON column with en/zhHant/zhHans fields
- **Resolution**: Locale → fallback → English → any available

### Translation Flow
```
User selects locale → Context updates → UI re-renders
                              ↓
Database stores LocalizedText → API returns resolved text
                              ↓
Editor preserves all translations when editing one locale
```

## 🗃️ Database Schema

### Core Tables
```sql
-- Profile hierarchy
profiles (id, slug, full_name, published, ...)
experiences (id, profile_id, company_name, start_date, ...)
job_positions (id, experience_id, title_i18n, start_date, ...)
responsibilities (id, position_id, content_i18n, display_order)

-- News aggregation
news_articles (id, source_key, title, url, excerpt, ...)
news_ingestion_runs (id, started_at, status, source_count, ...)

-- Authentication
users (id, username, password_hash, display_name, ...)
```

### Index Strategy
- **Profile slug**: Unique index for public lookup
- **Foreign keys**: All relationship columns indexed
- **News articles**: Composite index on (source_key, published_at)
- **Search optimization**: Full-text indexes on localized content

## ⚡ Performance Considerations

### Frontend Optimization
- **Code Splitting**: Next.js automatic route-based splitting
- **Image Optimization**: Next.js Image component with automatic optimization
- **Bundle Analysis**: Regular bundle size monitoring
- **Caching Strategy**: Static generation with ISR for public pages

### Backend Optimization
- **Database**: Connection pooling with HikariCP
- **Caching**: Spring Cache with Redis (configurable)
- **Batch Operations**: JPA batch inserts/updates
- **Lazy Loading**: Strategic fetch planning to avoid N+1 queries

### Scalability Design
- **Stateless Architecture**: Enables horizontal scaling
- **Database**: Read replicas for news queries
- **News Aggregation**: Background job with configurable concurrency
- **File Storage**: Cloud storage integration ready

## 🧪 Testing Strategy

### Test Pyramid Implementation
```
        ┌─────────────────┐
        │  E2E Tests (5%) │
        └─────────────────┘
        ┌─────────────────┐
        │ Integration (15%)│
        └─────────────────┘
        ┌─────────────────┐
        │   Unit (80%)    │
        └─────────────────┘
```

### Test Coverage Goals
- **Unit Tests**: 80%+ coverage for business logic
- **Integration Tests**: API contracts and database interactions
- **E2E Tests**: Critical user journeys
- **Performance Tests**: Load testing for news aggregation

## 🔄 Deployment Pipeline

### CI/CD Flow
```yaml
# GitHub Actions Workflow
on: [push, pull_request]
jobs:
  test:
    - Frontend: npm test, lint, build
    - Backend: mvn test, integration tests
  build:
    - Docker: Build multi-stage images
    - Artifacts: Push to container registry
  deploy-sit:
    - Environment: SIT with test data
    - Validation: Smoke tests, API checks
  deploy-prod:
    - Approval: Manual approval gate
    - Blue-Green: Zero-downtime deployment
```

## 📊 Monitoring & Observability

### Metrics Collection
- **Application**: Spring Boot Actuator with Prometheus
- **Business**: Custom metrics for news ingestion success rates
- **User**: Anonymous usage analytics for feature optimization

### Logging Strategy
- **Structured Logging**: JSON format with correlation IDs
- **Log Levels**: Configurable per environment
- **Centralized**: ELK stack or cloud logging integration

### Alerting
- **Critical**: Service downtime, authentication failures
- **Warning**: News source failures, high error rates
- **Info**: Deployment events, configuration changes

---

## 🏁 Technical Constraints & Decisions

### Constraints from CLAUDE.md
1. **Markdown Parsing**: Limited to `marked` library only
2. **State Management**: Native React only (no Redux/Zustand)
3. **Design System**: Apple-inspired minimalist aesthetics
4. **Performance**: 150ms debounce on editor inputs
5. **Type Safety**: Strict TypeScript, no `any` usage

### Architectural Decisions
1. **Monolithic Backend**: Simplicity over microservices for v1
2. **Client-side i18n**: Better UX than server-side rendering
3. **JWT over Sessions**: Stateless scaling for admin portal
4. **CSS Selector Scraping**: Flexibility over hardcoded parsers

### Future Extension Points
1. **Plugin System**: Additional news source parsers
2. **Export Features**: PDF resume generation
3. **Analytics Dashboard**: Visitor statistics
4. **WebSocket Support**: Real-time collaboration