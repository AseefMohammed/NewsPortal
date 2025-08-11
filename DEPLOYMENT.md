# 🚀 Free Deployment Guide for NewsPortal

## Deploy to Vercel (100% Free)

### Prerequisites
1. Create a free GitHub account (if you don't have one)
2. Create a free Vercel account at vercel.com

### Step 1: Push to GitHub
```bash
# Initialize git repository (if not already)
git init
git add .
git commit -m "Initial NewsPortal commit"

# Create repository on GitHub and push
git remote add origin https://github.com/yourusername/NewsPortal.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to vercel.com and sign in
2. Click "New Project"
3. Import your NewsPortal repository
4. Vercel will automatically detect the configuration
5. Click "Deploy"

### Step 3: Access Your App
- **Frontend**: https://your-project-name.vercel.app
- **Backend API**: https://your-project-name.vercel.app/api/
- **Mobile**: Use the same URLs in your mobile app

### Step 4: Update Mobile App Configuration
Update your AIService.js to use the production URL:

```javascript
const API_BASE_URL = 'https://your-project-name.vercel.app/api';
```

## Alternative Free Options:

### Netlify (Frontend Only)
1. Connect GitHub repo to Netlify
2. Build command: `cd mobile && npm run build`
3. Publish directory: `mobile/web-build`

### Railway (Full Stack)
1. Connect GitHub repo to Railway
2. Railway auto-detects Python backend
3. $5 free monthly credits

### Render (Full Stack)
1. Create web service from GitHub
2. Build command: `cd mobile && npm run build`
3. Start command: `cd backend && python main.py`

## 📱 Mobile Testing Without Local Setup:

### Expo Snack (Instant Mobile Testing)
1. Go to snack.expo.dev
2. Upload your mobile app code
3. Test instantly on your phone via QR code
4. Share with others easily

### No local npm/expo needed! 🎉

## Benefits:
- ✅ No more local development server management
- ✅ Automatic deployments on code changes
- ✅ Professional URLs to share
- ✅ Works on any device
- ✅ No terminal commands needed
- ✅ 100% Free for personal projects
