> ⚠️ **SUPERSEDED — do not follow this doc.** It describes the old path-based `domesticrealestate.us/api` layout. The backend now lives on the `api.domesticrealestate.us` subdomain with document root `laravel-api/public/`. See `/DEPLOYMENT.md` at the repo root and `.github/workflows/deploy-api.yml`. Kept here for history only.

# Deploy Laravel Backend to Hostinger hPanel

## Prerequisites
- Hostinger hosting plan with PHP 8.2+ and MySQL
- SSH access (Business/Premium plan) or File Manager access
- Node.js 18+ installed locally
- Git installed locally

## Step 1: Prepare .env for Production

Copy `.env.production.example` to `.env.production` and fill in your real values:

```bash
cp .env.production.example .env.production
# Edit .env.production with your real database credentials, API keys, etc.
```

## Step 2: Build Production Bundle

Run this from the project root (`C:\xampp\htdocs\domestic_re`):

```bash
# Windows (PowerShell)
powershell -ExecutionPolicy Bypass -File deploy\build-laravel.ps1

# Or manual steps:
cd laravel-api
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

## Step 3: Upload to hPanel

### Option A: SSH (Recommended)

```bash
# Connect to your hosting
ssh username@your-server-ip

# Navigate to your domain root
cd ~/domesticrealestate.us/api

# Upload via SCP from local machine (run on YOUR computer)
scp -r laravel-api/* username@your-server-ip:~/domesticrealestate.us/api/
```

### Option B: File Manager

1. Log in to hPanel → Websites → Manage → Files → File Manager
2. Navigate to `public_html/api/`
3. Upload ALL files from `laravel-api/` folder EXCEPT:
   - `.env` (upload `.env.production` as `.env`)
   - `node_modules/`
   - `.git/`
   - `tests/`

### Option C: Git (if connected to GitHub)

```bash
ssh username@your-server-ip
cd ~/domesticrealestate.us
git clone https://github.com/your-repo/domestic-re.git temp
cp -r temp/laravel-api/* api/
rm -rf temp
```

## Step 4: Server Configuration

### Set Document Root

In hPanel → Websites → Manage → Domains:
- Set `domesticrealestate.us` document root to `public_html`
- The Laravel `public/` folder should be accessible at `domesticrealestate.us/api/public/`

### Create symbolic link for public folder

```bash
ssh username@your-server-ip
cd ~/domesticrealestate.us/api
ln -s public public_html/api-public
```

### PHP Version

In hPanel → Websites → Manage → PHP Configuration:
- Select **PHP 8.2** or higher
- Enable extensions: `openssl`, `pdo_mysql`, `mbstring`, `xml`, `curl`, `fileinfo`, `gd`, `zip`

### MySQL Database

1. hPanel → Databases → MySQL Databases
2. Create database: `domestic_re_production`
3. Create user with FULL privileges
4. Note the database name, username, and password

## Step 5: Run Migrations & Seed

```bash
ssh username@your-server-ip
cd ~/domesticrealestate.us/api

# Set production .env
cp .env.production .env

# Generate app key (if not set in .env)
php artisan key:generate

# Run migrations
php artisan migrate --force

# Seed database (optional)
php artisan db:seed

# Cache everything
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
php artisan icons:cache
```

## Step 6: Set Permissions

```bash
ssh username@your-server-ip
cd ~/domesticrealestate.us/api

# Set correct permissions
chmod -R 755 storage
chmod -R 755 bootstrap/cache
chown -R www-data:www-data storage
chrown -R www-data:www-data bootstrap/cache
```

## Step 7: Configure .htaccess

The Laravel `public/.htaccess` should already handle routing. If not, create:

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Front Controller
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

## Step 8: Update Frontend API URL

After backend is live, update Next.js `.env.local`:

```
NEXT_PUBLIC_API_URL=https://domesticrealestate.us/api
```

## Step 9: Verify

1. Visit `https://domesticrealestate.us/api` → should return Laravel welcome page
2. Visit `https://domesticrealestate.us/api/api/health` → should return OK
3. Test login, forms, chat widget

## Troubleshooting

### 500 Internal Server Error
```bash
# Check storage/logs/laravel.log
tail -50 storage/logs/laravel.log

# Check PHP error log in hPanel
```

### Database Connection Failed
- Verify `.env` DB credentials match hPanel database
- Ensure database user has ALL PRIVILEGES

### CORS Errors
- Update `config/cors.php` to allow your frontend domain
- Set `SANCTUM_STATEFUL_DOMAINS` in `.env`

### Permissions Issues
```bash
chmod -R 777 storage bootstrap/cache
chmod 777 .env
```
