# API Documentation: Jack Wong Personal Profile Management System

## 📋 Overview

This document provides comprehensive API documentation for the Jack Wong Personal Profile Management System. The API follows RESTful principles and uses JSON for request/response payloads.

## 🔑 Base URL

### Local Development
```
http://localhost:8080/api/v1
```

### SIT Environment
```
http://localhost:8080/api/v1
```

### Production (Example)
```
https://api.jackwongprofile.com/api/v1
```

## 📊 API Response Format

### Success Response
```json
{
  "success": true,
  "code": 20000,
  "message": "Operation successful",
  "data": { /* Response payload */ },
  "errors": [],
  "timestamp": "2024-01-01T00:00:00Z",
  "traceId": "correlation-id"
}
```

### Error Response
```json
{
  "success": false,
  "code": 40001,
  "message": "Validation failed",
  "data": null,
  "errors": [
    {
      "field": "email",
      "message": "Email must be valid"
    }
  ],
  "timestamp": "2024-01-01T00:00:00Z",
  "traceId": "correlation-id"
}
```

### Common Status Codes
- `20000`: Success
- `40001`: Validation error
- `40100`: Unauthorized
- `40300`: Forbidden
- `40400`: Resource not found
- `50000`: Internal server error

## 🔐 Authentication

### Login
**POST** `/auth/login`

Authenticates a user and returns JWT tokens.

#### Request Body
```json
{
  "username": "admin",
  "password": "ChangeMe123!"
}
```

#### Response
```json
{
  "success": true,
  "code": 20000,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400000,
    "user": {
      "id": 1,
      "username": "admin",
      "displayName": "Administrator",
      "role": "ADMIN"
    }
  },
  "errors": [],
  "timestamp": "2024-01-01T00:00:00Z",
  "traceId": "correlation-id"
}
```

### Refresh Token
**POST** `/auth/refresh`

Refreshes an expired access token using a refresh token.

#### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response
Same structure as login response with new tokens.

## 👤 Public Profile API

### Get Published Profile
**GET** `/public/profile`

Retrieves the published profile for public display.

#### Response
```json
{
  "success": true,
  "code": 20000,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "slug": "jack-wong",
    "fullName": "Jack Wong",
    "headline": "Full-Stack Developer & AI Enthusiast",
    "jobTitle": "Senior Software Engineer",
    "companyName": "Tech Innovations Inc.",
    "location": "Hong Kong",
    "summary": "Experienced software engineer with 8+ years...",
    "avatarUrl": "/avatars/jack-wong.jpg",
    "contact": {
      "email": "jack.wong@example.com",
      "linkedin": "https://linkedin.com/in/jackwong",
      "github": "https://github.com/jackwong",
      "twitter": "https://twitter.com/jackwongdev"
    },
    "experiences": [
      {
        "id": 1,
        "companyName": "Tech Innovations Inc.",
        "companyWebsite": "https://techinnovations.com",
        "location": "Hong Kong",
        "startDate": "2020-03-01",
        "endDate": null,
        "current": true,
        "description": "Leading full-stack development teams...",
        "positions": [
          {
            "id": 1,
            "title": "Senior Software Engineer",
            "startDate": "2022-01-01",
            "endDate": null,
            "current": true,
            "responsibilities": [
              {
                "id": 1,
                "content": "Lead development of microservices architecture",
                "displayOrder": 1
              }
            ]
          }
        ]
      }
    ],
    "educations": [
      {
        "id": 1,
        "institution": "University of Hong Kong",
        "degree": "Bachelor of Science in Computer Science",
        "fieldOfStudy": "Computer Science",
        "startDate": "2012-09-01",
        "endDate": "2016-05-31",
        "grade": "First Class Honors",
        "description": "Specialized in software engineering and AI",
        "activities": "President of Computer Science Society"
      }
    ],
    "certifications": [
      {
        "id": 1,
        "name": "AWS Certified Solutions Architect",
        "issuingOrganization": "Amazon Web Services",
        "issueDate": "2021-03-15",
        "expirationDate": "2024-03-15",
        "credentialId": "AWS-123456",
        "credentialUrl": "https://aws.amazon.com/certification"
      }
    ]
  },
  "errors": [],
  "timestamp": "2024-01-01T00:00:00Z",
  "traceId": "correlation-id"
}
```

### Get Profile by Slug
**GET** `/public/profile/{slug}`

Retrieves a specific profile by its URL-friendly slug.

#### Path Parameters
- `slug` (string, required): Profile slug (e.g., "jack-wong")

#### Response
Same structure as `/public/profile`.

## 📰 Public News API

### Search News Articles
**GET** `/public/news`

Searches and retrieves news articles with filtering and pagination.

#### Query Parameters
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `q` | string | Search query (title, excerpt, keywords) | `""` |
| `source` | string | Filter by source (RUNDOWN_AI, TECHCRUNCH_AI, etc.) | `""` |
| `category` | string | Filter by category (RESEARCH, INDUSTRY, etc.) | `""` |
| `impactLevel` | string | Filter by impact (HIGH, MEDIUM, LOW) | `""` |
| `fromDate` | string | Start date (YYYY-MM-DD) | `""` |
| `toDate` | string | End date (YYYY-MM-DD) | `""` |
| `page` | integer | Page number (0-based) | `0` |
| `size` | integer | Page size | `20` |
| `sort` | string | Sort field (publishedAt, title) | `"publishedAt"` |
| `direction` | string | Sort direction (ASC, DESC) | `"DESC"` |

#### Response
```json
{
  "success": true,
  "code": 20000,
  "message": "News articles retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "source": "RUNDOWN_AI",
        "title": "New AI Model Breaks Performance Records",
        "url": "https://www.therundown.ai/p/new-ai-model",
        "excerpt": "Researchers at DeepMind have developed...",
        "publishedAt": "2024-01-01T10:30:00Z",
        "fetchedAt": "2024-01-01T11:00:00Z",
        "analysis": {
          "summary": "DeepMind's new model achieves 95% accuracy...",
          "keyPoints": [
            "95% accuracy on benchmark tests",
            "50% reduction in training time",
            "Open source release planned"
          ],
          "keywords": ["AI", "DeepMind", "Machine Learning"],
          "category": "RESEARCH",
          "impactLevel": "HIGH"
        }
      }
    ],
    "page": {
      "number": 0,
      "size": 20,
      "totalElements": 150,
      "totalPages": 8
    }
  },
  "errors": [],
  "timestamp": "2024-01-01T00:00:00Z",
  "traceId": "correlation-id"
}
```

### Get Specific Article
**GET** `/public/news/{id}`

Retrieves a specific news article by ID.

#### Path Parameters
- `id` (integer, required): Article ID

#### Response
Single article object with detailed analysis.

### Get News Statistics
**GET** `/public/news/stats`

Retrieves news aggregation statistics.

#### Response
```json
{
  "success": true,
  "code": 20000,
  "message": "News statistics retrieved successfully",
  "data": {
    "totalArticles": 150,
    "articlesBySource": {
      "RUNDOWN_AI": 45,
      "TECHCRUNCH_AI": 38,
      "MIT_TECH_REVIEW": 32,
      "DEEPLEARNING_AI": 25,
      "HUGGINGFACE": 10
    },
    "articlesByCategory": {
      "RESEARCH": 60,
      "INDUSTRY": 45,
      "TOOLS": 25,
      "COMMUNITY": 20
    },
    "articlesByImpact": {
      "HIGH": 30,
      "MEDIUM": 75,
      "LOW": 45
    },
    "latestIngestion": {
      "runId": 123,
      "startedAt": "2024-01-01T10:00:00Z",
      "completedAt": "2024-01-01T10:30:00Z",
      "status": "COMPLETED",
      "articlesFetched": 15,
      "sourcesProcessed": 5
    }
  },
  "errors": [],
  "timestamp": "2024-01-01T00:00:00Z",
  "traceId": "correlation-id"
}
```

## 🛠️ Admin Profile API (Authenticated)

### Update Profile
**PUT** `/admin/profiles/{id}`

Updates the main profile information.

#### Headers
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Path Parameters
- `id` (integer, required): Profile ID

#### Request Body
```json
{
  "fullName": "Jack Wong",
  "headline": {
    "en": "Full-Stack Developer & AI Enthusiast",
    "zhHans": "全栈开发工程师与AI爱好者",
    "zhHant": "全棧開發工程師與AI愛好者"
  },
  "jobTitle": "Senior Software Engineer",
  "companyName": "Tech Innovations Inc.",
  "location": "Hong Kong",
  "summary": {
    "en": "Experienced software engineer with 8+ years...",
    "zhHans": "拥有8年以上经验的软件工程师...",
    "zhHant": "擁有8年以上經驗的軟體工程師..."
  },
  "avatarUrl": "/avatars/jack-wong.jpg",
  "published": true,
  "contact": {
    "email": "jack.wong@example.com",
    "linkedin": "https://linkedin.com/in/jackwong",
    "github": "https://github.com/jackwong",
    "twitter": "https://twitter.com/jackwongdev"
  }
}
```

#### Response
Updated profile object.

### Add Experience
**POST** `/admin/profiles/{id}/experiences`

Adds a new work experience entry.

#### Request Body
```json
{
  "companyName": "Tech Innovations Inc.",
  "companyWebsite": "https://techinnovations.com",
  "location": "Hong Kong",
  "startDate": "2020-03-01",
  "endDate": null,
  "current": true,
  "description": {
    "en": "Leading full-stack development teams...",
    "zhHans": "领导全栈开发团队...",
    "zhHant": "領導全棧開發團隊..."
  },
  "positions": [
    {
      "title": {
        "en": "Senior Software Engineer",
        "zhHans": "高级软件工程师",
        "zhHant": "高級軟體工程師"
      },
      "startDate": "2022-01-01",
      "endDate": null,
      "current": true,
      "responsibilities": [
        {
          "content": {
            "en": "Lead development of microservices architecture",
            "zhHans": "领导微服务架构开发",
            "zhHant": "領導微服務架構開發"
          },
          "displayOrder": 1
        }
      ]
    }
  ]
}
```

#### Response
Created experience object with positions and responsibilities.

### Update Experience
**PUT** `/admin/profiles/{id}/experiences/{experienceId}`

Updates an existing work experience entry.

#### Path Parameters
- `id` (integer, required): Profile ID
- `experienceId` (integer, required): Experience ID

#### Request Body
Same structure as POST request.

#### Response
Updated experience object.

### Delete Experience
**DELETE** `/admin/profiles/{id}/experiences/{experienceId}`

Deletes a work experience entry.

#### Response
```json
{
  "success": true,
  "code": 20000,
  "message": "Experience deleted successfully",
  "data": null,
  "errors": [],
  "timestamp": "2024-01-01T00:00:00Z",
  "traceId": "correlation-id"
}
```

### Reorder Experiences
**POST** `/admin/profiles/{id}/experiences/reorder`

Changes the display order of work experiences.

#### Request Body
```json
{
  "experienceIds": [3, 1, 2]
}
```

#### Response
```json
{
  "success": true,
  "code": 20000,
  "message": "Experiences reordered successfully",
  "data": null,
  "errors": [],
  "timestamp": "2024-01-01T00:00:00Z",
  "traceId": "correlation-id"
}
```

## 🎓 Education & Certification API

Similar patterns to Experience API:

### Education Endpoints
- **POST** `/admin/profiles/{id}/educations` - Add education
- **PUT** `/admin/profiles/{id}/educations/{educationId}` - Update education  
- **DELETE** `/admin/profiles/{id}/educations/{educationId}` - Delete education
- **POST** `/admin/profiles/{id}/educations/reorder` - Reorder education

### Certification Endpoints
- **POST** `/admin/profiles/{id}/certifications` - Add certification
- **PUT** `/admin/profiles/{id}/certifications/{certificationId}` - Update certification
- **DELETE** `/admin/profiles/{id}/certifications/{certificationId}` - Delete certification
- **POST** `/admin/profiles/{id}/certifications/reorder` - Reorder certifications

## 📡 Admin News API (Authenticated)

### Manual News Ingestion
**POST** `/admin/news/ingest`

Triggers manual news ingestion from configured sources.

#### Request Body
```json
{
  "sourceKeys": ["RUNDOWN_AI", "TECHCRUNCH_AI"],
  "force": false
}
```

#### Response
```json
{
  "success": true,
  "code": 20000,
  "message": "News ingestion started",
  "data": {
    "runId": 124,
    "status": "STARTED",
    "startedAt": "2024-01-01T11:00:00Z",
    "sources": ["RUNDOWN_AI", "TECHCRUNCH_AI"]
  },
  "errors": [],
  "timestamp": "2024-01-01T00:00:00Z",
  "traceId": "correlation-id"
}
```

### Analyze Pending Articles
**POST** `/admin/news/analyze`

Triggers DeepSeek analysis for pending articles.

#### Request Body
```json
{
  "articleIds": [1, 2, 3],
  "batchSize": 10
}
```

#### Response
```json
{
  "success": true,
  "code": 20000,
  "message": "Analysis started for 3 articles",
  "data": {
    "totalArticles": 3,
    "batchSize": 10,
    "status": "STARTED"
  },
  "errors": [],
  "timestamp": "2024-01-01T00:00:00Z",
  "traceId": "correlation-id"
}
```

### Analyze Specific Article
**POST** `/admin/news/{id}/analyze`

Analyzes a specific article with DeepSeek.

#### Response
Updated article with analysis results.

### Delete Article
**DELETE** `/admin/news/{id}`

Deletes a news article.

## 🔍 Search Parameters Reference

### News Source Values
- `RUNDOWN_AI`: The Rundown AI newsletter
- `TECHCRUNCH_AI`: TechCrunch AI section
- `MIT_TECH_REVIEW`: MIT Technology Review
- `DEEPLEARNING_AI`: The Batch by DeepLearning.AI
- `HUGGINGFACE`: Hugging Face Daily Papers

### Category Values
- `RESEARCH`: Academic research papers
- `INDUSTRY`: Industry news and applications
- `TOOLS`: New tools and libraries
- `COMMUNITY`: Community events and discussions
- `POLICY`: AI policy and regulations

### Impact Level Values
- `HIGH`: Major breakthroughs or announcements
- `MEDIUM`: Significant developments
- `LOW`: Minor updates or routine news

## 🧪 API Testing

### Using Swagger UI
Access the interactive API documentation at:
```
http://localhost:8080/swagger-ui.html
```

### Example cURL Commands

#### Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"ChangeMe123!"}'
```

#### Get Public Profile
```bash
curl http://localhost:8080/api/v1/public/profile
```

#### Search News Articles
```bash
curl "http://localhost:8080/api/v1/public/news?q=AI&page=0&size=10"
```

#### Update Profile (Authenticated)
```bash
curl -X PUT http://localhost:8080/api/v1/admin/profiles/1 \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Updated Name","published":true}'
```

## ⚠️ Rate Limiting

- Public endpoints: 100 requests per minute per IP
- Admin endpoints: 1000 requests per minute per user
- News ingestion: 1 request per 5 minutes
- DeepSeek analysis: 10 requests per minute

## 🔄 Webhook Support (Future)

The API will support webhooks for:
- Profile updates
- New news articles
- Analysis completion
- System alerts

## 📊 Monitoring Endpoints

### Health Check
```
GET /actuator/health
```

### Metrics
```
GET /actuator/metrics
```

### API Documentation
```
GET /v3/api-docs
```

---

**Note**: All dates and times are in ISO 8601 format (UTC). All text fields support localization with English, Simplified Chinese, and Traditional Chinese variants.