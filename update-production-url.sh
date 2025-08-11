#!/bin/bash

# 🚀 NewsPortal Deployment Update Script
# Run this after your Vercel deployment is ready

echo "🔧 NewsPortal - Updating Production URLs..."

# Get the Vercel URL from user
echo "📝 What's your Vercel deployment URL? (e.g., https://newsportal-abc123.vercel.app)"
read VERCEL_URL

# Remove trailing slash if present
VERCEL_URL=${VERCEL_URL%/}

# Update the AIService with the production URL
echo "🔄 Updating mobile/services/AIService.js..."
sed -i.backup "s|const PRODUCTION_URL = 'https://your-newsportal-app.vercel.app/api';|const PRODUCTION_URL = '${VERCEL_URL}/api';|" mobile/services/AIService.js

echo "✅ Updated production URL to: ${VERCEL_URL}/api"
echo ""
echo "🚀 Ready to commit and deploy:"
echo "   git add mobile/services/AIService.js"
echo "   git commit -m 'Update production API URL'"
echo "   git push origin main"
echo ""
echo "🎉 Your NewsPortal will be available at: ${VERCEL_URL}"
echo "📱 Mobile app will automatically connect to production backend!"
