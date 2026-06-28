# ⚡ Quick Deploy to Render - Cheat Sheet

## 🚀 Ultra-Fast Deployment (5 Minutes)

### Step 1: Prerequisites (2 min)
```bash
✅ MongoDB Atlas URL: mongodb+srv://username:password@cluster.mongodb.net/
✅ Google API Key: AIzaSy...
✅ Vercel Frontend URL: https://your-app.vercel.app
✅ JWT Secret: (Generate with command below)
```

**Generate JWT Secret:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

### Step 2: Create Render Service (1 min)

1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Select branch: `main`

**Service Settings:**
- Name: `legalrag-backend`
- Root Directory: `backend`
- Runtime: `Python 3`
- Build: `pip install --upgrade pip && pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1`
- Plan: Free (or paid)

---

### Step 3: Add Persistent Disk (30 sec)

**⚠️ CRITICAL - Don't skip this!**

In service → **Disks** tab:
- Name: `legalrag-data`
- Mount Path: `/data`
- Size: `1 GB`

---

### Step 4: Set Environment Variables (2 min)

In service → **Environment** tab, add:

```bash
# REQUIRED
LLM_PROVIDER=gemini
GOOGLE_API_KEY=<your-api-key>
MONGODB_URL=<your-mongodb-url>
JWT_SECRET_KEY=<generated-secret>
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
FRONTEND_URL=https://your-app.vercel.app

# OPTIONAL (for OAuth)
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-secret>

# OPTIONAL (for email)
EMAIL_USER=<your-email>
EMAIL_PASSWORD=<your-password>
EMAIL_FROM=<your-email>
```

---

### Step 5: Deploy (30 sec)

Click **"Create Web Service"** or **"Manual Deploy"**

Wait 5-10 minutes for first deployment.

---

### Step 6: Verify (30 sec)

```bash
# Health check
curl https://your-app.onrender.com/api/health

# Expected: {"status":"healthy",...}
```

Visit: `https://your-app.onrender.com/docs`

---

## ✅ Quick Checklist

- [ ] MongoDB Atlas cluster ready
- [ ] Google API key obtained
- [ ] JWT secret generated
- [ ] Render service created
- [ ] Persistent disk added (1GB at /data)
- [ ] All environment variables set
- [ ] Deployment successful
- [ ] Health check returns 200
- [ ] API docs accessible

---

## 🆘 Quick Troubleshooting

### Build Failed?
- Check `requirements.txt` exists
- Verify Python 3.11.0
- Check build logs

### App Won't Start?
- Verify `MONGODB_URL` format
- Check `GOOGLE_API_KEY` is valid
- Review environment variables

### CORS Errors?
- Add your Vercel URL to `CORS_ORIGINS`
- Include protocol: `https://...`

### Files Disappear?
- Ensure persistent disk is attached
- Mount path must be `/data`

---

## 📋 Environment Variables - Copy/Paste Template

```bash
LLM_PROVIDER=gemini
GOOGLE_API_KEY=
MONGODB_URL=
JWT_SECRET_KEY=
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
FRONTEND_URL=https://your-app.vercel.app
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=
```

---

## 🔗 Quick Links

- **Full Guide**: [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)
- **Changes**: [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)
- **Test**: Run `python test_deployment_readiness.py`

---

## 🎯 Success Indicators

✅ Build completes without errors
✅ Service shows "Live" status
✅ Health endpoint returns `{"status":"healthy"}`
✅ API docs load at `/docs`
✅ Logs show "Application started successfully"

---

**That's it! Your backend is deployed!** 🎉

For detailed instructions, see [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)
