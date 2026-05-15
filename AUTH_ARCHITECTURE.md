# Authentication System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│                     http://localhost:5173                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Login Page   │  │ Signup Page  │  │ Chat Page    │          │
│  │              │  │              │  │ (Protected)  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────────────┴──────────────────┘                  │
│                            │                                      │
│                    ┌───────▼────────┐                            │
│                    │  AuthContext   │                            │
│                    │  - user        │                            │
│                    │  - token       │                            │
│                    │  - login()     │                            │
│                    │  - signup()    │                            │
│                    │  - logout()    │                            │
│                    └───────┬────────┘                            │
│                            │                                      │
│                    ┌───────▼────────┐                            │
│                    │   API Service  │                            │
│                    │   (axios)      │                            │
│                    └───────┬────────┘                            │
│                            │                                      │
└────────────────────────────┼──────────────────────────────────────┘
                             │
                             │ HTTP Requests
                             │ Authorization: Bearer <token>
                             │
┌────────────────────────────▼──────────────────────────────────────┐
│                      Backend (FastAPI)                             │
│                    http://localhost:8000                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                    Auth Routes (/auth)                        │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │  POST /auth/signup    - Register new user                    │ │
│  │  POST /auth/login     - Login user                           │ │
│  │  POST /auth/google    - Google OAuth                         │ │
│  │  GET  /auth/me        - Get current user (Protected)         │ │
│  │  POST /auth/logout    - Logout (Protected)                   │ │
│  │  POST /auth/refresh   - Refresh token (Protected)            │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                            │                                        │
│  ┌─────────────────────────▼──────────────────────────────────┐   │
│  │              Auth Middleware (JWT Verification)             │   │
│  │  - Extract token from Authorization header                  │   │
│  │  - Verify token signature                                   │   │
│  │  - Check token expiry                                       │   │
│  │  - Load user from database                                  │   │
│  └─────────────────────────┬──────────────────────────────────┘   │
│                            │                                        │
│  ┌─────────────────────────▼──────────────────────────────────┐   │
│  │                    Utility Modules                          │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │  JWT Handler:                                               │   │
│  │  - create_access_token()                                    │   │
│  │  - verify_token()                                           │   │
│  │  - decode_token()                                           │   │
│  │                                                             │   │
│  │  Password Handler:                                          │   │
│  │  - hash_password()                                          │   │
│  │  - verify_password()                                        │   │
│  └─────────────────────────┬──────────────────────────────────┘   │
│                            │                                        │
└────────────────────────────┼────────────────────────────────────────┘
                             │
                             │ Database Operations
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                      MongoDB Database                               │
│                   mongodb://localhost:27017                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                    Users Collection                         │    │
│  ├────────────────────────────────────────────────────────────┤    │
│  │  {                                                          │    │
│  │    _id: ObjectId,                                           │    │
│  │    name: String,                                            │    │
│  │    email: String (unique),                                  │    │
│  │    password: String (hashed),                               │    │
│  │    auth_provider: "email" | "google",                       │    │
│  │    google_id: String (optional),                            │    │
│  │    profile_picture: String (optional),                      │    │
│  │    created_at: DateTime                                     │    │
│  │  }                                                          │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

## Authentication Flows

### 1. Email Signup Flow

```
┌─────────┐                ┌──────────┐                ┌──────────┐
│ Browser │                │ Frontend │                │ Backend  │
└────┬────┘                └────┬─────┘                └────┬─────┘
     │                          │                           │
     │  1. Fill signup form     │                           │
     ├─────────────────────────>│                           │
     │                          │                           │
     │                          │  2. POST /auth/signup     │
     │                          │  {name, email, password}  │
     │                          ├──────────────────────────>│
     │                          │                           │
     │                          │                           │  3. Validate input
     │                          │                           │─────────┐
     │                          │                           │         │
     │                          │                           │<────────┘
     │                          │                           │
     │                          │                           │  4. Check email exists
     │                          │                           │─────────┐
     │                          │                           │         │
     │                          │                           │<────────┘
     │                          │                           │
     │                          │                           │  5. Hash password
     │                          │                           │─────────┐
     │                          │                           │         │
     │                          │                           │<────────┘
     │                          │                           │
     │                          │                           │  6. Create user in DB
     │                          │                           │─────────┐
     │                          │                           │         │
     │                          │                           │<────────┘
     │                          │                           │
     │                          │                           │  7. Generate JWT
     │                          │                           │─────────┐
     │                          │                           │         │
     │                          │                           │<────────┘
     │                          │                           │
     │                          │  8. Return token + user   │
     │                          │<──────────────────────────┤
     │                          │                           │
     │                          │  9. Save to localStorage  │
     │                          │─────────┐                 │
     │                          │         │                 │
     │                          │<────────┘                 │
     │                          │                           │
     │  10. Redirect to /chat   │                           │
     │<─────────────────────────┤                           │
     │                          │                           │
```

### 2. Email Login Flow

```
┌─────────┐                ┌──────────┐                ┌──────────┐
│ Browser │                │ Frontend │                │ Backend  │
└────┬────┘                └────┬─────┘                └────┬─────┘
     │                          │                           │
     │  1. Fill login form      │                           │
     ├─────────────────────────>│                           │
     │                          │                           │
     │                          │  2. POST /auth/login      │
     │                          │  {email, password}        │
     │                          ├──────────────────────────>│
     │                          │                           │
     │                          │                           │  3. Find user by email
     │                          │                           │─────────┐
     │                          │                           │         │
     │                          │                           │<────────┘
     │                          │                           │
     │                          │                           │  4. Verify password
     │                          │                           │─────────┐
     │                          │                           │         │
     │                          │                           │<────────┘
     │                          │                           │
     │                          │                           │  5. Generate JWT
     │                          │                           │─────────┐
     │                          │                           │         │
     │                          │                           │<────────┘
     │                          │                           │
     │                          │  6. Return token + user   │
     │                          │<──────────────────────────┤
     │                          │                           │
     │                          │  7. Save to localStorage  │
     │                          │─────────┐                 │
     │                          │         │                 │
     │                          │<────────┘                 │
     │                          │                           │
     │  8. Redirect to /chat    │                           │
     │<─────────────────────────┤                           │
     │                          │                           │
```

### 3. Google OAuth Flow

```
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Browser │     │ Frontend │     │  Google  │     │ Backend  │     │ MongoDB  │
└────┬────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │               │                │                │                │
     │  1. Click     │                │                │                │
     │  "Google"     │                │                │                │
     ├──────────────>│                │                │                │
     │               │                │                │                │
     │               │  2. Open       │                │                │
     │               │  Google popup  │                │                │
     │               ├───────────────>│                │                │
     │               │                │                │                │
     │  3. Google Sign-In UI          │                │                │
     │<───────────────────────────────┤                │                │
     │                                │                │                │
     │  4. User authenticates         │                │                │
     ├───────────────────────────────>│                │                │
     │                                │                │                │
     │               │  5. ID Token   │                │                │
     │               │<───────────────┤                │                │
     │               │                │                │                │
     │               │  6. POST /auth/google           │                │
     │               │  {token}       │                │                │
     │               ├────────────────┼───────────────>│                │
     │               │                │                │                │
     │               │                │  7. Verify     │                │
     │               │                │  token         │                │
     │               │                │<───────────────┤                │
     │               │                │                │                │
     │               │                │  8. Token OK   │                │
     │               │                ├───────────────>│                │
     │               │                │                │                │
     │               │                │                │  9. Find/Create user
     │               │                │                ├───────────────>│
     │               │                │                │                │
     │               │                │                │  10. User data │
     │               │                │                │<───────────────┤
     │               │                │                │                │
     │               │                │                │  11. Generate JWT
     │               │                │                │─────────┐      │
     │               │                │                │         │      │
     │               │                │                │<────────┘      │
     │               │                │                │                │
     │               │  12. Return token + user        │                │
     │               │<────────────────────────────────┤                │
     │               │                │                │                │
     │               │  13. Save to localStorage       │                │
     │               │─────────┐      │                │                │
     │               │         │      │                │                │
     │               │<────────┘      │                │                │
     │               │                │                │                │
     │  14. Redirect │                │                │                │
     │  to /chat     │                │                │                │
     │<──────────────┤                │                │                │
     │               │                │                │                │
```

### 4. Protected Route Access Flow

```
┌─────────┐                ┌──────────┐                ┌──────────┐
│ Browser │                │ Frontend │                │ Backend  │
└────┬────┘                └────┬─────┘                └────┬─────┘
     │                          │                           │
     │  1. Access /chat         │                           │
     ├─────────────────────────>│                           │
     │                          │                           │
     │                          │  2. Check token exists    │
     │                          │─────────┐                 │
     │                          │         │                 │
     │                          │<────────┘                 │
     │                          │                           │
     │                          │  3. GET /chat             │
     │                          │  Authorization: Bearer    │
     │                          ├──────────────────────────>│
     │                          │                           │
     │                          │                           │  4. Extract token
     │                          │                           │─────────┐
     │                          │                           │         │
     │                          │                           │<────────┘
     │                          │                           │
     │                          │                           │  5. Verify token
     │                          │                           │─────────┐
     │                          │                           │         │
     │                          │                           │<────────┘
     │                          │                           │
     │                          │                           │  6. Load user
     │                          │                           │─────────┐
     │                          │                           │         │
     │                          │                           │<────────┘
     │                          │                           │
     │                          │  7. Return protected data │
     │                          │<──────────────────────────┤
     │                          │                           │
     │  8. Render chat page     │                           │
     │<─────────────────────────┤                           │
     │                          │                           │
```

## Component Architecture

### Frontend Component Hierarchy

```
App (Root)
├── AuthProvider (Context)
│   ├── ThemeProvider
│   │   ├── ChatProvider
│   │   │   └── Router
│   │   │       ├── Login Page
│   │   │       ├── Signup Page
│   │   │       ├── Forgot Password Page
│   │   │       └── Chat Page (Protected)
│   │   │           └── ProtectedRoute
│   │   │               └── MainLayout
│   │   │                   ├── Navbar
│   │   │                   │   └── UserDropdown
│   │   │                   ├── Sidebar
│   │   │                   └── ChatLayout
└── Toaster (Notifications)
```

### Backend Module Structure

```
FastAPI App
├── CORS Middleware
├── Routers
│   ├── /health (Public)
│   ├── /auth (Mixed)
│   │   ├── POST /signup (Public)
│   │   ├── POST /login (Public)
│   │   ├── POST /google (Public)
│   │   ├── GET /me (Protected)
│   │   ├── POST /logout (Protected)
│   │   └── POST /refresh (Protected)
│   ├── /upload (Protected)
│   ├── /chat (Protected)
│   └── /documents (Protected)
├── Dependencies
│   ├── get_current_user (JWT verification)
│   └── get_current_user_optional
└── Database
    └── MongoDB Connection
```

## Security Architecture

### Password Security

```
User Password
     │
     ▼
┌─────────────────┐
│  Frontend       │
│  Validation     │
│  - Min 8 chars  │
│  - Uppercase    │
│  - Lowercase    │
│  - Digit        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend        │
│  Validation     │
│  (Same rules)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Bcrypt Hash    │
│  - Salt rounds  │
│  - One-way hash │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  MongoDB        │
│  Storage        │
│  (Hashed only)  │
└─────────────────┘
```

### JWT Token Structure

```
Header
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload
{
  "sub": "user@example.com",  // User email
  "exp": 1234567890,          // Expiry timestamp
  "iat": 1234567890           // Issued at timestamp
}

Signature
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  JWT_SECRET_KEY
)
```

### Token Lifecycle

```
1. Token Creation
   ├── User logs in
   ├── Backend generates JWT
   ├── Token includes user email + expiry
   └── Signed with JWT_SECRET_KEY

2. Token Storage
   ├── Frontend receives token
   ├── Stored in localStorage
   └── Added to axios interceptor

3. Token Usage
   ├── Every API request
   ├── Added to Authorization header
   ├── Format: "Bearer <token>"
   └── Backend verifies on protected routes

4. Token Verification
   ├── Extract from header
   ├── Verify signature
   ├── Check expiry
   ├── Load user from DB
   └── Allow/Deny access

5. Token Expiry
   ├── Default: 7 days
   ├── Remember me: 30 days
   ├── After expiry: 401 error
   └── User must login again
```

## Data Flow Diagram

### User Registration & Login

```
┌──────────────────────────────────────────────────────────────────┐
│                         User Actions                              │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
         ┌──────▼──────┐         ┌─────▼──────┐
         │   Signup    │         │   Login    │
         └──────┬──────┘         └─────┬──────┘
                │                      │
                │                      │
         ┌──────▼──────────────────────▼──────┐
         │        Frontend Validation          │
         │  - Email format                     │
         │  - Password strength                │
         │  - Required fields                  │
         └──────┬──────────────────────────────┘
                │
                │ HTTP POST
                │
         ┌──────▼──────────────────────────────┐
         │        Backend Validation            │
         │  - Pydantic schema validation        │
         │  - Email uniqueness (signup)         │
         │  - Password requirements             │
         └──────┬──────────────────────────────┘
                │
                │
         ┌──────▼──────────────────────────────┐
         │      Password Processing             │
         │  - Hash with bcrypt (signup)         │
         │  - Verify hash (login)               │
         └──────┬──────────────────────────────┘
                │
                │
         ┌──────▼──────────────────────────────┐
         │      Database Operation              │
         │  - Insert user (signup)              │
         │  - Find user (login)                 │
         └──────┬──────────────────────────────┘
                │
                │
         ┌──────▼──────────────────────────────┐
         │      JWT Token Generation            │
         │  - Create payload                    │
         │  - Set expiry                        │
         │  - Sign with secret                  │
         └──────┬──────────────────────────────┘
                │
                │ HTTP Response
                │
         ┌──────▼──────────────────────────────┐
         │      Frontend Token Storage          │
         │  - Save to localStorage              │
         │  - Update AuthContext                │
         │  - Redirect to /chat                 │
         └──────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 19
- **Router**: TanStack Router
- **Styling**: TailwindCSS
- **HTTP Client**: Axios
- **State Management**: React Context
- **Notifications**: Sonner
- **Animations**: Framer Motion
- **OAuth**: Google Identity Services

### Backend
- **Framework**: FastAPI
- **Authentication**: JWT (python-jose)
- **Password Hashing**: Bcrypt (passlib)
- **OAuth**: Google Auth Library
- **Database**: MongoDB (motor)
- **Validation**: Pydantic
- **Logging**: Loguru

### Database
- **Type**: MongoDB
- **Collections**: users, chat_sessions, documents
- **Indexes**: email (unique)

## Environment Configuration

```
┌─────────────────────────────────────────────────────────────┐
│                    Environment Variables                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Backend (.env)                  Frontend (.env)            │
│  ├── JWT_SECRET_KEY              ├── VITE_API_URL           │
│  ├── JWT_ALGORITHM               └── VITE_GOOGLE_CLIENT_ID  │
│  ├── ACCESS_TOKEN_EXPIRE_MINUTES                            │
│  ├── GOOGLE_CLIENT_ID                                       │
│  ├── GOOGLE_CLIENT_SECRET                                   │
│  ├── MONGODB_URL                                            │
│  └── CORS_ORIGINS                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      Production Setup                         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────┐      ┌────────────┐      ┌────────────┐    │
│  │   Nginx    │      │  Frontend  │      │  Backend   │    │
│  │  (Reverse  │─────>│   (React)  │─────>│  (FastAPI) │    │
│  │   Proxy)   │      │            │      │            │    │
│  └────────────┘      └────────────┘      └─────┬──────┘    │
│       │                                         │            │
│       │ HTTPS                                   │            │
│       │                                         │            │
│       │                              ┌──────────▼──────┐    │
│       │                              │    MongoDB      │    │
│       │                              │   (Replica Set) │    │
│       │                              └─────────────────┘    │
│       │                                                      │
│       │                              ┌─────────────────┐    │
│       └─────────────────────────────>│  Google OAuth   │    │
│                                      │    Services     │    │
│                                      └─────────────────┘    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

This architecture provides a secure, scalable, and maintainable authentication system that integrates seamlessly with your existing LexiAI application.
