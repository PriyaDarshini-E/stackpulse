# ⚡ StackPulse

**StackPulse** is a modern, high-performance developer intelligence and analytics platform. It allows users to search any GitHub developer by username, aggregate and cache their public activity with conditional GitHub API queries, visualize their languages and commit timelines, perform side-by-side multi-developer comparisons, and curate repositories with notes and tags.

---

## 🌟 Key Features

1. **GitHub Developer Analytics**:
   - Aggregated metrics: Total Stars, Followers, Public Repositories, Sampled Commits.
   - Interactive Recharts Donut Chart for top language distribution.
   - Interactive Recharts Area Chart for recent commit cadence.
   - Sortable repository list (by Stars, Last Updated, Name) with real-time text search.
2. **Side-by-Side Comparison**:
   - Compare 2 to 5 developers simultaneously.
   - Visual comparison table highlighting category leaders (most stars, followers, repos).
   - Comparative Bar Charts for metric distributions and language shares.
   - 1-click **Save Comparison** to persist named comparisons.
3. **Repository Curation & Pinning**:
   - Pin repositories directly from any developer profile.
   - Attach personal notes and custom searchable `#tags`.
   - Dedicated Pins dashboard with inline editing, tag filters, and unpinning.
4. **Resilient GitHub Caching & Rate-Limit Strategy**:
   - Server-side token support (5,000 req/hr).
   - PostgreSQL cache layer with configurable TTL (default: 60 minutes).
   - Zero GitHub calls on fresh cache hits.
   - HTTP Conditional Requests (`ETag` / `If-None-Match`), treating `304 Not Modified` as a cache hit.
   - Automatic Link header pagination for complete repository extraction.
   - Top-N (top 10) lazy deep fetch with `p-limit` concurrency (5 concurrent requests).
   - In-flight request deduplication map to prevent stampeding concurrent requests.
   - Graceful stale data fallback (`stale: true`) on GitHub 403/429 rate limit or outage.
5. **Security & Privacy**:
   - Passwords hashed with `bcryptjs` (salt rounds: 10).
   - JWT authentication middleware gating all protected resources.
   - Strict ownership isolation on pins and saved comparisons (queries scoped by `user_id`; attempts to access another user's records return 404).
   - Rate limiting on authentication routes and general endpoints.
   - Helmet security headers and CORS protection.

---

## 🏗️ Architecture & Tech Stack

```
stackpulse/
├── client/                 # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/     # Navbar, LoadingSkeleton, PinModal, ProtectedRoute
│   │   ├── context/        # AuthContext
│   │   ├── pages/          # Login, Register, Dashboard, DeveloperProfile, Compare, Pins, SavedComparisons
│   │   ├── services/       # API client with JWT bearer injection
│   │   └── types/          # TypeScript interfaces
├── server/                 # Node.js + Express + TypeScript + Prisma ORM
│   ├── prisma/             # Schema definitions and migrations
│   ├── src/
│   │   ├── config/         # Environment configuration (Zod validated)
│   │   ├── controllers/    # Express controllers
│   │   ├── middleware/     # Auth, ErrorHandler, RateLimiter
│   │   ├── routes/         # Express router modules
│   │   ├── services/       # GitHubService, AuthService
│   │   └── validations/    # Zod input schemas
├── docker-compose.yml      # Local PostgreSQL 16 container
└── package.json            # Monorepo workspaces
```

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, TanStack Query v5, Recharts.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, Zod, bcryptjs, jsonwebtoken, p-limit.
- **Database**: PostgreSQL 16 (Docker Compose).
- **Testing**: Vitest + Supertest (27 automated integration & unit tests).

---

## ⚙️ Environment Variables

Create `.env` in the root (or copy from `.env.example`):

| Variable | Description | Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres_password@localhost:5432/stackpulse?schema=public` |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens | `super-secret-jwt-key-stackpulse-change-in-production-123456` |
| `GITHUB_TOKEN` | Optional GitHub Personal Access Token (5,000 req/hr) | `""` |
| `PORT` | Backend server port | `5000` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `CACHE_TTL_MINUTES` | PostgreSQL cache lifetime before revalidation | `60` |

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18 or later
- [Docker](https://www.docker.com/) & Docker Compose

### 2. Clone and Setup Environment
```bash
git clone <repo-url>
cd StackPluse
cp .env.example .env
```
*(Add your `GITHUB_TOKEN` in `.env` if desired).*

### 3. Start PostgreSQL with Docker Compose
```bash
docker compose up -d
```
Verify the container is healthy:
```bash
docker ps
```

### 4. Install Dependencies & Migrate Database
Install dependencies across both client and server workspaces:
```bash
npm install
```

Generate Prisma client and apply migrations:
```bash
cd server
npm run prisma:push
# or: npx prisma migrate deploy
cd ..
```

### 5. Run Backend & Frontend

Start both concurrently from the root:
```bash
npm run dev:server
```
*(In a second terminal)*:
```bash
npm run dev:client
```

Or run dev mode for both workspaces:
- Server runs on: `http://localhost:5000`
- Client runs on: `http://localhost:5173`

### 6. Run Automated Tests
Execute the Vitest test suite covering authentication, developer profile, compare logic, caching TTL, and ownership isolation:
```bash
cd server
npm test
```

---

## 📡 REST API Reference

All protected endpoints require `Authorization: Bearer <token>`.

### Authentication
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new account (`email`, `password`) | No (Rate-limited) |
| `POST` | `/api/auth/login` | Login and receive JWT | No (Rate-limited) |
| `GET` | `/api/auth/me` | Fetch currently authenticated user | Yes |

### Developers & Analytics
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/developers/:username` | Fetch developer profile, metrics & cache status | Yes |
| `GET` | `/api/developers/:username/repos` | Fetch developer repositories with pin status (`sort=stars\|updated\|name`) | Yes |
| `GET` | `/api/compare?users=a,b,c` | Side-by-side comparison metrics (2 to 5 users) | Yes |

### Repository Pins
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/pins` | List user's pinned repositories | Yes |
| `POST` | `/api/pins` | Pin a repository (`repo_id`, `note`, `tags`) | Yes |
| `PATCH` | `/api/pins/:id` | Update note and tags for a pin | Yes |
| `DELETE` | `/api/pins/:id` | Unpin a repository | Yes |

### Saved Comparisons
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/comparisons` | List user's saved comparisons | Yes |
| `POST` | `/api/comparisons` | Save a comparison (`name`, `developer_ids`) | Yes |
| `GET` | `/api/comparisons/:id` | Reopen a saved comparison | Yes |
| `PATCH` | `/api/comparisons/:id` | Rename a saved comparison | Yes |
| `DELETE` | `/api/comparisons/:id` | Delete a saved comparison | Yes |

---

## 🔒 Security Measures

- **No Plaintext Passwords**: Hashed with `bcryptjs`.
- **JWT Protection**: All developer data, compare views, pins, and comparisons require valid JWTs.
- **Ownership Isolation**: Queries on pins and comparisons include `where: { user_id }`. Attempting to access or mutate records belonging to other users immediately yields `404 Not Found`.
- **Rate Limiting**: Auth endpoints limited to 30 requests per 15-minute window; API rate limited to 120 requests per minute.
- **Sanitized Inputs**: All route parameters, query strings, and payloads strictly validated via Zod schemas.
