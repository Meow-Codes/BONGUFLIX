# BonguFlix Server API

The backend API server for BonguFlix - a modern streaming platform built with Express.js, TypeScript, and PostgreSQL.

## 🚀 Overview

This server provides a comprehensive REST API for the BonguFlix streaming platform, handling user authentication, media management, search functionality, and personalized recommendations.

## 🏗️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.2.1
- **Database**: PostgreSQL with connection pooling
- **Cache**: Redis for session management and API caching
- **Search**: Typesense for fast full-text search
- **Authentication**: JWT with bcryptjs for password hashing
- **File Storage**: Cloudinary for media asset management
- **Security**: Helmet, CORS, rate limiting, input validation

## 📁 Project Structure

```
server/
├── src/
│   ├── config/              # Database and service configurations
│   │   ├── db.ts           # PostgreSQL connection setup
│   │   ├── typesense.ts    # Typesense search configuration
│   │   └── typesense.schema.ts # Search schema definitions
│   ├── controllers/         # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── media.controller.ts
│   │   ├── movie.controller.ts
│   │   ├── recommend.controller.ts
│   │   ├── tv.controller.ts
│   │   └── user.controller.ts
│   ├── middleware/          # Custom middleware
│   │   ├── auth.middleware.ts
│   │   └── slug.middleware.ts
│   ├── routes/             # API route definitions
│   │   ├── auth.routes.ts
│   │   ├── media.routes.ts
│   │   ├── recommend.routes.ts
│   │   └── user.routes.ts
│   ├── services/           # Business logic layer
│   │   ├── auth.service.ts
│   │   ├── genre.service.ts
│   │   ├── home.service.ts
│   │   ├── movie.service.ts
│   │   ├── person.service.ts
│   │   ├── search.service.ts
│   │   ├── tv.service.ts
│   │   └── user.service.ts
│   ├── utils/              # Helper functions
│   │   ├── cache.ts
│   │   ├── homePersonalize.ts
│   │   ├── mediaHelpers.ts
│   │   ├── pagination.ts
│   │   ├── slugGenerator.ts
│   │   └── typesenseSync.ts
│   ├── types/              # TypeScript type definitions
│   │   └── media.types.ts
│   ├── data/               # Static data
│   │   └── onboardingKeywords.ts
│   ├── scripts/            # Database and utility scripts
│   │   ├── createTypesenseCollection.ts
│   │   └── syncToTypesense.ts
│   └── app.ts              # Main application entry point
├── package.json
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Redis 6+
- Typesense 0.25+ (for search functionality)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   
   ```env
   # Server Configuration
   PORT=6942
   NODE_ENV=development
   
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/bonguflix
   
   # Redis
   REDIS_URL=redis://localhost:6379
   
   # Typesense Search
   TYPESENSE_API_KEY=your-typesense-api-key
   TYPESENSE_HOST=localhost
   TYPESENSE_PORT=8108
   TYPESENSE_PROTOCOL=http
   
   # JWT Authentication
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   
   # Cloudinary (for media assets)
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-cloudinary-key
   CLOUDINARY_API_SECRET=your-cloudinary-secret
   
   # CORS Configuration
   FRONTEND_URL=http://localhost:3000
   BACKEND_URL=http://localhost:6942
   FRONTEND_TEST_URL=http://localhost:3001
   ```

3. **Database Setup**
   
   Ensure PostgreSQL is running and create the database:
   ```sql
   CREATE DATABASE bonguflix;
   ```

4. **Typesense Setup** (Optional but recommended)
   
   Start Typesense server:
   ```bash
   docker run -p 8108:8108 typesense/typesense:0.25.0 \
     --data-dir /tmp/typesense-data \
     --api-key=xyz \
     --enable-cors
   ```

## 🚀 Running the Server

### Development Mode
```bash
npm run dev
```
This starts the server with hot reload using `tsx watch`.

### Production Mode
```bash
npm run build
npm start
```

### Typesense Management
```bash
# Create Typesense collection
npm run ts:create

# Sync data to Typesense
npm run ts:sync

# Recreate and sync (useful for schema changes)
npm run ts:resync
```

## 📚 API Documentation

### Base URL
- Development: `http://localhost:6942`
- Production: `https://your-domain.com`

### Authentication
The API uses JWT tokens for authentication. Include the token in the `Authorization` header:
```
Authorization: Bearer <jwt-token>
```

### Rate Limiting
- **Auth endpoints**: 20 requests per 15 minutes
- **Media endpoints**: 300 requests per minute
- **Other endpoints**: Standard limits apply

### Endpoints

#### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | User registration | No |
| POST | `/login` | User login | No |
| POST | `/logout` | User logout | Yes |
| GET | `/session` | Get current session | No |
| DELETE | `/sessions` | Logout all devices | Yes |

#### Users (`/api/user`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |
| GET | `/preferences` | Get user preferences | Yes |
| PUT | `/preferences` | Update preferences | Yes |
| GET | `/watch-history` | Get watch history | Yes |
| POST | `/watch-history` | Add to watch history | Yes |

#### Media (`/api/media`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/movies` | Get movies list | No |
| GET | `/tv-shows` | Get TV shows list | No |
| GET | `/trending` | Get trending content | No |
| GET | `/featured` | Get featured content | No |
| GET | `/:id` | Get media details | No |
| GET | `/:id/similar` | Get similar media | No |

#### Search (`/api/search`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Search content | No |
| GET | `/suggestions` | Get search suggestions | No |
| GET | `/autocomplete` | Autocomplete search | No |

#### Recommendations (`/api/recommend`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get personalized recommendations | Yes |
| GET | `/similar/:id` | Get similar content recommendations | No |
| GET | `/trending` | Get trending recommendations | No |

### Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Paginated Response:**
```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## 🔧 Configuration

### Database Configuration
The server uses PostgreSQL with the following main tables:

- **users**: User accounts and authentication
- **media**: Movies and TV shows metadata
- **watch_history**: User viewing history
- **preferences**: User preferences and settings
- **genres**: Media genres and categories

### Redis Configuration
Redis is used for:
- Session management
- API response caching (5-minute TTL)
- Rate limiting counters

### Typesense Configuration
Typesense provides fast search capabilities with:
- Full-text search across media titles and descriptions
- Faceted search by genre, year, and other filters
- Autocomplete and search suggestions

## 🛡️ Security Features

- **Helmet**: Security headers and XSS protection
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: Prevent API abuse and DDoS attacks
- **Input Validation**: Request body validation and sanitization
- **Password Hashing**: bcryptjs for secure password storage
- **JWT Tokens**: Secure session management
- **Environment Variables**: Sensitive data protection

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📦 Deployment

### Environment Setup
1. Set production environment variables
2. Configure production database
3. Set up Redis cluster
4. Configure Typesense cluster

### Docker Deployment
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 6942
CMD ["npm", "start"]
```

### Health Checks
- `/healthz` - Basic health check
- `/readyz` - Readiness probe
- `/debug/cache` - Cache statistics (development only)

## 🔍 Monitoring & Logging

### Application Monitoring
- Request/response logging
- Error tracking and reporting
- Performance metrics
- Database query monitoring

### Health Monitoring
```bash
# Check server health
curl http://localhost:6942/healthz

# Check readiness
curl http://localhost:6942/readyz
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Add JSDoc comments for public functions
- Maintain test coverage above 80%

## 📝 Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm test` | Run test suite |
| `npm run ts:create` | Create Typesense collection |
| `npm run ts:sync` | Sync data to Typesense |
| `npm run ts:resync` | Recreate and sync Typesense |

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env
   - Ensure database exists

2. **Redis Connection Error**
   - Check Redis server status
   - Verify REDIS_URL in .env
   - Check network connectivity

3. **Typesense Errors**
   - Verify Typesense server is running
   - Check API key configuration
   - Run `npm run ts:create` to setup collection

4. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure proper token format in headers

### Debug Mode
Enable debug logging by setting:
```env
DEBUG=*
NODE_ENV=development
```

## 📄 License

This project is licensed under the ISC License.

---

**Built with ❤️ for the BonguFlix streaming platform**
