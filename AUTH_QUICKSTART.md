# Authentication Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and update:

```env
# Generate a secure secret key (run this command):
# python -c "import secrets; print(secrets.token_urlsafe(32))"
JWT_SECRET_KEY=your-generated-secret-key-here

# Optional: Add Google OAuth (skip for now if testing email auth only)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Step 3: Configure Frontend Environment

```bash
# From project root
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:8000

# Optional: Add Google OAuth Client ID (skip for now if testing email auth only)
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### Step 4: Start MongoDB

```bash
# If using the provided script
./start-mongodb.bat

# Or start MongoDB manually
mongod --dbpath ./data/mongodb
```

### Step 5: Start Backend

```bash
cd backend
python -m app.main
```

Backend will start at: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

### Step 6: Start Frontend

```bash
# From project root
npm run dev
```

Frontend will start at: `http://localhost:5173`

## ✅ Test Authentication

### Test 1: Email Signup

1. Open `http://localhost:5173/signup`
2. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Password: TestPass123
3. Click "Create account"
4. You should be redirected to `/chat`

### Test 2: Email Login

1. Open `http://localhost:5173/login`
2. Enter credentials:
   - Email: test@example.com
   - Password: TestPass123
3. Click "Sign in"
4. You should be redirected to `/chat`

### Test 3: Protected Routes

1. Logout (click user avatar → Logout)
2. Try to access `http://localhost:5173/chat`
3. You should be redirected to `/login`

### Test 4: User Profile

1. Login
2. Click on your avatar in the top-right
3. You should see:
   - Your name and email
   - Settings option
   - Logout button

## 🔐 Google OAuth Setup (Optional)

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen:
   - User Type: External
   - App name: LexiAI
   - User support email: your email
   - Developer contact: your email
6. Create OAuth Client ID:
   - Application type: Web application
   - Name: LexiAI Web Client
   - Authorized JavaScript origins:
     - `http://localhost:5173`
   - Click "Create"
7. Copy the Client ID and Client Secret

### Step 2: Add Credentials to Environment

**Backend** (`backend/.env`):
```env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
```

**Frontend** (`.env`):
```env
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

### Step 3: Restart Both Servers

```bash
# Stop and restart backend
cd backend
python -m app.main

# Stop and restart frontend
npm run dev
```

### Step 4: Test Google Login

1. Open `http://localhost:5173/login`
2. Click "Continue with Google" button
3. Sign in with your Google account
4. You should be redirected to `/chat`
5. Your profile picture should appear in the navbar

## 🧪 API Testing with curl

### Signup

```bash
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test User",
    "email": "apitest@example.com",
    "password": "ApiTest123"
  }'
```

### Login

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "apitest@example.com",
    "password": "ApiTest123",
    "remember_me": false
  }'
```

Save the `access_token` from the response.

### Get User Info

```bash
curl -X GET http://localhost:8000/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### Logout

```bash
curl -X POST http://localhost:8000/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

## 📊 Check MongoDB

```bash
# Connect to MongoDB
mongosh

# Switch to database
use chat_companion

# View users
db.users.find().pretty()

# Count users
db.users.countDocuments()
```

## 🐛 Common Issues

### Issue: "Invalid token" error

**Solution:**
- Make sure JWT_SECRET_KEY is set in backend/.env
- Restart the backend after changing .env
- Clear localStorage in browser and login again

### Issue: Google button doesn't appear

**Solution:**
- Check VITE_GOOGLE_CLIENT_ID is set in .env
- Restart frontend after changing .env
- Check browser console for errors
- Verify Google Cloud Console settings

### Issue: CORS errors

**Solution:**
- Check CORS_ORIGINS in backend/.env includes `http://localhost:5173`
- Restart backend after changes

### Issue: MongoDB connection failed

**Solution:**
- Make sure MongoDB is running
- Check MONGODB_URL in backend/.env
- Default: `mongodb://localhost:27017`

### Issue: Password validation fails

**Solution:**
Password must have:
- At least 8 characters
- One uppercase letter
- One lowercase letter
- One digit

Example valid password: `TestPass123`

## 🎯 What's Working

✅ Email signup with password validation
✅ Email login with "remember me"
✅ Google OAuth login/signup
✅ JWT token authentication
✅ Protected routes
✅ User profile dropdown
✅ Logout functionality
✅ Token persistence in localStorage
✅ Automatic token validation
✅ Profile picture display (Google users)
✅ Auth provider badges
✅ Toast notifications
✅ Password show/hide toggle
✅ Forgot password UI (placeholder)

## 🔄 User Flow

### New User (Email)
1. Visit `/signup`
2. Fill form with name, email, password
3. Submit → Account created
4. Redirected to `/chat`
5. Token saved in localStorage
6. User info displayed in navbar

### Returning User (Email)
1. Visit `/login`
2. Enter email and password
3. Optional: Check "Remember me"
4. Submit → Logged in
5. Redirected to `/chat`

### New User (Google)
1. Visit `/login` or `/signup`
2. Click "Continue with Google"
3. Sign in with Google
4. Account auto-created
5. Redirected to `/chat`
6. Profile picture displayed

### Returning User (Google)
1. Visit `/login`
2. Click "Continue with Google"
3. Sign in with Google
4. Logged in automatically
5. Redirected to `/chat`

## 📝 Next Steps

After basic auth is working:

1. **Test with real users**
   - Create multiple accounts
   - Test login/logout flows
   - Verify token expiry

2. **Customize**
   - Update branding
   - Modify token expiry times
   - Add custom validation rules

3. **Enhance Security**
   - Add rate limiting
   - Implement email verification
   - Add password reset flow
   - Enable 2FA

4. **Production Deployment**
   - Use HTTPS
   - Set secure JWT secret
   - Configure production OAuth origins
   - Set up proper MongoDB instance

## 🆘 Need Help?

1. Check `AUTH_IMPLEMENTATION.md` for detailed documentation
2. Review backend logs for errors
3. Check browser console for frontend errors
4. Test API endpoints with curl/Postman
5. Verify all environment variables are set

## 🎉 Success!

If you can:
- ✅ Create an account
- ✅ Login
- ✅ See your name in navbar
- ✅ Access protected routes
- ✅ Logout

**Your authentication system is working!** 🚀
