#!/data/data/com.termux/files/usr/bin/bash

# رابط Railway الخاص بك
RAILWAY_URL="https://airchat-8533.up.railway.app"

# استبدال كل localhost بالرابط
echo "🔁 استبدال localhost بـ $RAILWAY_URL..."
find . -type f -name "*.js" -exec sed -i "s|http://localhost:5000|$RAILWAY_URL|g" {} +

# تشغيل السيرفر (لو محلي أو للاختبار)
echo "🚀 تشغيل الخادم..."
node server.js
