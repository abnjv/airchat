#!/bin/bash

echo "🔧 Installing backend dependencies..."
cd backend
npm install

echo "🚀 Starting backend with PM2..."
pm2 start server.js --name airchat-backend

echo "🧼 Cleaning /var/www/html/..."
sudo rm -rf /var/www/html/*
cd ../airchat
echo "📁 Copying frontend files..."
sudo cp -r * /var/www/html/

cd ..
echo "⬆️ Pushing to GitHub..."
git add .
git commit -m \"Deploy via script\"
git push

echo "✅ Deployment complete!"
