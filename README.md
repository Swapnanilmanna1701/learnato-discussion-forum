# 🗨️ Discussion Forum Microservice

A modern, real-time discussion forum built with Next.js 15, featuring threaded conversations, user authentication, image uploads, and upvoting. Designed as a modular microservice for the Learnato ecosystem.

![Next.js](https://img.shields.io/badge/Next.js-15.3-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwindcss)
![Better Auth](https://img.shields.io/badge/Better--Auth-1.3-orange)

## 📋 Table of Contents

- [Purpose & Vision](#purpose--vision)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [File Structure](#file-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Docker Setup](#docker-setup)
- [Future Enhancements](#future-enhancements)

---

## 🎯 Purpose & Vision

### Purpose
The Discussion Forum Microservice enables learners and instructors within the Learnato ecosystem to engage in dynamic, real-time discussions. It allows users to post questions, share insights, upvote valuable content, and reply in threads — all in an interface designed for collaboration and speed.

### Vision
To empower learning through conversation by creating a lightweight, modular, and scalable forum system that integrates seamlessly into the Learnato platform or runs independently as a microservice.

---

## ✨ Features

### Core Features (MVP)
- ✅ **User Authentication** - Secure login/register with Better Auth
- ✅ **Create Posts** - Rich text posts with title and body content
- ✅ **List Posts** - View all posts sorted by upvotes or date
- ✅ **View Post Details** - Open specific posts with full content
- ✅ **Threaded Replies** - Add nested replies up to 5 levels deep
- ✅ **Upvoting** - Upvote posts and replies
- ✅ **Image Upload** - Direct device uploads for posts and profile pictures
- ✅ **Search & Filter** - Search posts by keywords, author, or content
- ✅ **User Profiles** - Manage profile information and bio
- ✅ **Real-time Updates** - Automatic polling for new posts and replies
- ✅ **Responsive UI** - Mobile-first design with Tailwind CSS

### Bonus Features
- 🎨 **Emoji Picker** - Add emojis to posts and replies
- 🖼️ **Multi-Image Support** - Upload multiple images per post
- 🔍 **Advanced Sorting** - Sort by date or upvotes (ascending/descending)
- 👤 **User Avatars** - Profile pictures with fallback initials
- 🔔 **Toast Notifications** - Real-time success/error feedback

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Next.js 15 (App Router) |
| **Styling** | Tailwind CSS 4, Shadcn/UI Components |
| **Backend** | Next.js API Routes |
| **Database** | PostgreSQL (Turso) with Drizzle ORM |
| **Authentication** | Better Auth 1.3 |
| **Image Upload** | Base64 encoding with file validation |
| **Real-time** | Polling mechanism with toast notifications |
| **Deployment** | Vercel (or Docker-ready) |

---

## 📁 File Structure

```
discussion-forum/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/[...all]/        # Authentication endpoints
│   │   │   ├── posts/                # Post CRUD operations
│   │   │   │   ├── [id]/             # Individual post operations
│   │   │   │   │   ├── replies/      # Reply management
│   │   │   │   │   └── upvote/       # Post upvoting
│   │   │   │   └── route.ts          # List & create posts
│   │   │   ├── replies/[id]/         # Reply upvote/downvote
│   │   │   ├── upload/               # Image upload endpoint
│   │   │   ├── profile/              # User profile management
│   │   │   └── users/                # User operations
│   │   ├── login/                    # Login page
│   │   ├── register/                 # Registration page
│   │   ├── profile/                  # User profile page
│   │   ├── posts/[id]/               # Post detail page
│   │   ├── layout.tsx                # Root layout with Toaster
│   │   ├── page.tsx                  # Main forum page
│   │   └── globals.css               # Global styles
│   ├── components/
│   │   └── ui/                       # Shadcn UI components
│   ├── db/
│   │   ├── schema.ts                 # Database schema (Drizzle)
│   │   ├── index.ts                  # Database connection
│   │   └── seeds/                    # Database seeders
│   ├── lib/
│   │   ├── auth.ts                   # Better Auth server config
│   │   ├── auth-client.ts            # Better Auth client config
│   │   └── utils.ts                  # Utility functions
│   └── hooks/                        # Custom React hooks
├── drizzle/                          # Database migrations
├── public/                           # Static assets
├── middleware.ts                     # Auth middleware (protected routes)
├── drizzle.config.ts                 # Drizzle ORM configuration
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies
├── .env                              # Environment variables
├── Dockerfile                        # Docker configuration
└── README.md                         # This file
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0 or higher
- **npm** 9.0 or higher (or **bun**, **yarn**, **pnpm**)
- **Git** for cloning the repository
- **PostgreSQL** database (or Turso account for serverless)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/your-username/discussion-forum.git

# OR clone via SSH
git clone git@github.com:your-username/discussion-forum.git

# Navigate to project directory
cd discussion-forum
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# OR using bun (faster)
bun install

# OR using yarn
yarn install

# OR using pnpm
pnpm install
```

---

## 🔐 Environment Setup

### 1. Create Environment File

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Open `.env` and add the following:

```env
# Database Configuration (Turso)
TURSO_CONNECTION_URL=your_turso_database_url
TURSO_AUTH_TOKEN=your_turso_auth_token

# Better Auth Configuration
BETTER_AUTH_SECRET=your_random_secret_key_here
BETTER_AUTH_URL=http://localhost:3000

# Optional: Google OAuth (if implementing social login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3. Generate Auth Secret

Generate a secure random secret for Better Auth:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OR using OpenSSL
openssl rand -hex 32
```

Copy the output and set it as `BETTER_AUTH_SECRET` in your `.env` file.

---

## 🗄️ Database Setup

### Option 1: Using Turso (Recommended for Production)

1. **Create a Turso account**: Visit [turso.tech](https://turso.tech)

2. **Create a new database**:
   ```bash
   turso db create discussion-forum
   ```

3. **Get connection details**:
   ```bash
   turso db show discussion-forum
   ```

4. **Generate auth token**:
   ```bash
   turso db tokens create discussion-forum
   ```

5. **Add credentials to `.env`**:
   ```env
   TURSO_CONNECTION_URL=libsql://your-database.turso.io
   TURSO_AUTH_TOKEN=your_auth_token
   ```

### Option 2: Using Local PostgreSQL

1. **Install PostgreSQL** on your machine

2. **Create a database**:
   ```sql
   CREATE DATABASE discussion_forum;
   ```

3. **Update `.env`**:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/discussion_forum
   ```

### Run Database Migrations

```bash
# Generate migrations
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed database with sample data
npm run db:seed
```

---

## 🏃 Running the Application

### Development Mode

```bash
# Using npm
npm run dev

# OR using bun
bun dev

# OR using yarn
yarn dev

# OR using pnpm
pnpm dev
```

The application will be available at **http://localhost:3000**

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Development Scripts

```bash
# Lint code
npm run lint

# Type check
npm run type-check

# Database operations
npm run db:push      # Push schema changes
npm run db:generate  # Generate migrations
npm run db:studio    # Open Drizzle Studio (database GUI)
```

---

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sign-up` | Register new user |
| POST | `/api/auth/sign-in` | Login user |
| POST | `/api/auth/sign-out` | Logout user |
| GET | `/api/auth/session` | Get current session |

### Posts Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | List all posts (supports ?sort=date\|upvotes&order=asc\|desc) |
| POST | `/api/posts` | Create new post (requires auth) |
| GET | `/api/posts/:id` | Get post by ID |
| POST | `/api/posts/:id/upvote` | Upvote a post |

### Replies Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts/:id/replies` | Get replies for a post |
| POST | `/api/posts/:id/replies` | Add reply to post (requires auth) |
| POST | `/api/replies/:id/upvote` | Upvote a reply |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get current user profile (requires auth) |
| PUT | `/api/profile` | Update user profile (requires auth) |
| POST | `/api/upload` | Upload image (requires auth) |

### Example API Usage

#### Create a Post
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "My First Post",
    "content": "Hello, Forum!",
    "images": ["base64_encoded_image"]
  }'
```

#### Get All Posts
```bash
curl http://localhost:3000/api/posts?sort=upvotes&order=desc
```

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push code to GitHub**

2. **Import project to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository

3. **Add environment variables** in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from your `.env` file

4. **Deploy**:
   - Vercel will automatically deploy on every push to main branch

### Deploy to Other Platforms

The application can be deployed to:
- **Netlify** - Similar to Vercel
- **Railway** - With PostgreSQL database
- **Render** - With managed PostgreSQL
- **AWS/GCP/Azure** - Using Docker container

---

## 🐳 Docker Setup

### Dockerfile

Create a `Dockerfile` in the root directory:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - TURSO_CONNECTION_URL=${TURSO_CONNECTION_URL}
      - TURSO_AUTH_TOKEN=${TURSO_AUTH_TOKEN}
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - BETTER_AUTH_URL=http://localhost:3000
    env_file:
      - .env
```

### Run with Docker

```bash
# Build image
docker build -t discussion-forum .

# Run container
docker run -p 3000:3000 --env-file .env discussion-forum

# OR use Docker Compose
docker-compose up
```

---

## 🔮 Future Enhancements

### Planned Features
- [ ] **WebSocket Integration** - True real-time updates with Socket.io
- [ ] **AI Assistant** - Suggest similar posts, auto-summarize threads
- [ ] **Mark as Answered** - Instructor can mark questions as resolved
- [ ] **Gamification** - Points and badges for participation
- [ ] **AI Moderation** - Auto-detect spam or inappropriate content
- [ ] **Thread Subscriptions** - Email notifications for new replies
- [ ] **Analytics Dashboard** - Track engagement metrics
- [ ] **Rich Text Editor** - Markdown support with preview
- [ ] **Tags & Categories** - Organize posts by topic
- [ ] **User Mentions** - @mention users in replies
- [ ] **Dark Mode** - Theme switching support

### Stretch Goals
- [ ] **Elasticsearch** - Advanced search capabilities
- [ ] **Redis Cache** - Improve performance
- [ ] **CDN Integration** - CloudFlare/CloudFront for images
- [ ] **Rate Limiting** - Prevent spam and abuse
- [ ] **Admin Dashboard** - Content moderation tools
- [ ] **Mobile App** - React Native version

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📧 Contact & Support

- **Project Maintainer**: [Your Name](https://github.com/your-username)
- **Issues**: [GitHub Issues](https://github.com/your-username/discussion-forum/issues)
- **Documentation**: [Wiki](https://github.com/your-username/discussion-forum/wiki)

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Shadcn/UI](https://ui.shadcn.com/)
- Authentication by [Better Auth](https://better-auth.com/)
- Database powered by [Turso](https://turso.tech/)
- Icons from [Lucide](https://lucide.dev/)

---

<div align="center">
  Made with ❤️ for the Learnato ecosystem
</div>