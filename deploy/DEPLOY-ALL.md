> ⚠️ **SUPERSEDED — do not follow this doc.** It describes an abandoned architecture (Vercel frontend + path-based `domesticrealestate.us/api` backend). The current, live setup is Hostinger PM2 (Next.js standalone) + `api.domesticrealestate.us` subdomain, documented in `/DEPLOYMENT.md` at the repo root and automated by `.github/workflows/deploy-frontend.yml` + `deploy-api.yml`. Kept here for history only.

# Domestic Real Estate — Deployment Guide
## Hostinger hPanel + Vercel

---

## Architecture

```
┌─────────────────────┐     ┌─────────────────────┐
│   Next.js Frontend   │────▶│   Laravel Backend    │
│      (Vercel)        │     │   (Hostinger hPanel) │
│                      │     │                      │
│  domesticrealestate  │ API │  domesticrealestate  │
│       .us            │◀────│     .us/api          │
└─────────────────────┘     └─────────────────────┘
                                    │
                              ┌─────▼─────┐
                              │   MySQL    │
                              │  (hPanel)  │
                              └───────────┘
```

- **Frontend**: Deployed on **Vercel** (free, automatic SSL, CDN, instant deploys)
- **Backend**: Deployed on **Hostinger hPanel** (PHP hosting, MySQL database)
- **Domain**: `domesticrealestate.us` pointed to both

---

## Quick Start (5 Steps)

### 1. Create `.env.production` files

```bash
# Laravel
cp deploy/.env.production.example laravel-api/.env.production
# Edit with your real DB credentials and API keys

# Next.js
# Already created at deploy/.env.production
```

### 2. Build & Upload Laravel

```bash
# Build production bundle
powershell -ExecutionPolicy Bypass -File deploy/build-laravel.ps1

# Upload deploy-dist/api/ to hPanel File Manager → public_html/api/
```

### 3. Setup MySQL Database on hPanel

1. hPanel → Databases → MySQL Databases
2. Create: `domestic_re_prod` database
3. Create user with ALL PRIVILEGES
4. Update `.env` on server with these credentials

### 4. Push Next.js to GitHub → Deploy to Vercel

```bash
cd nextjs-frontend
git init && git add . && git commit -m "deploy"
git remote add origin https://github.com/your-username/domestic-re-frontend.git
git push -u origin main

# Then: vercel.com → Import → Select repo → Add env vars → Deploy
```

### 5. Connect Domain

Point `domesticrealestate.us` to Vercel (see DNS section below).

---

## Detailed Instructions

See individual guides:
- [Laravel Deployment](DEPLOY-LARAVEL.md)
- [Next.js Deployment](DEPLOY-NEXTJS.md)

---

## DNS Configuration

### Option A: Use Vercel Nameservers (Recommended)

1. In hPanel → Nameservers → Change to Custom
2. Set:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
3. In Vercel → Project → Settings → Domains → Add `domesticrealestate.us`
4. Vercel auto-configures DNS records

### Option B: Keep Hostinger Nameservers

Add these DNS records in hPanel → DNS Records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | `76.76.21.21` | 3600 |
| CNAME | www | `cname.vercel-dns.com` | 3600 |
| A | api | `YOUR_HOSTINGER_SERVER_IP` | 3600 |

---

## SSL/HTTPS

- **Vercel**: Automatic SSL, no configuration needed
- **hPanel**: Enable "Force HTTPS" in hPanel → Websites → Manage → SSL

---

## Environment Variables Checklist

### Laravel (.env on hPanel)
- [ ] `APP_ENV=production`
- [ ] `APP_DEBUG=false`
- [ ] `APP_URL=https://domesticrealestate.us/api`
- [ ] `DB_DATABASE` → production database name
- [ ] `DB_USERNAME` → production database user
- [ ] `DB_PASSWORD` → production database password
- [ ] `SESSION_DRIVER=database`
- [ ] `SESSION_DOMAIN=.domesticrealestate.us`
- [ ] `SANCTUM_STATEFUL_DOMAINS=domesticrealestate.us,www.domesticrealestate.us`
- [ ] `FRONTEND_URL=https://domesticrealestate.us`
- [ ] `MAIL_PASSWORD` → real SMTP password
- [ ] `GEMINI_API_KEY` → real key
- [ ] `OPENAI_API_KEY` → real key

### Next.js (Vercel env vars)
- [ ] `NEXT_PUBLIC_API_URL=https://domesticrealestate.us/api`
- [ ] `NEXT_PUBLIC_SITE_URL=https://domesticrealestate.us`
- [ ] `NODE_ENV=production`

---

## Post-Deployment Commands (SSH into hPanel)

```bash
# Navigate to Laravel directory
cd ~/domesticrealestate.us/api

# Generate app key (if needed)
php artisan key:generate

# Run migrations
php artisan migrate --force

# Seed database (optional)
php artisan db:seed

# Cache optimizations
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Fix permissions
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

---

## Troubleshooting

### API Returns 500 Error
```bash
# Check Laravel logs
tail -100 ~/domesticrealestate.us/api/storage/logs/laravel.log

# Check PHP version in hPanel → PHP Configuration (must be 8.2+)
```

### CORS Errors in Browser
- Update `SANCTUM_STATEFUL_DOMAINS` in Laravel `.env`
- Run `php artisan config:cache`
- Clear browser cache

### Database Connection Refused
- Verify DB credentials in `.env` match hPanel database
- Ensure DB user has ALL PRIVILEGES
- Try `127.0.0.1` as DB_HOST (not `localhost`)

### Frontend Can't Reach API
- Check `NEXT_PUBLIC_API_URL` in Vercel env vars
- Verify CORS allows your Vercel domain
- Test API directly: `curl https://domesticrealestate.us/api/health`

### Next.js Build Fails on Vercel
- Check build logs in Vercel dashboard
- Ensure all env vars are set in Vercel project settings
- Try `npm run build` locally first

---

## Cost Summary

| Service | Plan | Cost |
|---------|------|------|
| Hostinger | Business Shared | ~$4/mo |
| Vercel | Hobby (Free) | $0 |
| Domain | domesticrealestate.us | ~$12/yr |
| **Total** | | **~$60/year** |
