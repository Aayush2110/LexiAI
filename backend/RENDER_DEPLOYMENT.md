# Render Deployment Guide

## 🚀 Complete Deployment Checklist

This guide ensures your LegalRAG AI Chatbot backend deploys successfully on Render on the first attempt.

---

## ✅ Pre-Deployment Checklist

### 1. Prerequisites
- [x] GitHub repository with backend code
- [x] MongoDB Atlas account (or other MongoDB hosting)
- [x] Google API Key (for Gemini) or OpenAI API Key
- [x] Render account ([render.com](https://render.com))
- [x] Vercel frontend URL (for CORS)

### 2. MongoDB Setup (REQUIRED)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0 tier)
3. Create a database user with password
4. Whitelist all IP addresses (0.0.0.0/0) for Render access
5. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/`

### 3. Google API Key Setup (REQUIRED)
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the key (starts with `AIzaSy...`)
4. Test it locally first

---

## 📦 Deployment Steps

### Step 1: Create Render Web Service

1. **Go to Render Dashboard**
   - Visit [render.com/dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"

2. **Connect GitHub Repository**
   - Select your repository
   - Select the branch (usually `main`)

3. **Configure Service**
   - **Name**: `legalrag-backend` (or your choice)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1`
   - **Plan**: Free (or paid for better performance)

### Step 2: Add Persistent Disk (CRITICAL!)

**⚠️ IMPORTANT: Without persistent disk, uploaded files and vector databases will be lost on every deployment!**

1. In your Render service dashboard, go to **"Disks"** tab
2. Click **"Add Disk"**
3. Configure:
   - **Name**: `legalrag-data`
   - **Mount Path**: `/data`
   - **Size**: `1 GB` (minimum) or more based on your needs
4. Click **"Create Disk"**

### Step 3: Set Environment Variables

In Render Dashboard → Your Service → "Environment" tab, add these variables:

#### Required Variables (MUST SET):

```bash
# LLM Provider
LLM_PROVIDER=gemini

# Google API Key (REQUIRED)
GOOGLE_API_KEY=AIzaSy...your-actual-key-here

# CORS Origins (REQUIRED - Include your Vercel URL)
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000,http://localhost:5173

# MongoDB Connection (REQUIRED)
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=chat_companion

# JWT Secret (REQUIRED - Generate a strong random key)
JWT_SECRET_KEY=your-super-secret-random-key-min-32-characters-long

# Frontend URL (REQUIRED for password reset emails)
FRONTEND_URL=https://your-app.vercel.app

# Google OAuth (REQUIRED if using Google Sign-In)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Email Configuration (REQUIRED for password reset)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=your-email@gmail.com
```

#### Auto-Configured Variables (Already in render.yaml):

These are automatically set from render.yaml, but you can override them:

```bash
APP_NAME=LegalRAG AI Chatbot
APP_VERSION=1.0.0
DEBUG=False
HOST=0.0.0.0
CHROMA_PERSIST_DIR=/data/chromadb
UPLOADS_DIR=/data/uploads
MAX_FILE_SIZE_MB=10
ALLOWED_EXTENSIONS=pdf,docx,txt
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
TOP_K_RETRIEVAL=4
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
USE_HYBRID_SEARCH=True
USE_RERANKING=True
RETRIEVAL_K=20
SEMANTIC_WEIGHT=0.5
BM25_WEIGHT=0.5
RERANKER_MODEL=cross-encoder/ms-marco-MiniLM-L-6-v2
USE_QUERY_ENHANCEMENT=True
EXPAND_QUERIES=True
USE_CONTEXT_COMPRESSION=True
RELEVANCE_THRESHOLD=0.3
MAX_SENTENCES_PER_DOC=10
MAX_CONTEXT_TOKENS=2000
LLM_TEMPERATURE=0.1
LLM_MAX_TOKENS=500
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_FROM_NAME=LexiAI
RESET_TOKEN_EXPIRE_MINUTES=30
```

### Step 4: Deploy

1. Click **"Create Web Service"** or **"Manual Deploy"**
2. Wait for deployment (first deployment takes 5-10 minutes)
3. Watch build logs for any errors

---

## 🔍 Post-Deployment Verification

### 1. Check Health Endpoint

Visit: `https://your-app.onrender.com/`

Expected response:
```json
{
  "name": "LegalRAG AI Chatbot",
  "version": "1.0.0",
  "status": "running",
  "docs": "/docs"
}
```

### 2. Check API Documentation

Visit: `https://your-app.onrender.com/docs`

You should see the FastAPI Swagger documentation.

### 3. Test Health Check

Visit: `https://your-app.onrender.com/api/health`

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000000",
  "environment": "production"
}
```

### 4. Check Logs

In Render Dashboard → Your Service → "Logs" tab:

Look for:
```
✅ Starting LegalRAG AI Chatbot v1.0.0
✅ Connected to MongoDB: chat_companion
✅ ChromaDB initialized at: /data/chromadb
✅ LLM Provider: gemini
✅ Application started successfully
```

---

## 🔧 Troubleshooting

### Issue: Build Failed

**Symptom**: Build command fails during `pip install`

**Solution**:
1. Check if Python version is correct (3.11.0)
2. Verify requirements.txt is present
3. Check build logs for specific package errors
4. Try adding `--upgrade pip` to build command

### Issue: Application Won't Start

**Symptom**: Start command fails or app crashes immediately

**Solution**:
1. Check environment variables are set correctly
2. Verify MongoDB connection string is correct
3. Check GOOGLE_API_KEY is valid
4. Review logs for specific errors

### Issue: MongoDB Connection Failed

**Symptom**: `MongoDB connection failed` in logs

**Solution**:
1. Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
2. Check MongoDB connection string format
3. Ensure database user has read/write permissions
4. Test connection string locally first

### Issue: CORS Errors from Frontend

**Symptom**: Frontend shows CORS policy errors

**Solution**:
1. Add your Vercel URL to CORS_ORIGINS environment variable
2. Format: `CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000`
3. Redeploy after changing
4. Clear browser cache

### Issue: File Uploads Disappear After Redeploy

**Symptom**: Uploaded documents lost after deployment

**Solution**:
1. Ensure persistent disk is attached (Step 2)
2. Verify mount path is `/data`
3. Check CHROMA_PERSIST_DIR=/data/chromadb
4. Check UPLOADS_DIR=/data/uploads

### Issue: LLM Requests Fail

**Symptom**: Chat queries fail with API errors

**Solution**:
1. Verify GOOGLE_API_KEY is correct
2. Check API key has Gemini API enabled
3. Verify LLM_PROVIDER=gemini
4. Check API quota limits

### Issue: Slow Cold Starts

**Symptom**: First request after inactivity is very slow (30+ seconds)

**Solution**:
1. This is normal for Render free tier (spins down after inactivity)
2. Upgrade to paid plan for always-on instances
3. Subsequent requests will be fast
4. Consider using Render's "Keep Alive" feature (paid plans)

---

## 🎯 Performance Optimization

### For Free Tier:
- Use smaller embedding models (all-MiniLM-L6-v2 ✅)
- Keep chunk size moderate (1000 chars ✅)
- Use single worker (--workers 1 ✅)
- Expect 30-60 second cold starts

### For Paid Tier:
- Increase workers: `--workers 2` or `--workers 4`
- Use larger embedding models if needed
- Increase disk size for more documents
- Enable auto-scaling

---

## 📊 Resource Requirements

### Free Tier Limits:
- ✅ 512 MB RAM (sufficient for this app)
- ✅ 0.1 CPU (sufficient for light usage)
- ✅ Spins down after 15 min inactivity
- ✅ 750 hours/month free

### Recommended for Production:
- Starter Plan: 1 GB RAM, 1 CPU
- Persistent Disk: 1-10 GB
- Always-on: No spin down
- Auto-scaling: Yes

---

## 🔐 Security Checklist

- [x] JWT_SECRET_KEY is strong and random (min 32 chars)
- [x] DEBUG=False in production
- [x] MongoDB credentials not exposed in code
- [x] API keys stored in environment variables
- [x] CORS restricted to specific origins
- [x] .env file not committed to Git
- [x] Email credentials use app-specific passwords

---

## 🌐 Frontend Integration

### Update Frontend Environment Variables:

In your Vercel deployment, set:

```bash
VITE_API_URL=https://your-app.onrender.com
# or
NEXT_PUBLIC_API_URL=https://your-app.onrender.com
```

### Test API Connection:

```javascript
// Test from browser console on Vercel app
fetch('https://your-app.onrender.com/api/health')
  .then(r => r.json())
  .then(console.log)
```

---

## 📝 Environment Variables Reference

### Complete List of Required Environment Variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LLM_PROVIDER` | ✅ Yes | - | "gemini" or "openai" |
| `GOOGLE_API_KEY` | ✅ Yes | - | Google Gemini API key |
| `CORS_ORIGINS` | ✅ Yes | - | Comma-separated URLs |
| `MONGODB_URL` | ✅ Yes | - | MongoDB connection string |
| `JWT_SECRET_KEY` | ✅ Yes | - | Random secret (min 32 chars) |
| `FRONTEND_URL` | ✅ Yes | - | Vercel frontend URL |
| `GOOGLE_CLIENT_ID` | ⚠️ OAuth | - | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | ⚠️ OAuth | - | Google OAuth secret |
| `EMAIL_USER` | ⚠️ Email | - | SMTP email address |
| `EMAIL_PASSWORD` | ⚠️ Email | - | SMTP password |
| `EMAIL_FROM` | ⚠️ Email | - | Sender email address |
| `OPENAI_API_KEY` | Optional | - | If using OpenAI instead |
| `DEBUG` | No | False | Debug mode |
| `CHROMA_PERSIST_DIR` | No | /data/chromadb | Vector DB location |
| `UPLOADS_DIR` | No | /data/uploads | Upload directory |

---

## 🎉 Success Indicators

Your deployment is successful when:

1. ✅ Build completes without errors
2. ✅ Application starts and shows "running" in logs
3. ✅ Health endpoint returns 200 OK
4. ✅ API documentation loads at /docs
5. ✅ MongoDB connection confirmed in logs
6. ✅ Frontend can communicate with backend
7. ✅ File uploads work and persist
8. ✅ Chat queries return valid responses

---

## 📞 Support

If you encounter issues:

1. Check Render logs first
2. Verify all environment variables
3. Test MongoDB connection separately
4. Review this checklist again
5. Check [Render documentation](https://render.com/docs)

---

## 🔄 Updating Deployment

After code changes:

1. Push to GitHub (main branch)
2. Render auto-deploys automatically
3. Check logs for successful deployment
4. Test health endpoint
5. Verify functionality

---

## 📦 What's Included in This Deployment

- ✅ FastAPI backend with all routes
- ✅ RAG pipeline with ChromaDB
- ✅ MongoDB integration
- ✅ JWT authentication
- ✅ Google OAuth support
- ✅ Email service (password reset)
- ✅ File upload handling
- ✅ Hybrid search (Semantic + BM25)
- ✅ Query enhancement
- ✅ Context compression
- ✅ Reranking with cross-encoder
- ✅ CORS configured for Vercel
- ✅ Production-ready logging
- ✅ Health checks
- ✅ API documentation

---

## 🎓 Quick Start Commands

### Generate JWT Secret:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Test MongoDB Connection:
```bash
mongosh "mongodb+srv://username:password@cluster.mongodb.net/"
```

### Test API Locally:
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

**Ready to deploy? Follow the steps above and your backend will be production-ready on Render!** 🚀
