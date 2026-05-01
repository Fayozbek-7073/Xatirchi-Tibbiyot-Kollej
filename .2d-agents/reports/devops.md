# DevOps Report — Xatirchi-tibbiyot.uz

## Status: Complete

## Files Created

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Orchestrates all four services |
| `backend/Dockerfile` | Node.js 20 Alpine image for the API |
| `nginx/nginx.conf` | Serves frontend dist, proxies `/api/` → backend |
| `.env.example` | Template for required environment variables |

## Architecture

```
Browser
  └─→ Nginx :80
        ├─ /            → serves frontend/dist (React SPA, try_files → index.html)
        └─ /api/        → proxy_pass http://backend:3000/  (strips /api prefix)
                              └─→ backend:3000 (Node/Express)
                                    └─→ db:5432 (PostgreSQL 16)
```

## Services

### `db` — PostgreSQL 16 Alpine
- Data persisted in named volume `pgdata`
- Healthcheck via `pg_isready` before any dependent service starts

### `migrate` — runs once on startup
- Executes `node src/db/migrate.js` against the live DB
- Restarts on failure (handles race conditions)
- Exits after completion — does not stay running

### `backend` — Node.js 20 Alpine
- Waits for `db` healthcheck to pass
- All secrets injected via environment variables — no secrets in image
- Not exposed externally; only reachable by Nginx within the Docker network

### `nginx` — Nginx 1.27 Alpine
- Only service with a public port (80)
- Frontend dist mounted read-only
- `/api/` prefix stripped before proxying to backend (matches backend route structure)

## How to Deploy

```bash
# 1. Copy and fill env file
cp .env.example .env
# Edit .env — set DB_PASSWORD and JWT_SECRET

# 2. Build frontend (if not already built)
cd frontend && npm ci && npm run build && cd ..

# 3. Start everything
docker-compose up -d

# 4. Check logs
docker-compose logs -f
```

## Notes

- `VITE_API_URL` in the frontend defaults to `/api` in production (relative URL via Nginx proxy)
- For HTTPS, add a Certbot/Let's Encrypt sidecar or terminate TLS at a load balancer upstream
- `JWT_SECRET` must be at least 32 random characters — generate with: `openssl rand -hex 32`
