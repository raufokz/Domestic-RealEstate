# Build Script for Laravel Production Deployment
# Run from project root: C:\xampp\htdocs\domestic_re
# Usage: powershell -ExecutionPolicy Bypass -File deploy\build-laravel.ps1

Write-Host "=== Building Laravel for Production ===" -ForegroundColor Cyan

$laravelDir = Join-Path $PSScriptRoot ".." "laravel-api"
$deployDir = Join-Path $PSScriptRoot ".." "deploy-dist" "api"

# Clean previous build
if (Test-Path $deployDir) {
    Remove-Item -Recurse -Force $deployDir
    Write-Host "Cleaned previous build" -ForegroundColor Yellow
}

# Copy Laravel files
Write-Host "Copying Laravel files..." -ForegroundColor Green
robocopy $laravelDir $deployDir /E /XD "node_modules" ".git" "tests" "storage\framework\views" /XF ".env" ".env.example" "README.md" "docker-compose.yml" ".editorconfig" ".phpunit.cache" "package.json" "package-lock.json" "vite.config.js" "tailwind.config.js" | Out-Null

# Copy production .env
$envProd = Join-Path $PSScriptRoot ".env.production"
$envTarget = Join-Path $deployDir ".env"
if (Test-Path $envProd) {
    Copy-Item $envProd $envTarget -Force
    Write-Host "Copied .env.production -> .env" -ForegroundColor Green
} else {
    Write-Host "WARNING: .env.production not found! Copy manually." -ForegroundColor Red
}

# Enter build directory
Push-Location $laravelDir

# Install production dependencies
Write-Host "Installing composer dependencies (no-dev)..." -ForegroundColor Green
composer install --optimize-autoloader --no-dev --no-interaction

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Composer install failed!" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Laravel optimizations
Write-Host "Running Laravel optimizations..." -ForegroundColor Green
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

Pop-Location

# Create deployment archive
$zipPath = Join-Path $PSScriptRoot ".." "deploy-dist" "laravel-api.zip"
Write-Host "Creating deployment archive..." -ForegroundColor Green
Compress-Archive -Path "$deployDir\*" -DestinationPath $zipPath -Force

Write-Host ""
Write-Host "=== Build Complete ===" -ForegroundColor Cyan
Write-Host "Output: $deployDir" -ForegroundColor White
Write-Host "Archive: $zipPath" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Upload deploy-dist/api/ to your hPanel File Manager" -ForegroundColor White
Write-Host "  2. OR upload deploy-dist/laravel-api.zip and extract on server" -ForegroundColor White
Write-Host "  3. Run: php artisan migrate --force" -ForegroundColor White
Write-Host "  4. Run: php artisan db:seed (optional)" -ForegroundColor White
Write-Host "  5. Set permissions: chmod -R 755 storage bootstrap/cache" -ForegroundColor White
