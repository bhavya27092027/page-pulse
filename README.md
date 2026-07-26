<div align="center">

# 🚀 Page Pulse

### Production-Grade Website Audit Platform

Real-time website health monitoring with intelligent auditing, caching, concurrency control, structured logging, rate limiting, and production-ready engineering practices.

<p>

<a href="https://page-pulse-analyzer.netlify.app">
<img src="https://img.shields.io/badge/Live_Demo-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white"/>
</a>

<a href="https://page-pulse-api-production.up.railway.app/api/health">
<img src="https://img.shields.io/badge/API-Railway-7B3FE4?style=for-the-badge&logo=railway&logoColor=white"/>
</a>

<a href="https://github.com/bhavya27092027/page-pulse">
<img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github"/>
</a>

</p>

<p>

<img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react"/>

<img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white"/>

<img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white"/>

<img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white"/>

<img src="https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white"/>

<img src="https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express"/>

<img src="https://img.shields.io/badge/TypeScript_Backend-3178C6?style=flat-square&logo=typescript"/>

<img src="https://img.shields.io/badge/Jest-C21325?style=flat-square&logo=jest"/>

<img src="https://img.shields.io/badge/Supertest-Testing-success?style=flat-square"/>

<img src="https://img.shields.io/badge/Netlify-Deployed-00C7B7?style=flat-square&logo=netlify"/>

<img src="https://img.shields.io/badge/Railway-Deployed-7B3FE4?style=flat-square&logo=railway"/>

<img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square"/>

</p>

---

### 🌐 Live Application

**Frontend**  
https://page-pulse-analyzer.netlify.app/

**Backend API**  
https://page-pulse-api-production.up.railway.app/

---

### ✨ Key Highlights

⚡ Real-Time Website Auditing

📊 Interactive Analytics Dashboard

🚀 Production-Ready Express Backend

⚙ Intelligent Response Caching

🔄 FIFO Concurrency Queue

🛡 Rate Limiting & Security Middleware

📈 Response Time Analytics

🧪 Automated Testing (Jest + Supertest)

🚀 CI/CD with GitHub Actions

🌙 Dark Mode & Responsive UI

---

</div>


## 📑 Table of Contents

- [✨ Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [🏗 System Architecture](#-system-architecture)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [🔑 Environment Variables](#-environment-variables)
- [📡 API Documentation](#-api-documentation)
- [🧪 Testing](#-testing)
- [🚀 Deployment](#-deployment)
- [🏛 System Design](#-system-design)
- [🧩 Backend Architecture](#-backend-architecture)
- [✅ Code Quality](#-code-quality)
- [♿ Accessibility](#-accessibility)
- [⚡ Performance Optimizations](#-performance-optimizations)
- [🔒 Security](#-security)
- [🚀 Future Improvements](#-future-improvements)
- [🤖 AI Usage](#-ai-usage)
- [📄 License](#-license)


# ✨ Features

| Category | Feature | Description |
|-----------|----------|-------------|
| 🌐 Core Audit | Website Analysis | Checks HTTP status, reachability, response time, page title, and cache status |
| ✅ Validation | URL Validation | Client and server-side validation using Zod |
| ⏱ Reliability | Request Timeout | Automatically aborts long-running requests after 5 seconds |
| ⚡ Performance | Response Cache | Configurable in-memory cache with 10-minute TTL |
| 🚦 Concurrency | Queue Management | Supports up to 10 simultaneous audits with FIFO scheduling |
| 🛡 Security | Rate Limiting | Protects API against abuse with IP-based request limits |
| 📋 Logging | Structured Logs | Winston logging with request IDs, timing, IP address, and status codes |
| ❌ Error Handling | Unified API Responses | Standardized success/error response format |
| 🕘 Dashboard | Recent History | Stores the latest audit history in memory and local storage |
| 📥 Export | JSON Download | Download audit reports in JSON format |
| 📋 Clipboard | Copy Results | Copy API response with a single click |
| 🎨 UI | Loading Skeleton | Animated shimmer placeholders during audits |
| 📊 Analytics | Charts | Response time trends and HTTP status distribution |
| 🌙 UX | Dark Mode | System-aware theme with persistent preference |
| ⌨ Productivity | Keyboard Shortcuts | Quick actions for search, theme toggle, rerun, and reset |
| 📱 Responsive | Mobile Support | Optimized for desktop, tablet, and mobile devices |
| 🔐 Security | Best Practices | Helmet, CORS allowlist, input sanitization, environment-based configuration |

---

# 🛠 Tech Stack

## Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Framer Motion
- React Hook Form
- Axios
- Zod
- Recharts
- Lucide Icons

---

## Backend

- Node.js 20
- Express.js
- TypeScript
- Winston
- Helmet
- CORS
- Compression
- express-rate-limit
- node-cache
- UUID
- Zod

---

## Testing

- Jest
- Supertest

---

## DevOps

- GitHub Actions
- Netlify
- Railway

---

# 🏗 System Architecture

```text
                    POST /api/audit
+----------------+ -----------------------> +----------------+
|                |                          |                |
|   React App    |                          | Express API    |
|   (Netlify)    | <----------------------- |   (Railway)    |
|                |      JSON Response       |                |
+----------------+                          +--------+-------+
                                                     |
                                                     |
                                            fetch() with timeout
                                                     |
                                                     v
                                            +----------------+
                                            | Target Website |
                                            +----------------+
                                                     |
                           +-------------------------+-------------------------+
                           |                         |                         |
                           v                         v                         v
                     Response Cache          Audit Queue             History Store
```

---

# ⚙ Production Engineering

The project follows production-oriented backend architecture and engineering practices instead of being a simple CRUD application.

### Backend Capabilities

- Configurable caching layer
- FIFO concurrency queue
- Request timeout handling
- Centralized error handling
- Structured request logging
- Request ID tracing
- Environment-based configuration
- Graceful fallback support
- Health monitoring endpoint
- Rate limiting
- Security middleware
- Automated testing
- CI/CD pipeline

---

# 📁 Project Structure

```text
page-pulse/
│
├── docs/                  # System Design Documents
├── .github/workflows/     # CI/CD Pipeline
├── server/                # Express Backend
├── src/                   # React Frontend
├── public/
├── AI_USAGE.md
└── README.md
```

# 🚀 Getting Started

Follow the steps below to run Page Pulse locally.

---

## 📋 Prerequisites

Before starting, ensure you have:

- Node.js **20+**
- npm **10+**
- Git

Verify your installation:

```bash
node -v
npm -v
```

---

# 📥 Clone the Repository

```bash
git clone https://github.com/bhavya27092027/page-pulse.git

cd page-pulse
```

---

# ⚙ Backend Setup

Navigate to the backend directory.

```bash
cd server
```

Install dependencies.

```bash
npm install
```

Create a local environment file.

```bash
cp .env.example .env
```

Start the backend server.

```bash
npm run dev
```

Backend will be available at:

```
http://localhost:4000
```

---

# 💻 Frontend Setup

Return to the project root.

```bash
cd ..
```

Install frontend dependencies.

```bash
npm install
```

Create a `.env` file in the project root.

```env
VITE_API_URL=http://localhost:4000
```

Run the development server.

```bash
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

# 🔑 Environment Variables

## Backend (`server/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 4000 | Server listening port |
| NODE_ENV | development | Runtime environment |
| CORS_ORIGIN | * | Allowed frontend origins |
| AUDIT_TIMEOUT_MS | 5000 | Maximum request timeout |
| MAX_CONCURRENT_AUDITS | 10 | Concurrent audit limit |
| CACHE_TTL_SECONDS | 600 | Cache duration |
| HISTORY_LIMIT | 20 | Number of recent audits stored |
| RATE_LIMIT_WINDOW_MS | 3600000 | Rate limit window |
| RATE_LIMIT_MAX | 100 | Maximum requests per IP |

Example:

```env
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
AUDIT_TIMEOUT_MS=5000
MAX_CONCURRENT_AUDITS=10
CACHE_TTL_SECONDS=600
HISTORY_LIMIT=20
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX=100
```

---

## Frontend (`.env`)

| Variable | Example | Description |
|----------|---------|-------------|
| VITE_API_URL | http://localhost:4000 | Backend API Base URL |

Example:

```env
VITE_API_URL=http://localhost:4000
```

### Production

```env
VITE_API_URL=https://page-pulse-api-production.up.railway.app
```

> No secrets are committed to the repository. All runtime configuration is provided through environment variables.

---

# 📡 API Documentation

## Base URL

### Local

```
http://localhost:4000
```

### Production

```
https://page-pulse-api-production.up.railway.app
```

---

## POST `/api/audit`

Audit a website.

### Request

```http
POST /api/audit
Content-Type: application/json
```

```json
{
  "url": "https://openai.com"
}
```

---

### Success Response

```json
{
  "success": true,
  "data": {
    "url": "https://openai.com",
    "status": 200,
    "reachable": true,
    "responseTime": 182,
    "title": "OpenAI",
    "cached": false,
    "timestamp": "...",
    "requestId": "..."
  },
  "requestId": "..."
}
```

---

### Error Responses

| Status | Description |
|---------|-------------|
| 400 | Invalid or missing URL |
| 404 | Route not found |
| 429 | Too many requests |
| 500 | Internal server error |
| 504 | Request timeout |
| 200 | Target unreachable (`reachable: false`) |

---

## GET `/api/health`

Returns server health information.

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "uptime": "...",
    "timestamp": "..."
  }
}
```

---

## GET `/api/history`

Returns the latest audit history.

```json
{
  "success": true,
  "data": [
    ...
  ]
}
```

---

# 🧪 Testing

Backend tests are powered by **Jest** and **Supertest**.

Run all tests.

```bash
cd server

npm test
```

The test suite covers:

- API validation
- Success responses
- Error handling
- Timeout handling
- Cache behavior
- Rate limiting
- Health endpoint
- History endpoint
- Network failures
- Request validation

---

# 🚀 Deployment

## Frontend (Netlify)

Build command

```bash
npm run build
```

Publish directory

```
dist
```

Production Environment Variable

```env
VITE_API_URL=https://page-pulse-api-production.up.railway.app
```

Deploy directly from GitHub using Netlify.

---

## Backend (Railway)

Root Directory

```
server
```

Production Environment

```env
NODE_ENV=production

CORS_ORIGIN=https://page-pulse-analyzer.netlify.app
```

Health Check

```
https://page-pulse-api-production.up.railway.app/api/health
```

Railway automatically builds and deploys the backend after every push to the main branch.

# 🏛 System Design

The `docs/` directory contains detailed engineering documentation that explains the architectural decisions and production considerations behind the project.

## Documentation

| Document | Description |
|----------|-------------|
| `ARCHITECTURE.md` | Overall system architecture and request flow |
| `TECHNOLOGY_DECISIONS.md` | Technology choices and trade-offs |
| `FAILURE_MODES.md` | Failure scenarios and recovery strategies |
| `SCALABILITY.md` | Scaling considerations for high traffic |
| `CACHING.md` | Cache implementation and eviction strategy |
| `MONITORING.md` | Logging, monitoring, and observability |
| `ROLLBACK.md` | Safe deployment rollback process |
| `CONCURRENCY_AND_QUEUE.md` | Queue implementation and concurrency handling |
| `DEPLOYMENT.md` | Complete production deployment guide |

---

# 🧩 Backend Architecture

The backend follows a layered architecture to improve maintainability, scalability, and testability.

```text
Client
   │
   ▼
Routes
   │
Controllers
   │
Services
   │
Utilities
   │
External Website
```

Responsibilities are clearly separated:

- **Routes** define API endpoints.
- **Controllers** handle requests and responses.
- **Services** implement business logic.
- **Utilities** provide shared helpers.
- **Middlewares** manage validation, logging, request IDs, rate limiting, and centralized error handling.

---

# ✅ Code Quality

The project emphasizes clean architecture and production-grade engineering practices.

### Design Principles

- Separation of concerns
- Modular folder structure
- Strict TypeScript
- Reusable UI components
- Shared API contract
- Environment-based configuration
- Centralized error handling
- Consistent response structure

---

### Backend Practices

- Request validation using Zod
- Structured Winston logging
- Request ID tracing
- Graceful timeout handling
- Response caching
- FIFO audit queue
- Security middleware
- Rate limiting
- Health monitoring endpoint

---

### Frontend Practices

- Component-driven architecture
- Custom React Hooks
- Responsive layouts
- Error boundaries
- Local storage persistence
- Theme persistence
- Lazy rendering
- Type-safe API communication

---

# ♿ Accessibility

Accessibility was considered throughout the application.

Implemented features include:

- Keyboard navigation
- Focus-visible states
- ARIA labels
- Responsive layouts
- Reduced motion support
- Accessible icon buttons
- System-aware dark mode

---

# ⚡ Performance Optimizations

The application includes several optimizations for responsiveness and scalability.

- Request caching
- Configurable concurrency limits
- Lazy rendering
- Memoized background effects
- Code splitting
- Optimized bundle loading
- Configurable timeout handling
- Persistent frontend history

---

# 🔒 Security

Production security measures include:

- Helmet security headers
- CORS allowlist
- Input validation
- Environment variables
- Rate limiting
- Request sanitization
- Centralized error handling

---

# 🧪 Testing Strategy

Testing focuses on both API correctness and service reliability.

Covered areas include:

- Successful audit requests
- URL validation
- Timeout scenarios
- Cache behavior
- Network failures
- Rate limiting
- Health endpoint
- History endpoint
- Error responses

---

# 🚀 Future Improvements

Potential enhancements include:

- Redis-backed distributed cache
- PostgreSQL audit history
- BullMQ background workers
- Prometheus metrics
- Grafana dashboards
- Server-Sent Events (SSE)
- WebSocket live updates
- User authentication
- Per-user audit history
- SSRF protection
- Multi-region deployment

---

# 🤖 AI Usage

AI assisted with:

- Initial project scaffolding
- Documentation drafting
- Architecture brainstorming

All implementation, debugging, testing, optimization, production configuration, UI refinement, deployment, and engineering decisions were reviewed, customized, and finalized by the developer.

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Author

**Bhavya Jain**

B.Tech CSE (AI & ML)

GitHub: https://github.com/bhavya27092027

LinkedIn: https://www.linkedin.com/in/bhavya27092027/

---

## ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.

It helps others discover the project and supports future development.

---

<p align="center">

Made with ❤️ using React, TypeScript, Express & Node.js

</p>
