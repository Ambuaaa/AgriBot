#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process..."

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Clear PM2 processes if they exist
echo "🧹 Cleaning up old processes..."
pm2 delete agribot-api || true

# Start the application with PM2
echo "🚀 Starting application..."
pm2 start dist/server.js --name "agribot-api" --max-memory-restart 1G

# Save PM2 process list
echo "💾 Saving process list..."
pm2 save

echo "✅ Deployment completed successfully!"

# Optional: Show logs
echo "📋 Showing logs..."
pm2 logs agribot-api --lines 50 