# 🔐 Authentication System - Complete Package

## 📦 What's Included

This authentication system provides enterprise-grade security for your LexiAI application with:

- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Email/Password Auth** - Traditional signup and login
- ✅ **Google OAuth** - One-click Google Sign-In
- ✅ **Protected Routes** - Automatic route protection
- ✅ **User Management** - Profile, avatar, and session handling
- ✅ **Modern UI** - Beautiful, responsive authentication pages
- ✅ **Complete Documentation** - Everything you need to get started

---

## 🚀 Quick Start (5 Minutes)

### 1. Install Dependencies

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend (if needed)
npm install
```

### 2. Configure Environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env and set JWT_SECRET_KEY

# Frontend
cp .env.example .env
# VITE_API_URL should already be correct
```

### 3. Start Everything

```bash
# MongoDB
./start-mongodb.bat

# Backend (in backend directory)
python -m app.main

# Frontend (in project root)
npm run dev
```

### 4. Test It!

1. Open `http://localhost:5173/signup`
2. Create an account
3. You're in! 🎉

**For detailed setup instructions, see [AUTH_QUICKSTART.md](./AUTH_QUICKSTART.md)**

---

## 📚 Documentation

### Getting Started
- **[Quick Start Guide](./AUTH_QUICKSTART.md)** - Get up and running in 5 minutes
- **[Complete Implementation Guide](./AUTH_IMPLEMENTATION.md)** - Detailed technical documentation
- **[Architecture Overview](./AUTH_ARCHITECTURE.md)** - System design and data flows

### Testing & Verification
- **[Testing Checklist](./AUTH_TESTING_CHECKLIST.md)** - Comprehensive test cases
- **[Complete Summary](./AUTH_COMPLETE_SUMMARY.md)** - Implementation status and features

---

## 🎯 Features

### Backend (FastAPI)

#### Authentication
- JWT token generation and verification
- Bcrypt password hashing
- Google OAuth 2.0 integration
- Protected route middleware
- Token refresh endpoint

#### Security
- Password strength validation
- Email uniqueness checking
- Token expiry management
- Environment-based secrets
- CORS configuration

#### API Endpoints
```
POST   /auth/signup    - Register new user
POST   /auth/login     - Login user
POST   /auth/google    - Google OAuth
GET    /auth/me        - Get current user (protected)
POST   /auth/logout    - Logout (protected)
POST   /auth/refresh   - Refresh token (protected)
```

### Frontend (React)

#### Pages
- Modern login page with validation
- Signup page with password strength indicator
- Forgot password placeholder
- Protected chat page

#### Components
- AuthContext for global state
- ProtectedRoute wrapper
- User profile dropdown
- Google Sign-In button
- Toast notifications

#### Features
- Token persistence in localStorage
- Automatic session restoration
- Password show/hide toggle
- Remember me functionality
- Responsive design
- Dark mode support

---

## 🔧 Configuration

### Required Environment Variables

#### Backend (`backend/.env`)
```env
JWT_SECRET_KEY=<your-secure-random-string>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

#### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:8000
```

### Optional: Google OAuth

#### Backend (`backend/.env`)
```env
GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-client-secret>
```

#### Frontend (`.env`)
```env
VITE_GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
```

**Setup Guide**: See [AUTH_QUICKSTART.md](./AUTH_QUICKSTART.md#-google-oauth-setup-optional)

---

## 📁 File Structure

### Backend Files
```
backend/
├── app/
│   ├── api/routes/auth.py              # Auth endpoints
│   ├── middleware/auth_middleware.py   # JWT verification
│   ├── schemas/auth_schema.py          # Request/response models
│   ├── utils/
│   │   ├── jwt_handler.py              # JWT operations
│   │   └── password_handler.py         # Password hashing
│   ├── core/config.py                  # Configuration
│   └── models/db_models.py             # User model
└── requirements.txt                     # Dependencies
```

### Frontend Files
```
src/
├── components/
│   ├── lexi/Navbar.tsx                 # User dropdown
│   └── ProtectedRoute.tsx              # Route protection
├── contexts/AuthContext.tsx            # Auth state
├── hooks/useGoogleAuth.tsx             # Google OAuth
├── routes/
│   ├── login.tsx                       # Login page
│   ├── signup.tsx                      # Signup page
│   └── forgot-password.tsx             # Password reset
└── services/api.ts                     # API client
```

---

## 🧪 Testing

### Manual Testing

1. **Email Signup**
   - Go to `/signup`
   - Create account
   - Verify redirect to `/chat`

2. **Email Login**
   - Go to `/login`
   - Login with credentials
   - Verify redirect to `/chat`

3. **Protected Routes**
   - Logout
   - Try to access `/chat`
   - Verify redirect to `/login`

4. **Google OAuth** (if configured)
   - Click "Continue with Google"
   - Sign in with Google
   - Verify account creation

### API Testing

```bash
# Signup
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"TestPass123"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123","remember_me":false}'

# Get user (use token from login)
curl -X GET http://localhost:8000/auth/me \
  -H "Authorization: Bearer <your-token>"
```

**Full Testing Guide**: See [AUTH_TESTING_CHECKLIST.md](./AUTH_TESTING_CHECKLIST.md)

---

## 🔐 Security

### Implemented Security Features

✅ **Password Security**
- Bcrypt hashing with salt
- Minimum 8 characters
- Requires uppercase, lowercase, and digit
- Never stored in plain text

✅ **Token Security**
- JWT with HMAC-SHA256
- Configurable expiry
- Signed with secret key
- Verified on every request

✅ **API Security**
- Protected endpoints
- CORS configuration
- Input validation
- Error handling

### Production Recommendations

⚠️ **Before deploying to production:**

1. **Generate Secure JWT Secret**
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **Use HTTPS**
   - Configure SSL/TLS
   - Set secure cookie flags
   - Update CORS origins

3. **Additional Security**
   - Add rate limiting
   - Implement CAPTCHA
   - Enable email verification
   - Add 2FA/MFA
   - Monitor failed login attempts

4. **Database Security**
   - Use MongoDB authentication
   - Enable encryption at rest
   - Regular backups
   - Access control

---

## 🎨 User Interface

### Login Page
- Email and password inputs
- Password show/hide toggle
- Remember me checkbox
- Forgot password link
- Google Sign-In button
- Sign up link

### Signup Page
- Name, email, password inputs
- Password strength indicator
- Real-time validation
- Password requirements checklist
- Google Sign-In button
- Login link

### User Dropdown
- User name and email
- Profile picture or initials
- Auth provider badge
- Settings link
- Profile link
- Logout button

---

## 🔄 Authentication Flow

### Email Signup/Login
```
User → Frontend → Backend → MongoDB
                    ↓
              Generate JWT
                    ↓
Frontend ← Token + User Data
    ↓
Save to localStorage
    ↓
Redirect to /chat
```

### Google OAuth
```
User → Google Sign-In → Google Auth
                           ↓
                    Google ID Token
                           ↓
Frontend → Backend → Verify with Google
                           ↓
                    Find/Create User
                           ↓
                    Generate JWT
                           ↓
Frontend ← Token + User Data
```

### Protected Route Access
```
User → /chat → Check Token
                    ↓
              Token Valid?
              ↙         ↘
            Yes         No
             ↓           ↓
        Allow Access   Redirect to /login
```

---

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed, optional for Google users),
  auth_provider: "email" | "google",
  google_id: String (optional),
  profile_picture: String (optional),
  created_at: DateTime
}
```

---

## 🐛 Troubleshooting

### Common Issues

**"Invalid token" error**
- Check JWT_SECRET_KEY is set
- Restart backend after .env changes
- Clear localStorage and login again

**Google button doesn't appear**
- Check VITE_GOOGLE_CLIENT_ID is set
- Restart frontend after .env changes
- Verify Google Cloud Console settings

**CORS errors**
- Check CORS_ORIGINS in backend/.env
- Restart backend after changes

**MongoDB connection failed**
- Ensure MongoDB is running
- Check MONGODB_URL in backend/.env

**Password validation fails**
- Must be 8+ characters
- Must have uppercase letter
- Must have lowercase letter
- Must have digit

---

## 🎓 Usage Examples

### Using Auth Context

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <img src={user.profile_picture} alt={user.name} />
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protecting Routes

```tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';

function PrivatePage() {
  return (
    <ProtectedRoute>
      <div>This content is protected</div>
    </ProtectedRoute>
  );
}
```

### Making Authenticated Requests

```tsx
import api from '@/services/api';

// Token is automatically added to Authorization header
const response = await api.get('/some-protected-endpoint');
```

---

## 🚀 Next Steps

### Immediate Next Steps
1. Follow [AUTH_QUICKSTART.md](./AUTH_QUICKSTART.md) to set up
2. Test all features using [AUTH_TESTING_CHECKLIST.md](./AUTH_TESTING_CHECKLIST.md)
3. Customize UI to match your brand

### Recommended Enhancements
1. **Email Verification** - Verify email addresses
2. **Password Reset** - Implement actual reset flow
3. **Refresh Tokens** - Add token rotation
4. **Rate Limiting** - Prevent brute force attacks
5. **2FA/MFA** - Add two-factor authentication
6. **Social Auth** - Add GitHub, Microsoft, Apple
7. **User Management** - Profile editing, avatar upload
8. **Session Management** - Track active sessions

---

## 📞 Support

### Documentation
- [Quick Start Guide](./AUTH_QUICKSTART.md)
- [Implementation Guide](./AUTH_IMPLEMENTATION.md)
- [Architecture Overview](./AUTH_ARCHITECTURE.md)
- [Testing Checklist](./AUTH_TESTING_CHECKLIST.md)

### API Documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Debugging
1. Check backend logs for errors
2. Check browser console for frontend errors
3. Verify environment variables are set
4. Test API endpoints with curl/Postman
5. Check MongoDB for user data

---

## ✅ Checklist

Before considering the implementation complete:

- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Environment variables configured
- [ ] MongoDB running
- [ ] Backend server running
- [ ] Frontend server running
- [ ] Can create account
- [ ] Can login
- [ ] Can logout
- [ ] Protected routes work
- [ ] User dropdown works
- [ ] Token persists after refresh
- [ ] All tests pass

---

## 🎉 Success!

If you can:
- ✅ Create an account
- ✅ Login successfully
- ✅ See your profile in navbar
- ✅ Access protected routes
- ✅ Logout and be redirected

**Your authentication system is working perfectly!** 🚀

---

## 📝 License

This authentication system is part of the LexiAI project.

---

## 🙏 Credits

Built with:
- FastAPI - Modern Python web framework
- React - UI library
- MongoDB - Database
- JWT - Token authentication
- Bcrypt - Password hashing
- Google OAuth - Social authentication

---

**Ready to get started? Follow the [Quick Start Guide](./AUTH_QUICKSTART.md)!**
