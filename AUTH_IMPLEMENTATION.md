# Authentication System Implementation Guide

## Overview

Complete JWT-based authentication system with Google OAuth integration for the LexiAI application.

## Features Implemented

### Backend (FastAPI)

✅ **JWT Authentication**
- Token generation with configurable expiry
- Token verification middleware
- Secure password hashing with bcrypt
- Protected route dependencies

✅ **User Management**
- Email/password signup with validation
- Login with "remember me" option
- User profile retrieval
- Logout endpoint

✅ **Google OAuth**
- Google ID token verification
- Automatic user creation on first login
- Profile picture and Google ID storage
- Seamless integration with existing users

✅ **Security Features**
- Password strength validation (min 8 chars, uppercase, lowercase, digit)
- Bcrypt password hashing
- JWT token expiry
- Duplicate email prevention
- Auth provider tracking

### Frontend (React + TailwindCSS)

✅ **Authentication Pages**
- Modern, responsive login page
- Signup page with password strength indicator
- Forgot password placeholder page
- Google Sign-In button integration

✅ **Auth Context**
- Global authentication state management
- Token persistence in localStorage
- Automatic token validation on app load
- User session management

✅ **Protected Routes**
- Route protection component
- Automatic redirect to login
- Loading states during auth check

✅ **User Interface**
- User profile dropdown in navbar
- Avatar display (initials or profile picture)
- Logout functionality
- Auth provider badge (Google/Email)
- Toast notifications for auth events

## File Structure

### Backend

```
backend/
├── app/
│   ├── api/
│   │   └── routes/
│   │       └── auth.py              # Authentication endpoints
│   ├── core/
│   │   └── config.py                # JWT & Google OAuth config
│   ├── middleware/
│   │   └── auth_middleware.py      # JWT verification dependency
│   ├── models/
│   │   └── db_models.py            # Updated User model
│   ├── schemas/
│   │   └── auth_schema.py          # Auth request/response models
│   └── utils/
│       ├── jwt_handler.py          # JWT token operations
│       └── password_handler.py     # Password hashing
├── requirements.txt                 # Updated dependencies
└── .env.example                     # Environment variables template
```

### Frontend

```
src/
├── components/
│   ├── lexi/
│   │   └── Navbar.tsx              # Updated with user dropdown
│   └── ProtectedRoute.tsx          # Route protection component
├── contexts/
│   └── AuthContext.tsx             # Authentication state management
├── hooks/
│   └── useGoogleAuth.tsx           # Google OAuth integration
├── routes/
│   ├── __root.tsx                  # Updated with AuthProvider
│   ├── login.tsx                   # Login page
│   ├── signup.tsx                  # Signup page
│   ├── forgot-password.tsx         # Password reset placeholder
│   └── chat.tsx                    # Protected chat page
├── services/
│   └── api.ts                      # Updated with auth endpoints
├── .env                            # Environment variables
└── .env.example                    # Environment template
```

## API Endpoints

### Authentication Routes

All routes are prefixed with `/auth`

#### POST /auth/signup
Register new user with email and password.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "profile_picture": null,
    "auth_provider": "email",
    "created_at": "2024-01-15T10:30:00"
  }
}
```

#### POST /auth/login
Login with email and password.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123",
  "remember_me": false
}
```

**Response:** Same as signup

#### POST /auth/google
Authenticate with Google OAuth.

**Request:**
```json
{
  "token": "google_id_token_here"
}
```

**Response:** Same as signup

#### GET /auth/me
Get current user information (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "profile_picture": "https://lh3.googleusercontent.com/a/...",
  "auth_provider": "google",
  "created_at": "2024-01-15T10:30:00"
}
```

#### POST /auth/logout
Logout user (Protected).

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

#### POST /auth/refresh
Refresh JWT token (Protected).

**Response:** Same as login

## MongoDB User Schema

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed, optional for Google users),
  auth_provider: String ("email" | "google"),
  google_id: String (optional),
  profile_picture: String (optional),
  created_at: DateTime
}
```

## Environment Variables

### Backend (.env)

```env
# JWT Authentication
JWT_SECRET_KEY=your-secret-key-change-in-production-min-32-chars-long-random-string
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7 days

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Frontend (.env)

```env
# Backend API URL
VITE_API_URL=http://localhost:8000

# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

## Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Update .env file with your credentials
cp .env.example .env
# Edit .env and add:
# - JWT_SECRET_KEY (generate a secure random string)
# - GOOGLE_CLIENT_ID (from Google Cloud Console)
# - GOOGLE_CLIENT_SECRET (from Google Cloud Console)

# Start the backend
python -m app.main
```

### 2. Frontend Setup

```bash
# Install dependencies (if not already done)
npm install

# Update .env file
cp .env.example .env
# Edit .env and add:
# - VITE_GOOGLE_CLIENT_ID (same as backend)

# Start the frontend
npm run dev
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Add authorized JavaScript origins:
   - `http://localhost:5173` (development)
   - Your production domain
7. Add authorized redirect URIs (if needed)
8. Copy Client ID and Client Secret
9. Add to both backend and frontend .env files

### 4. Generate JWT Secret Key

```bash
# Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Or OpenSSL
openssl rand -base64 32
```

## Testing the Authentication

### 1. Test Email Signup/Login

```bash
# Signup
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123"
  }'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "remember_me": false
  }'

# Get user info (use token from login response)
curl -X GET http://localhost:8000/auth/me \
  -H "Authorization: Bearer <your_token_here>"
```

### 2. Test Google OAuth

1. Open the frontend at `http://localhost:5173/login`
2. Click "Continue with Google"
3. Sign in with your Google account
4. You should be redirected to `/chat`

### 3. Test Protected Routes

1. Try accessing `/chat` without logging in → redirects to `/login`
2. Login and access `/chat` → works
3. Logout and try `/chat` again → redirects to `/login`

## Security Best Practices

✅ **Implemented:**
- Passwords hashed with bcrypt (never stored plain)
- JWT tokens with expiry
- HTTPS recommended for production
- Environment variables for secrets
- Input validation on all endpoints
- Password strength requirements

⚠️ **Additional Recommendations:**
- Use HTTPS in production (configure reverse proxy)
- Set secure cookie flags if using cookies
- Implement rate limiting on auth endpoints
- Add CAPTCHA for signup/login
- Implement email verification
- Add 2FA for enhanced security
- Rotate JWT secret keys periodically
- Monitor failed login attempts
- Implement account lockout after failed attempts

## Frontend Usage

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

### Making Authenticated API Calls

The axios instance automatically includes the JWT token:

```tsx
import api from '@/services/api';

// Token is automatically added to Authorization header
const response = await api.get('/some-protected-endpoint');
```

## Troubleshooting

### Backend Issues

**Problem:** "Invalid token" errors
- Check JWT_SECRET_KEY matches between token creation and verification
- Verify token hasn't expired
- Check Authorization header format: `Bearer <token>`

**Problem:** Google OAuth fails
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
- Check authorized origins in Google Cloud Console
- Ensure Google+ API is enabled

**Problem:** Password validation fails
- Password must be at least 8 characters
- Must contain uppercase, lowercase, and digit
- Check password requirements in signup form

### Frontend Issues

**Problem:** Google Sign-In button doesn't appear
- Check VITE_GOOGLE_CLIENT_ID is set in .env
- Verify Google Identity Services script loads
- Check browser console for errors

**Problem:** Token not persisting
- Check localStorage is enabled in browser
- Verify token is being saved in AuthContext
- Check for localStorage quota issues

**Problem:** Redirects not working
- Verify TanStack Router is configured correctly
- Check ProtectedRoute component is wrapping protected pages
- Ensure AuthProvider is in the component tree

## Next Steps

### Recommended Enhancements

1. **Email Verification**
   - Send verification email on signup
   - Verify email before allowing login
   - Add resend verification endpoint

2. **Password Reset**
   - Implement actual password reset flow
   - Send reset token via email
   - Add reset password endpoint

3. **Refresh Tokens**
   - Implement refresh token rotation
   - Store refresh tokens securely
   - Auto-refresh before expiry

4. **Social Auth**
   - Add GitHub OAuth
   - Add Microsoft OAuth
   - Add Apple Sign-In

5. **Security Enhancements**
   - Add rate limiting
   - Implement CAPTCHA
   - Add 2FA/MFA
   - Session management
   - Device tracking

6. **User Management**
   - Profile editing
   - Avatar upload
   - Account deletion
   - Password change
   - Email change

## Support

For issues or questions:
1. Check this documentation
2. Review error logs in backend console
3. Check browser console for frontend errors
4. Verify environment variables are set correctly
5. Test with curl/Postman to isolate frontend/backend issues

## License

This authentication system is part of the LexiAI project.
