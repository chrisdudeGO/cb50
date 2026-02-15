#!/bin/bash
# CB50 — Server Setup & Deploy Script
# Run on a fresh IONOS VPS (Ubuntu 22.04 / 24.04)
# Usage: ssh root@YOUR_SERVER_IP < deploy.sh

set -e

DOMAIN="chris-wird-50.de"   # <-- CHANGE TO YOUR DOMAIN
APP_DIR="/var/www/cb50"
REPO_URL=""                  # <-- Set if using git clone, otherwise we rsync

echo "=== CB50 Server Setup ==="

# --- 1. System Update ---
echo "→ Updating system..."
apt update && apt upgrade -y

# --- 2. Install Node.js 20 ---
echo "→ Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# --- 3. Install build tools (for better-sqlite3 native module) ---
echo "→ Installing build tools..."
apt install -y build-essential python3

# --- 4. Install PM2 + Nginx ---
echo "→ Installing PM2 & Nginx..."
npm install -g pm2
apt install -y nginx

# --- 5. Create app directory ---
echo "→ Creating app directory..."
mkdir -p $APP_DIR/data
mkdir -p $APP_DIR/logs

echo ""
echo "=== System setup complete! ==="
echo ""
echo "Next steps:"
echo "  1. Upload your project files (see DEPLOY.md)"
echo "  2. Set up SSL with: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo "  3. Start the app with: cd $APP_DIR && pm2 start ecosystem.config.cjs"
echo ""
