#!/bin/bash
# CB50 — Push update to server
# Run this from your local machine after building
# Usage: ./push.sh

set -e

SERVER="root@YOUR_SERVER_IP"   # <-- CHANGE THIS
APP_DIR="/var/www/cb50"

echo "→ Building..."
npm run build

echo "→ Uploading to server..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'data/*.db*' \
  --exclude 'logs' \
  dist/ \
  package.json \
  package-lock.json \
  ecosystem.config.cjs \
  .env \
  $SERVER:$APP_DIR/

echo "→ Installing dependencies on server..."
ssh $SERVER "cd $APP_DIR && npm ci --omit=dev"

echo "→ Restarting app..."
ssh $SERVER "cd $APP_DIR && pm2 restart cb50 || pm2 start ecosystem.config.cjs"

echo "✓ Deployed!"
