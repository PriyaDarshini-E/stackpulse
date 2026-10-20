# 📝 StackPulse Engineering Notes & Architectural Decisions

## 1. Architectural Approach

StackPulse is engineered as an enterprise-grade full-stack TypeScript platform adhering to clean architecture principles:
- **Separation of Concerns**: Separation between routing (`routes/`), request validation (`validations/`), controllers (`controllers/`), business logic and external network coordination (`services/`), and data access (`db/prisma.ts`).
- **Strict Typing**: TypeScript strict mode is enabled across both server and client without `any` workarounds.
- **Fail-Safe Client**: TanStack Query handles client-side caching, background invalidation, and UI optimistic updates.

---

## 2. GitHub Caching & Rate-Limit Performance Strategy

The GitHub REST API enforces strict rate limits:
- **60 requests/hour** unauthenticated
- **5,000 requests/hour** with `GITHUB_TOKEN`

To deliver lightning-fast response times and prevent quota exhaustion, StackPulse implements a multi-layer strategy:

### A. Database Cache with Configurable TTL
- Every fetched developer and repository record is persisted in PostgreSQL along with `fetched_at` and HTTP `etag`.
- On incoming requests, `GitHubService.getDeveloper` checks if `Date.now() - fetched_at < CACHE_TTL_MINUTES * 60 * 1000`.
- **Cache Hit**: Returns the developer profile and repositories immediately from PostgreSQL with **0 GitHub API calls**.

### B. Conditional HTTP Revalidation (ETag / If-None-Match)
- When a cached record passes its TTL, StackPulse issues a conditional request: `If-None-Match: <developer.etag>`.
- If GitHub responds with `304 Not Modified`, StackPulse does not re-fetch the repos; it simply updates `fetched_at = now()` and returns the existing cached records. This saves substantial rate-limit points.

### C. Zero-Call Aggregations via Pagination
- Rather than calling `/repos/{owner}/{repo}/languages` for all repositories (which would consume dozens or hundreds of requests per user), StackPulse uses `GET /users/{username}/repos?per_page=100` and iterates pagination using GitHub's `Link` response header.
- Total Stars and initial language distributions are aggregated directly from the repository metadata with zero extra HTTP calls.

### D. Lazy Top-N Deep Fetch with Concurrency Throttling
- Deep repository metrics (precise language byte counts and recent commits) are sampled exclusively for the top N starred repositories (default: top 10).
- Deep requests are executed concurrently using `p-limit` with a concurrency ceiling of `5`. This avoids socket exhaustion and minimizes latency.

### E. In-Flight Request Deduplication
- If multiple concurrent clients (or concurrent queries from a comparison view) request the same developer simultaneously, StackPulse deduplicates in-flight promises via an internal `Map<string, Promise<DeveloperResult>>`. All concurrent requests subscribe to a single GitHub network fetch.

### F. Graceful Stale Fallback
- StackPulse tracks `X-RateLimit-Remaining` and `X-RateLimit-Reset` on every response.
- If GitHub returns `403` or `429` (Rate Limit Exceeded) or experiences network instability, StackPulse checks if a cached version of the developer exists in PostgreSQL.
- If cached data exists, it is served immediately with `"stale": true`, allowing the frontend to render the developer profile with an informative "Stale Cache" badge and remaining reset time.

---

## 3. Database Schema Decisions

PostgreSQL with Prisma was selected for relational integrity, JSONB support, and indexing:

1. **`users` Table**:
   - `email` with `UNIQUE` constraint and `password_hash`.
2. **`developers` Table**:
   - `github_username` with `UNIQUE` constraint and index.
   - `language_breakdown` (JSONB) and `commit_activity` (JSONB): Enables rapid storage and retrieval of complex multi-language byte trees and timeline objects without cumbersome polymorphic normalization.
   - `etag` and `fetched_at`: For TTL expiration and conditional HTTP requests.
3. **`repos` Table**:
   - Foreign key to `developers(id)` with `ON DELETE CASCADE`.
   - Composite unique key on `(developer_id, name)` to support atomic upserts.
   - Index on `stars` for rapid descending sorts.
4. **`comparisons` and `comparison_devs`**:
   - Many-to-many join table `comparison_devs` with composite primary key `(comparison_id, developer_id)`.
   - Foreign keys to both `comparisons` and `developers` with `ON DELETE CASCADE`.
5. **`pins` Table**:
   - Composite unique key `UNIQUE(user_id, repo_id)` to guarantee each user can pin a specific repository at most once.
   - `tags TEXT[]`: Native PostgreSQL text array for fast, indexed tag queries.

---

## 4. Security & Isolation Design

1. **Password Security**: Passwords are never logged or stored in plain text. Hashed using `bcryptjs` with 10 salt rounds.
2. **Authentication**: Signed JWT tokens containing `userId` and `email` issued on login/register and verified by `requireAuth` middleware.
3. **Strict Ownership Isolation**:
   - All queries on `/api/pins` and `/api/comparisons` include `user_id: req.user.id`.
   - When User A attempts to view, update, or delete a pin or comparison created by User B, the backend returns a `404 Not Found` rather than a `403 Forbidden`. This completely prevents resource enumeration attacks.
4. **Defensive Middlewares**:
   - `helmet` sets secure HTTP headers (XSS filter, frameguard, noSniff).
   - `cors` configured exclusively for authorized frontend origins.
   - `express-rate-limit` prevents brute-force credential stuffing on `/api/auth/*`.

---

## 5. Trade-Offs & Future Enhancements

With more development time, the following enhancements would be added:
1. **Distributed Caching (Redis)**: For horizontally scaled backend nodes, an in-memory Redis cluster would replace the local in-flight Promise map and act as L1 cache ahead of PostgreSQL.
2. **GitHub OAuth Integration**: Support "Sign in with GitHub" via OAuth 2.0 to grant higher unauthenticated rate limits directly tied to the user's personal GitHub identity.
3. **GitHub Webhooks**: Listen to repository push and release webhooks to update cached developer statistics in real-time.
4. **GraphQL API Integration**: Use the GitHub GraphQL API for unified single-roundtrip queries when fetching developer profiles and top repositories.
