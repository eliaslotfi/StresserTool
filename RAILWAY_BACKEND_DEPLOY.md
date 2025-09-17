# Railway Backend Deployment Guide

## Bug Fix Summary

✅ **Fixed the Railway deployment issue:**
- Removed Git merge conflict markers from `Procfile`
- Created proper `railway.json` configuration
- Removed conflicting `nixpacks.json`
- Ensured Python backend configuration

## Current Configuration

### Files Created/Modified:
1. **Procfile** - Clean Python uvicorn command
2. **railway.json** - Railway deployment configuration  
3. **requirements.txt** - Python dependencies (already in root)

### Railway Environment Variables

You should configure these in your Railway dashboard:

#### Required Variables:
```
AUTH_PASSWORD=BrockLesnar77
SESSION_SECRET=votre-cle-secrete-forte
NODE_ENV=production
```

#### CORS Configuration (Important!):
```
STRESS_ALLOW_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

Replace `yourdomain.com` with your actual frontend domain.

## Deployment Steps

1. **Push to GitHub** - Railway will auto-deploy from your GitHub repository
2. **Configure Environment Variables** in Railway dashboard:
   - Go to your project settings
   - Add the environment variables listed above
   - Make sure to set `STRESS_ALLOW_ORIGINS` to your frontend domain
3. **Deploy** - Railway will use the new `railway.json` configuration

## Backend Endpoints

Your Railway backend will expose these endpoints:
- `POST /stress-test` - Start stress test
- `GET /stress-test/{test_id}` - Get test results
- `WebSocket /ws/{test_id}` - Real-time updates
- `GET /health` - Health check

## Frontend Integration

Update your frontend API configuration to point to:
```
https://your-railway-app.railway.app
```

## Troubleshooting

- **CORS Issues**: Make sure `STRESS_ALLOW_ORIGINS` includes your frontend domain
- **Build Fails**: Check that `requirements.txt` is in the root directory
- **Runtime Issues**: Check Railway logs for Python/uvicorn errors

## Next Steps

1. Deploy backend to Railway
2. Get the Railway app URL
3. Update frontend API endpoints to use Railway URL
4. Deploy frontend to your web host
5. Test the connection between frontend and backend