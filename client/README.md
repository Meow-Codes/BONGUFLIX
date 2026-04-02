# BonguFlix Client

The frontend application for BonguFlix - a modern streaming platform built with Next.js 16, React 19, and TailwindCSS.

## 🎬 Overview

This is the client-side application that provides a Netflix-like streaming experience with a sleek, responsive interface. It features user authentication, personalized dashboards, advanced search capabilities, and smooth animations.

## ✨ Key Features

- **Modern UI/UX**: Netflix-inspired interface with smooth animations
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **User Authentication**: Secure login/logout with session management
- **Personalized Dashboard**: Custom user profiles and preferences
- **Advanced Search**: Real-time search with autocomplete and suggestions
- **Media Browsing**: Browse movies, TV shows, and trending content
- **Interactive Components**: Rich UI components with Radix UI primitives
- **Dark Theme**: Built-in dark mode with smooth transitions
- **Performance Optimized**: Server-side rendering and code splitting

## 🏗️ Tech Stack

- **Framework**: Next.js 16.2.1 with App Router
- **React**: React 19.2.4 with latest features
- **TypeScript**: Full TypeScript support for type safety
- **Styling**: TailwindCSS 4.0 with custom configurations
- **UI Components**: Radix UI primitives with shadcn/ui components
- **State Management**: React Query (@tanstack/react-query) for server state
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React and React Icons
- **Forms**: React Hook Form with Zod validation
- **Notifications**: React Hot Toast and Sonner
- **Routing**: Next.js App Router with React Router DOM

## 📁 Project Structure

```
client/
├── src/
│   ├── app/                 # App Router pages and layouts
│   │   ├── about-us/       # About us page
│   │   ├── auth/           # Authentication pages
│   │   ├── dashboard/      # User dashboard
│   │   ├── onboarding/     # User onboarding flow
│   │   ├── preferences/    # User preferences
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page
│   │   └── providers.tsx   # App providers
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Base UI components (shadcn/ui)
│   │   ├── BonguFlixIntro.tsx
│   │   ├── DetailModal.tsx
│   │   ├── Hero.tsx
│   │   ├── LoadingScreen.tsx
│   │   ├── MediaCard.tsx
│   │   ├── MediaRow.tsx
│   │   ├── Navbar.tsx
│   │   ├── SearchOverlay.tsx
│   │   └── clientWrapper.tsx
│   ├── utils/             # Utility functions and API calls
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   └── styles/            # Global styles and CSS
├── public/                # Static assets
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun package manager

### Installation

1. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

2. **Environment Configuration**
   
   Create a `.env.local` file in the root directory:
   
   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:6942
   NEXT_PUBLIC_APP_NAME=BonguFlix
   
   # Optional: Analytics and monitoring
   NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
   
   # Optional: Feature flags
   NEXT_PUBLIC_ENABLE_ANALYTICS=false
   NEXT_PUBLIC_ENABLE_DEBUG=false
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. **Open in Browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🚀 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build the application for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint to check for code issues |
| `npm run lint:fix` | Fix ESLint issues automatically |

## 🎨 UI Components

### Base Components (shadcn/ui)
The application uses a comprehensive set of pre-built UI components:

- **Button**: Customizable button with variants and sizes
- **Card**: Flexible card component for content display
- **Dialog**: Modal dialogs with accessibility features
- **Dropdown**: Dropdown menus with keyboard navigation
- **Form**: Form components with validation
- **Input**: Text inputs with various states
- **Navigation**: Navigation menus and breadcrumbs
- **Tabs**: Tabbed content organization
- **Toast**: Notification system
- **Tooltip**: Hover tooltips and popovers

### Custom Components
- **MediaCard**: Display movie/show information with hover effects
- **MediaRow**: Horizontal scrolling rows of media content
- **Hero**: Landing page hero section with animations
- **SearchOverlay**: Full-screen search interface
- **Navbar**: Responsive navigation with user menu
- **DetailModal**: Modal for detailed media information

## 🎯 Features in Detail

### Authentication System
- User registration and login
- Session management with secure cookies
- Logout functionality with session cleanup
- Protected routes and authentication guards

### Personalization
- User onboarding flow with preferences
- Customizable dashboard with widgets
- Watch history tracking
- Personalized recommendations
- Theme preferences (dark/light mode)

### Media Browsing
- Trending movies and TV shows
- Genre-based browsing
- Advanced filtering and sorting
- Detailed media information
- Similar content recommendations

### Search Functionality
- Real-time search with debouncing
- Autocomplete suggestions
- Advanced search filters
- Search history
- Keyboard navigation support

### Responsive Design
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interactions
- Optimized performance for mobile devices

## 🔧 Configuration

### TailwindCSS Configuration
The application uses TailwindCSS with custom configurations:
- Custom color palette matching Netflix theme
- Responsive breakpoints for all devices
- Custom animations and transitions
- Component-specific utilities

### TypeScript Configuration
Full TypeScript support with:
- Strict type checking
- Path aliases for cleaner imports
- Component prop typing
- API response type definitions

### Next.js Configuration
- App Router for improved performance
- Image optimization with next/image
- Font optimization with next/font
- Middleware for authentication and redirects

## 🎨 Styling Guide

### Color Palette
```css
/* Primary Colors */
--netflix-red: #E50914;
--netflix-black: #141414;
--netflix-white: #FFFFFF;
--netflix-gray: #8C8C8C;

/* Background Colors */
--bg-primary: #141414;
--bg-secondary: #1A1A1A;
--bg-tertiary: #2A2A2A;
```

### Typography
- **Primary**: Bebas Neue (headings)
- **Secondary**: Montserrat (body text)
- **Monospace**: JetBrains Mono (code)

### Animations
- Smooth transitions using Framer Motion
- Custom keyframe animations
- Hover effects and micro-interactions
- Loading states and skeletons

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

## 🚀 Performance

### Optimization Features
- Automatic code splitting
- Image optimization and lazy loading
- Font optimization and subsetting
- Bundle size optimization
- Server-side rendering (SSR)
- Static site generation (SSG) where applicable

### Performance Metrics
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

## 📦 Build & Deployment

### Production Build
```bash
npm run build
```

### Deployment Options

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

#### Netlify
```bash
# Build and deploy to Netlify
npm run build
# Upload the .next directory to Netlify
```

#### Docker
```dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
COPY . .
RUN npm run build

FROM base AS runner
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔍 Development Tips

### Hot Reload
The development server supports hot module replacement for:
- React components
- CSS/Tailwind changes
- API routes
- Configuration files

### Debug Mode
Enable debug mode by setting:
```env
NEXT_PUBLIC_DEBUG=true
```

### Code Splitting
The application automatically splits code by:
- Routes (page-level splitting)
- Components (dynamic imports)
- Vendor libraries (chunk splitting)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the code style
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Style
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use semantic HTML elements
- Maintain accessibility standards
- Add proper error handling

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**
   - Check TypeScript types
   - Verify all dependencies are installed
   - Ensure environment variables are set

2. **Styling Issues**
   - Clear TailwindCSS cache
   - Check CSS import order
   - Verify responsive breakpoints

3. **API Issues**
   - Check backend server is running
   - Verify API URL in environment variables
   - Check network connectivity

### Debug Tools
- React Developer Tools
- Next.js DevTools
- Browser DevTools
- Lighthouse for performance auditing

## 📄 License

This project is licensed under the ISC License.

---

**Built with ❤️ for the BonguFlix streaming platform**
