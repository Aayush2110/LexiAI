# Authentication System Testing Checklist

Use this checklist to verify that all authentication features are working correctly.

## 🔧 Pre-Testing Setup

### Backend Setup
- [ ] MongoDB is running (`./start-mongodb.bat` or `mongod`)
- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] `backend/.env` file exists with required variables
- [ ] JWT_SECRET_KEY is set (min 32 characters)
- [ ] Backend server is running (`python -m app.main`)
- [ ] Backend accessible at `http://localhost:8000`
- [ ] API docs accessible at `http://localhost:8000/docs`

### Frontend Setup
- [ ] Frontend dependencies installed (`npm install`)
- [ ] `.env` file exists with VITE_API_URL
- [ ] Frontend server is running (`npm run dev`)
- [ ] Frontend accessible at `http://localhost:5173`

### Optional: Google OAuth Setup
- [ ] Google Cloud project created
- [ ] OAuth credentials configured
- [ ] GOOGLE_CLIENT_ID set in backend/.env
- [ ] GOOGLE_CLIENT_SECRET set in backend/.env
- [ ] VITE_GOOGLE_CLIENT_ID set in frontend .env
- [ ] Authorized origins configured in Google Console

---

## 📝 Functional Testing

### 1. Email Signup Flow

#### Test Case 1.1: Successful Signup
- [ ] Navigate to `http://localhost:5173/signup`
- [ ] Fill in form:
  - Name: `Test User`
  - Email: `test@example.com`
  - Password: `TestPass123`
- [ ] Password strength indicator shows all requirements met
- [ ] Click "Create account"
- [ ] Success toast notification appears
- [ ] Redirected to `/chat`
- [ ] User avatar appears in navbar (initials "TU")
- [ ] Token saved in localStorage (`lexi_token`)
- [ ] User data saved in localStorage (`lexi_user`)

#### Test Case 1.2: Weak Password Validation
- [ ] Navigate to `/signup`
- [ ] Enter password: `weak`
- [ ] Password strength indicator shows unmet requirements
- [ ] "Create account" button is disabled
- [ ] Cannot submit form

#### Test Case 1.3: Duplicate Email
- [ ] Navigate to `/signup`
- [ ] Use email from Test Case 1.1: `test@example.com`
- [ ] Fill in other fields
- [ ] Click "Create account"
- [ ] Error toast appears: "Email already registered"
- [ ] Stays on signup page

#### Test Case 1.4: Invalid Email Format
- [ ] Navigate to `/signup`
- [ ] Enter email: `notanemail`
- [ ] Browser shows validation error
- [ ] Cannot submit form

### 2. Email Login Flow

#### Test Case 2.1: Successful Login
- [ ] Navigate to `http://localhost:5173/login`
- [ ] Enter credentials:
  - Email: `test@example.com`
  - Password: `TestPass123`
- [ ] Click "Sign in"
- [ ] Success toast notification appears
- [ ] Redirected to `/chat`
- [ ] User avatar appears in navbar
- [ ] Token saved in localStorage

#### Test Case 2.2: Wrong Password
- [ ] Navigate to `/login`
- [ ] Enter email: `test@example.com`
- [ ] Enter wrong password: `WrongPass123`
- [ ] Click "Sign in"
- [ ] Error toast appears: "Invalid email or password"
- [ ] Stays on login page

#### Test Case 2.3: Non-existent Email
- [ ] Navigate to `/login`
- [ ] Enter email: `nonexistent@example.com`
- [ ] Enter any password
- [ ] Click "Sign in"
- [ ] Error toast appears: "Invalid email or password"
- [ ] Stays on login page

#### Test Case 2.4: Remember Me
- [ ] Navigate to `/login`
- [ ] Enter valid credentials
- [ ] Check "Remember me" checkbox
- [ ] Click "Sign in"
- [ ] Login successful
- [ ] Token has extended expiry (30 days)

#### Test Case 2.5: Password Show/Hide
- [ ] Navigate to `/login`
- [ ] Enter password
- [ ] Click eye icon
- [ ] Password becomes visible
- [ ] Click eye icon again
- [ ] Password becomes hidden

### 3. Google OAuth Flow (If Configured)

#### Test Case 3.1: First-Time Google Login
- [ ] Navigate to `/login`
- [ ] Google Sign-In button is visible
- [ ] Click "Continue with Google"
- [ ] Google popup opens
- [ ] Sign in with Google account
- [ ] Popup closes
- [ ] Success toast appears
- [ ] Redirected to `/chat`
- [ ] Profile picture appears in navbar
- [ ] Google badge shows in user dropdown
- [ ] New user created in MongoDB

#### Test Case 3.2: Returning Google User
- [ ] Logout
- [ ] Navigate to `/login`
- [ ] Click "Continue with Google"
- [ ] Sign in with same Google account
- [ ] Login successful
- [ ] Redirected to `/chat`
- [ ] Profile picture appears

#### Test Case 3.3: Google Signup
- [ ] Navigate to `/signup`
- [ ] Google Sign-In button is visible
- [ ] Click button and authenticate
- [ ] Account created automatically
- [ ] Redirected to `/chat`

### 4. Protected Routes

#### Test Case 4.1: Access Without Authentication
- [ ] Clear localStorage (or use incognito)
- [ ] Navigate to `http://localhost:5173/chat`
- [ ] Automatically redirected to `/login`
- [ ] Cannot access chat page

#### Test Case 4.2: Access With Authentication
- [ ] Login successfully
- [ ] Navigate to `/chat`
- [ ] Chat page loads successfully
- [ ] No redirect occurs

#### Test Case 4.3: Token Persistence
- [ ] Login successfully
- [ ] Refresh the page (F5)
- [ ] Still logged in
- [ ] User info still displayed
- [ ] No redirect to login

#### Test Case 4.4: Direct URL Access
- [ ] Login successfully
- [ ] Manually navigate to `/login`
- [ ] Automatically redirected to `/chat`
- [ ] (Already authenticated users skip login)

### 5. User Profile & Logout

#### Test Case 5.1: User Dropdown
- [ ] Login successfully
- [ ] Click on user avatar in navbar
- [ ] Dropdown menu appears
- [ ] Shows user name
- [ ] Shows user email
- [ ] Shows auth provider badge (Email/Google)
- [ ] Shows Settings option
- [ ] Shows Profile option
- [ ] Shows Logout button

#### Test Case 5.2: Logout
- [ ] Login successfully
- [ ] Click user avatar
- [ ] Click "Log out"
- [ ] Redirected to `/login`
- [ ] Token removed from localStorage
- [ ] User data removed from localStorage
- [ ] Cannot access `/chat` anymore

#### Test Case 5.3: Avatar Display
- [ ] Login with email account
- [ ] Avatar shows initials
- [ ] Login with Google account (if configured)
- [ ] Avatar shows profile picture

### 6. Forgot Password Page

#### Test Case 6.1: Access Page
- [ ] Navigate to `/login`
- [ ] Click "Forgot password?" link
- [ ] Redirected to `/forgot-password`
- [ ] Page loads correctly

#### Test Case 6.2: Submit Email
- [ ] Enter email address
- [ ] Click "Send reset link"
- [ ] Success message appears
- [ ] Shows "Check your email" screen

#### Test Case 6.3: Back to Login
- [ ] Click "Back to login" link
- [ ] Redirected to `/login`

### 7. API Endpoint Testing

#### Test Case 7.1: Signup Endpoint
```bash
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test",
    "email": "apitest@example.com",
    "password": "ApiTest123"
  }'
```
- [ ] Returns 201 status
- [ ] Returns access_token
- [ ] Returns user object

#### Test Case 7.2: Login Endpoint
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "apitest@example.com",
    "password": "ApiTest123",
    "remember_me": false
  }'
```
- [ ] Returns 200 status
- [ ] Returns access_token
- [ ] Returns user object

#### Test Case 7.3: Get User Info (Protected)
```bash
curl -X GET http://localhost:8000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
- [ ] Returns 200 status
- [ ] Returns user object
- [ ] Without token returns 401

#### Test Case 7.4: Logout (Protected)
```bash
curl -X POST http://localhost:8000/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
- [ ] Returns 200 status
- [ ] Returns success message

### 8. Error Handling

#### Test Case 8.1: Network Error
- [ ] Stop backend server
- [ ] Try to login
- [ ] Error toast appears
- [ ] User-friendly error message

#### Test Case 8.2: Invalid Token
- [ ] Login successfully
- [ ] Manually edit token in localStorage
- [ ] Try to access protected route
- [ ] Redirected to login
- [ ] Token cleared

#### Test Case 8.3: Expired Token
- [ ] Set ACCESS_TOKEN_EXPIRE_MINUTES to 1
- [ ] Login successfully
- [ ] Wait 2 minutes
- [ ] Try to access protected route
- [ ] Redirected to login

### 9. UI/UX Testing

#### Test Case 9.1: Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] All pages responsive
- [ ] Forms usable on all sizes

#### Test Case 9.2: Loading States
- [ ] Login shows loading spinner
- [ ] Signup shows loading spinner
- [ ] Buttons disabled during loading
- [ ] Cannot submit multiple times

#### Test Case 9.3: Toast Notifications
- [ ] Success toasts appear (green)
- [ ] Error toasts appear (red)
- [ ] Toasts auto-dismiss
- [ ] Toasts are readable

#### Test Case 9.4: Form Validation
- [ ] Required fields show validation
- [ ] Email format validated
- [ ] Password strength validated
- [ ] Error messages clear

#### Test Case 9.5: Dark Mode
- [ ] Toggle dark mode
- [ ] Auth pages work in dark mode
- [ ] Forms readable
- [ ] Buttons visible

### 10. Database Verification

#### Test Case 10.1: User Creation
```bash
mongosh
use chat_companion
db.users.find().pretty()
```
- [ ] User documents exist
- [ ] Passwords are hashed
- [ ] Email is unique
- [ ] All fields present

#### Test Case 10.2: Google User
- [ ] Login with Google
- [ ] Check database
- [ ] google_id field populated
- [ ] profile_picture field populated
- [ ] auth_provider is "google"
- [ ] password field is null

#### Test Case 10.3: Email User
- [ ] Signup with email
- [ ] Check database
- [ ] password field is hashed
- [ ] auth_provider is "email"
- [ ] google_id is null

### 11. Security Testing

#### Test Case 11.1: Password Hashing
- [ ] Check database
- [ ] Passwords are hashed (not plain text)
- [ ] Hash starts with `$2b$`
- [ ] Different users have different hashes

#### Test Case 11.2: JWT Token
- [ ] Copy token from localStorage
- [ ] Decode at jwt.io
- [ ] Contains user email in `sub`
- [ ] Contains expiry in `exp`
- [ ] Contains issued at in `iat`

#### Test Case 11.3: CORS
- [ ] Backend allows frontend origin
- [ ] Credentials included in requests
- [ ] No CORS errors in console

#### Test Case 11.4: SQL Injection Prevention
- [ ] Try email: `' OR '1'='1`
- [ ] Login fails
- [ ] No database error

### 12. Integration Testing

#### Test Case 12.1: Existing Features Work
- [ ] Login successfully
- [ ] Upload documents
- [ ] Send chat messages
- [ ] View chat history
- [ ] All existing features work

#### Test Case 12.2: User Context in Chat
- [ ] Login as User A
- [ ] Create chat
- [ ] Logout
- [ ] Login as User B
- [ ] Cannot see User A's chats
- [ ] User isolation works

---

## 🐛 Known Issues Checklist

Check if any of these issues occur:

- [ ] Token not persisting after refresh
- [ ] Google button not appearing
- [ ] CORS errors in console
- [ ] MongoDB connection errors
- [ ] Password validation not working
- [ ] Redirect loops
- [ ] Toast notifications not appearing
- [ ] Avatar not displaying
- [ ] Logout not working
- [ ] Protected routes accessible without auth

---

## ✅ Sign-Off

### Tester Information
- **Tester Name**: _______________
- **Date**: _______________
- **Environment**: Development / Staging / Production

### Test Results
- **Total Tests**: _______________
- **Passed**: _______________
- **Failed**: _______________
- **Blocked**: _______________

### Overall Status
- [ ] ✅ All tests passed - Ready for production
- [ ] ⚠️ Minor issues found - Acceptable for release
- [ ] ❌ Critical issues found - Not ready for release

### Notes
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

### Sign-Off
- **Tester Signature**: _______________
- **Date**: _______________

---

## 📊 Test Coverage Summary

| Category | Tests | Status |
|----------|-------|--------|
| Email Signup | 4 | ⬜ |
| Email Login | 5 | ⬜ |
| Google OAuth | 3 | ⬜ |
| Protected Routes | 4 | ⬜ |
| User Profile | 3 | ⬜ |
| Forgot Password | 3 | ⬜ |
| API Endpoints | 4 | ⬜ |
| Error Handling | 3 | ⬜ |
| UI/UX | 5 | ⬜ |
| Database | 3 | ⬜ |
| Security | 4 | ⬜ |
| Integration | 2 | ⬜ |
| **TOTAL** | **43** | **⬜** |

---

## 🚀 Quick Test Script

For rapid testing, run these commands:

```bash
# 1. Start services
./start-mongodb.bat
cd backend && python -m app.main &
npm run dev &

# 2. Test signup
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Quick Test","email":"quick@test.com","password":"QuickTest123"}'

# 3. Test login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"quick@test.com","password":"QuickTest123","remember_me":false}'

# 4. Save token and test protected endpoint
TOKEN="<paste_token_here>"
curl -X GET http://localhost:8000/auth/me \
  -H "Authorization: Bearer $TOKEN"

# 5. Check database
mongosh --eval "use chat_companion; db.users.find().pretty()"
```

---

## 📝 Bug Report Template

If you find issues, use this template:

```markdown
### Bug Report

**Title**: [Brief description]

**Severity**: Critical / High / Medium / Low

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**:


**Actual Behavior**:


**Screenshots**:


**Environment**:
- OS: 
- Browser: 
- Frontend Version: 
- Backend Version: 

**Console Errors**:
```
[Paste console errors here]
```

**Additional Notes**:

```

---

## 🎉 Testing Complete!

Once all tests pass, your authentication system is ready for use!

Remember to:
- [ ] Document any workarounds
- [ ] Update user documentation
- [ ] Train users on new auth flow
- [ ] Monitor logs after deployment
- [ ] Set up alerts for auth failures
