# Domestic Real Estate — Production Deployment Guide

## Architecture

```
domesticrealestate.us          (Next.js standalone Node.js server via PM2 → port 3000)
       │
       │  API calls
       ▼
api.domesticrealestate.us      (Laravel → public_html/laravel-api/public/)
       │
       ▼
   MySQL (Hostinger)
```

| Component | Hosting | URL |
|-----------|---------|-----|
| Frontend | Hostinger Node.js (PM2 on port 3000, Apache reverse proxy) | `https://domesticrealestate.us` |
| Backend API | Hostinger shared (`public_html/laravel-api/public/`) | `https://api.domesticrealestate.us` |
| Database | Hostinger MySQL | `127.0.0.1:3306` |

> **Note:** Frontend uses Next.js standalone mode (Node.js server), NOT static export.
> This supports all features: SSR, API routes, dynamic routing, and client components.

---

## First-Time Setup (Do Once)

### 1. Hostinger hPanel — Create Database

1. hPanel → **Databases** → **MySQL Databases**
2. Create database: `youruser_domestic_re`
3. Create user with **ALL PRIVILEGES**
4. Note: DB name, username, password

### 2. Hostinger hPanel — Create Subdomain

1. hPanel → **Domains** → **Subdomains** → **Create New**
2. Subdomain: `api`
3. Domain: `domesticrealestate.us`
4. Document root: `/domains/domesticrealestate.us/public_html/laravel-api/public`

### 3. Hostinger hPanel — PHP Configuration

1. hPanel → **Websites** → **Manage** → **PHP Configuration**
2. Select **PHP 8.2**
3. Enable extensions: `openssl`, `pdo_mysql`, `mbstring`, `xml`, `curl`, `fileinfo`, `gd`, `zip`

### 4. Hostinger hPanel — SSH Access

1. hPanel → **Websites** → **Manage** → **SSH Access**
2. Enable SSH
3. Generate or upload your SSH key
4. Note: Host, Port, Username

### 5. Create GitHub Secrets

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret | Value |
|--------|-------|
| `HOST` | Your Hostinger server IP or hostname |
| `PORT` | SSH port (usually `65002` or `22`) |
| `USERNAME` | Your Hostinger SSH username |
| `SSH_PRIVATE_KEY` | Full contents of your private SSH key (including `-----BEGIN` and `-----END` lines) |

### 6. Upload Laravel `.env` to Server

```bash
# From your local machine
scp -P PORT laravel-api/.env.production USERNAME@HOST:~/domains/domesticrealestate.us/public_html/laravel-api/.env

# Then SSH in and edit with real values
ssh -p PORT USERNAME@HOST
cd ~/domains/domesticrealestate.us/public_html/laravel-api
nano .env
# Set: DB_DATABASE, DB_USERNAME, DB_PASSWORD, APP_KEY, API keys
php artisan key:generate  # if APP_KEY is empty
php artisan migrate --force
```

### 7. Initial Server Directory Setup

```bash
ssh -p PORT USERNAME@HOST
cd ~/domains/domesticrealestate.us/public_html

# Ensure storage is writable
chmod -R 775 laravel-api/storage
chmod -R 775 laravel-api/bootstrap/cache

# Ensure laravel-api directory exists
ls -la laravel-api/
ls -la laravel-api/public/
```

---

## How Deployment Works

### Automatic (on push to main)

Push to `main` triggers GitHub Actions:

- **Changes in `nextjs-frontend/`** → `deploy-frontend.yml` runs
  - Builds standalone Node.js server (`output: "standalone"`)
  - Copies static assets into `.next/standalone`
  - Deploys to `public_html/nextjs-frontend/`
  - Restarts PM2 process via SSH

- **Changes in `laravel-api/`** → `deploy-api.yml` runs
  - rsync to `public_html/laravel-api/` (preserves `.env`, `storage/`)
  - Installs composer deps (no-dev) on the server
  - Runs `storage:link`, `optimize:clear`, `config:cache`, `route:cache`, `view:cache`
  - Runs `migrate --force`
  - Verifies health endpoint

### Manual trigger

Both workflows support **workflow_dispatch** — trigger manually from GitHub Actions tab.

---

## What Gets Deployed

### Frontend (`deploy-frontend.yml`)

```
public_html/nextjs-frontend/
├── server.js                  ← Node.js entry point
├── .next/                     ← Next.js build output
│   ├── standalone/            ← Self-contained Node.js app
│   └── static/                ← JS/CSS bundles
├── public/                    ← Static assets (images, sitemap, etc.)
├── node_modules/              ← Minimal production dependencies
└── package.json
```

> PM2 manages the Node.js process. It auto-restarts on crashes and starts on server boot.

### Backend (`deploy-backend.yml`)

```
public_html/laravel-api/
├── app/
├── bootstrap/
├── config/
├── public/                 ← subdomain document root
├── routes/
├── vendor/
├── .env                    ← PRESERVED (never overwritten)
├── storage/                ← PRESERVED (never overwritten)
└── composer.json
```

---

## Safe Exclusions

### Frontend rsync

```
# Deploys to public_html/nextjs-frontend/ (NOT public_html/ directly)
# PM2 runs: pm2 start server.js --name domestic-frontend --cwd ~/domains/domesticrealestate.us/public_html/nextjs-frontend
```

### Backend rsync

```
--exclude '.git'
--exclude '.env'            ← PRESERVED on server
--exclude 'storage/logs/*'
--exclude 'storage/framework/cache/*'
--exclude 'storage/framework/sessions/*'
--exclude 'storage/framework/views/*'
--exclude 'bootstrap/cache/*.php'
--exclude 'node_modules'
--exclude 'tests'
```

---

## Rollback

### Frontend rollback

```bash
# Revert the commit
git revert HEAD
git push origin main
# GitHub Actions auto-deploys the reverted version
```

### Backend rollback

```bash
# Revert the commit
git revert HEAD
git push origin main
# GitHub Actions re-deploys previous version

# If migration rollback needed:
ssh -p PORT USERNAME@HOST
cd ~/domains/domesticrealestate.us/public_html/laravel-api
php artisan migrate:rollback
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
```

### Manual rollback (without Git)

```bash
# Keep a backup of the last known good deployment
ssh -p PORT USERNAME@HOST
cd ~/domains/domesticrealestate.us/public_html

# If you have a backup
cp -r backup-laravel-api/ laravel-api/
cd laravel-api
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
```

---

## Environment Variables

### Laravel (`.env` on server)

| Variable | Production Value |
|----------|-----------------|
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_URL` | `https://api.domesticrealestate.us` |
| `DB_HOST` | `127.0.0.1` |
| `DB_DATABASE` | Your production DB name |
| `DB_USERNAME` | Your production DB user |
| `DB_PASSWORD` | Your production DB password |
| `SESSION_DRIVER` | `database` |
| `SESSION_DOMAIN` | `.domesticrealestate.us` |
| `SANCTUM_STATEFUL_DOMAINS` | `domesticrealestate.us,www.domesticrealestate.us` |
| `FRONTEND_URL` | `https://domesticrealestate.us` |

### Next.js (server-side env + public client env)

| Variable | Value | Type |
|----------|-------|------|
| `NEXT_PUBLIC_API_URL` | `https://api.domesticrealestate.us/api` | Client (built into JS) |
| `NEXT_PUBLIC_SITE_URL` | `https://domesticrealestate.us` | Client (built into JS) |
| `PORT` | `3000` | Server (PM2 starts on this port) |
| `HOSTNAME` | `0.0.0.0` | Server (listen on all interfaces) |

---

## CORS Configuration

Laravel `config/cors.php` is configured to allow:

- `https://domesticrealestate.us`
- `https://www.domesticrealestate.us`

With `supports_credentials: true` for cookie-based auth.

---

## Troubleshooting

### Frontend shows old version
- Clear browser cache: `Ctrl+Shift+R`
- Check GitHub Actions logs for build errors
- SSH in and restart PM2: `pm2 restart domestic-frontend`

### Frontend PM2 process not running
```bash
ssh -p PORT USERNAME@HOST
pm2 status
pm2 logs domestic-frontend
# If crashed, restart:
pm2 restart domestic-frontend
# If missing:
cd ~/domains/domesticrealestate.us/public_html/nextjs-frontend
pm2 start server.js --name domestic-frontend
pm2 save
```

### Frontend port conflict
- Check if port 3000 is available: `lsof -i :3000`
- If another process uses it, change PORT in env and PM2 config

### Apache 502 Bad Gateway (reverse proxy)
- Ensure PM2 process is running: `pm2 status`
- Check Apache proxy config is enabled
- Verify `mod_proxy` and `mod_proxy_http` are loaded

### API returns 500
```bash
ssh -p PORT USERNAME@HOST
cd ~/domains/domesticrealestate.us/public_html/laravel-api
tail -50 storage/logs/laravel.log
```

### CORS errors in browser
- Verify `config/cors.php` includes your domain
- Run: `php artisan config:cache`
- Check `SANCTUM_STATEFUL_DOMAINS` in `.env`

### Database connection refused
- Verify `.env` DB credentials match hPanel database
- Ensure DB user has ALL PRIVILEGES
- Try `127.0.0.1` not `localhost` for DB_HOST

### Subdomain not working
- Verify subdomain document root in hPanel: `/domains/domesticrealestate.us/public_html/laravel-api/public`
- Check that `laravel-api/public/index.php` exists
- Verify `.env` has `APP_URL=https://api.domesticrealestate.us`

### SSH connection fails
- Verify GitHub Secrets: HOST, PORT, USERNAME, SSH_PRIVATE_KEY
- Check Hostinger SSH is enabled
- Try connecting manually: `ssh -p PORT USERNAME@HOST`

---

## Cost

| Service | Plan | Monthly |
|---------|------|---------|
| Hostinger | Business Shared (with Node.js support) | ~$5 |
| Vercel | Not used | $0 |
| Domain | `domesticrealestate.us` | ~$1 |
| **Total** | | **~$6/mo** |
