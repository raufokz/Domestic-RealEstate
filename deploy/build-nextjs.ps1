# Build Script for Next.js Production Deployment
# Run from project root: C:\xampp\htdocs\domestic_re
# Usage: powershell -ExecutionPolicy Bypass -File deploy\build-nextjs.ps1

Write-Host "=== Building Next.js for Production ===" -ForegroundColor Cyan

$nextjsDir = Join-Path $PSScriptRoot ".." "nextjs-frontend"
$deployDir = Join-Path $PSScriptRoot ".." "deploy-dist" "frontend"

# Clean previous build
if (Test-Path $deployDir) {
    Remove-Item -Recurse -Force $deployDir
    Write-Host "Cleaned previous build" -ForegroundColor Yellow
}

# Copy source files (excluding node_modules, .next, etc.)
Write-Host "Copying Next.js source..." -ForegroundColor Green
robocopy $nextjsDir $deployDir /E /XD "node_modules" ".next" ".git" ".turbo" /XF ".env.local" ".env" | Out-Null

# Copy production .env
$envProd = Join-Path $PSScriptRoot ".env.production"
$envTarget = Join-Path $deployDir ".env.local"
if (Test-Path $envProd) {
    Copy-Item $envProd $envTarget -Force
    Write-Host "Copied .env.production -> .env.local" -ForegroundColor Green
} else {
    Write-Host "WARNING: .env.production not found! Copy manually." -ForegroundColor Red
}

# Enter build directory
Push-Location $nextjsDir

# Install dependencies
Write-Host "Installing npm dependencies..." -ForegroundColor Green
npm install --legacy-peer-deps

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm install failed!" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Build
Write-Host "Building Next.js..." -ForegroundColor Green
$env:NODE_ENV = "production"
$env:NEXT_PUBLIC_API_URL = "https://domesticrealestate.us/api"
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed!" -ForegroundColor Red
    Pop-Location
    exit 1
}

Pop-Location

Write-Host ""
Write-Host "=== Build Complete ===" -ForegroundColor Cyan
Write-Host "For Vercel: Push to GitHub and import in Vercel dashboard" -ForegroundColor White
Write-Host "For VPS: Upload deploy-dist/frontend/ to server and run npm start" -ForegroundColor White
Write-Host ""
Write-Host "Recommended: Deploy to Vercel (free, automatic SSL, CDN)" -ForegroundColor Yellow
Write-Host "  1. Push code to GitHub" -ForegroundColor White
Write-Host "  2. Go to vercel.com → Import Project" -ForegroundColor White
Write-Host "  3. Set env: NEXT_PUBLIC_API_URL=https://domesticrealestate.us/api" -ForegroundColor White
Write-Host "  4. Deploy" -ForegroundColor White
