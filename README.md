# BonguFlix

A modern, feature-rich streaming platform built with Next.js and Express.js that provides a Netflix-like experience for movies and TV shows.

## 🎬 Overview

BonguFlix is a full-stack web application that delivers a premium streaming experience with personalized recommendations, user authentication, and a sleek, responsive interface. The platform integrates with external APIs for content management and provides advanced search capabilities powered by Typesense.

## ✨ Key Features

- **Modern UI/UX**: Netflix-inspired interface with smooth animations and transitions
- **User Authentication**: Secure login/logout system with session management
- **Personalized Dashboard**: Custom user profiles with preferences and watch history
- **Advanced Search**: Powered by Typesense for fast and accurate content discovery
- **Content Management**: Comprehensive movie and TV show information
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time Updates**: Live data synchronization and caching
- **Recommendation Engine**: Personalized content suggestions

## 🏗️ Architecture

### Frontend (Client)
- **Framework**: Next.js 16.2.1 with React 19.2.4
- **Styling**: TailwindCSS with custom components
- **UI Components**: Radix UI primitives with shadcn/ui
- **State Management**: React Query for server state
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React and React Icons

### Backend (Server)
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.2.1
- **Database**: PostgreSQL with Redis for caching
- **Search**: Typesense for full-text search
- **Authentication**: JWT with bcryptjs for password hashing
- **File Storage**: Cloudinary for media assets
- **Security**: Helmet, CORS, rate limiting

## 📁 Project Structure

```
bonguflix/
├── client/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # Reusable UI components
│   │   └── utils/         # Utility functions and API calls
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── server/                # Express.js backend API
│   ├── src/
│   │   ├── config/        # Database and service configurations
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Custom middleware
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   └── utils/         # Helper functions
│   └── package.json       # Backend dependencies
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Redis server
- Typesense server (optional for search)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bonguflix
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd client
   npm install
   
   # Install backend dependencies
   cd ../server
   npm install
   ```

3. **Environment Setup**
   
   Create `.env` files in both `client` and `server` directories:
   
   **Server `.env`:**
   ```env
   PORT=6942
   DATABASE_URL=postgresql://username:password@localhost:5432/bonguflix
   REDIS_URL=redis://localhost:6379
   TYPESENSE_API_KEY=your-typesense-api-key
   TYPESENSE_HOST=localhost
   TYPESENSE_PORT=8108
   JWT_SECRET=your-jwt-secret
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-cloudinary-key
   CLOUDINARY_API_SECRET=your-cloudinary-secret
   FRONTEND_URL=http://localhost:3000
   BACKEND_URL=http://localhost:6942
   ```
   
   **Client `.env.local`:**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:6942
   NEXT_PUBLIC_APP_NAME=BonguFlix
   ```

4. **Database Setup**
   ```bash
   # Run database migrations (if available)
   cd server
   npm run db:migrate
   ```

5. **Start Development Servers**
   
   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm run dev
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   cd client
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:6942
   - API Health Check: http://localhost:6942/healthz

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Get current session

### Media Endpoints
- `GET /api/movies` - Get movies list
- `GET /api/tv-shows` - Get TV shows list
- `GET /api/media/:id` - Get media details
- `GET /api/search` - Search content

### User Endpoints
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/preferences` - Update preferences
- `GET /api/user/recommendations` - Get personalized recommendations

## 🛠️ Development

### Available Scripts

**Client:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

**Server:**
- `npm run dev` - Start development server with hot reload
- `npm run ts:create` - Create Typesense collection
- `npm run ts:sync` - Sync data to Typesense
- `npm run ts:resync` - Recreate and sync Typesense collection

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Git hooks for pre-commit checks

## 🧪 Testing

```bash
# Run frontend tests
cd client
npm test

# Run backend tests
cd server
npm test
```

## 📦 Deployment

### Frontend Deployment (Vercel)
```bash
cd client
npm run build
vercel --prod
```

### Backend Deployment (Heroku/DigitalOcean)
```bash
cd server
npm run build
# Deploy to your preferred platform
```

## 🔧 Configuration

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `TYPESENSE_API_KEY` | Typesense API key | Yes |
| `CLOUDINARY_*` | Cloudinary credentials | Yes |

### Database Schema
The application uses PostgreSQL with the following main tables:
- `users` - User accounts and profiles
- `media` - Movies and TV shows metadata
- `watch_history` - User viewing history
- `preferences` - User preferences and settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Express.js](https://expressjs.com/) - Node.js web framework
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - UI component primitives
- [Typesense](https://typesense.org/) - Fast search engine
- [TMDB](https://www.themoviedb.org/) - Movie database API

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ for the streaming community**
