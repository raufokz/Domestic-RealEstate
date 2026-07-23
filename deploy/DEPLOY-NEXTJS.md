# Deploy Next.js Frontend to Vercel

## Why Vercel?
- Hostinger hPanel shared hosting does NOT support Node.js
- Vercel is free for personal projects and optimized for Next.js
- Automatic deployments from GitHub
- SSL, CDN, edge functions included free

## Prerequisites
- GitHub account with your code pushed
- Vercel account (free at vercel.com)
- Backend deployed and accessible (e.g., `https://domesticrealestate.us/api`)

## Step 1: Push Code to GitHub

```bash
cd C:\xampp\htdocs\domestic_re\nextjs-frontend

# Initialize git (if not already)
git init
git add .
git commit -m "Initial deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/your-username/domestic-re-frontend.git
git branch -M main
git push -u origin main
```

## Step 2: Import to Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New..." → "Project"**
3. Select **"Import Git Repository"**
4. Select your `domestic-re-frontend` repo
5. Configure:

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Root Directory | `./` |
| Build Command | `next build` |
| Output Directory | `.next` |
| Install Command | `npm install` |

6. Click **"Environment Variables"** and add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://domesticrealestate.us/api` |
| `NEXT_PUBLIC_SITE_URL` | `https://domesticrealestate.us` |
| `NODE_ENV` | `production` |

7. Click **"Deploy"**

## Step 3: Custom Domain

1. In Vercel dashboard → your project → **Settings → Domains**
2. Add `domesticrealestate.us`
3. Add `www.domesticrealestate.us`
4. Vercel will show you DNS records to configure

### DNS Configuration (in Hostinger)

Go to hPanel → Websites → Manage → DNS / Nameservers → DNS Records:

| Type | Name | Value |
|------|------|-------|
| A | @ | `76.76.21.21` |
| CNAME | www | `cname.vercel-dns.com` |

**OR** if using Vercel nameservers:
1. In hPanel → Nameservers → Change to custom
2. Set: `ns1.vercel-dns.com`, `ns2.vercel-dns.com`

## Step 4: Update Backend CORS

In Laravel `.env` on hPanel:

```env
FRONTEND_URL=https://domesticrealestate.us
SANCTUM_STATEFUL_DOMAINS=domesticrealestate.us,www.domesticrealestate.us
```

Then clear cache:
```bash
cd ~/domesticrealestate.us/api
php artisan config:cache
```

## Step 5: Update Sitemap API URL

In `src/app/sitemap.ts`, the API URL uses env variable. Make sure it's set in Vercel:
- `NEXT_PUBLIC_API_URL` → `https://domesticrealestate.us/api`

## Step 6: Verify

1. Visit `https://domesticrealestate.us` → homepage loads
2. Visit `https://domesticrealestate.us/properties` → properties page
3. Visit `https://domesticrealestate.us/contact` → contact form works
4. Test chat widget, forms, login

## Auto-Deployments

After initial setup, every `git push` to `main` automatically deploys to Vercel.

## Alternative: Deploy Next.js on hPanel VPS

If you prefer everything on Hostinger, use a VPS plan:

```bash
# On VPS
sudo apt update && sudo apt install -y nodejs npm pm2
node -v  # Should be 18+

cd /var/www
git clone https://github.com/your-username/domestic-re-frontend.git
cd domestic-re-frontend

# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://domesticrealestate.us/api
NEXT_PUBLIC_SITE_URL=https://domesticrealestate.us
EOF

npm install
npm run build

# Start with PM2
pm2 start npm --name "domestic-re" -- start
pm2 save
pm2 startup

# Nginx config
sudo nano /etc/nginx/sites-available/domesticrealestate.us
```

Nginx config for VPS:
```nginx
server {
    listen 80;
    server_name domesticrealestate.us www.domesticrealestate.us;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
