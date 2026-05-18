# OTP Email Verification Setup

## Overview
Email verification with OTP has been successfully implemented for the signup process.

## Changes Made

### Backend Changes

#### 1. Auth Schema (`backend/app/schemas/auth_schema.py`)
- Added `VerifyOTPRequest` schema for OTP verification
- Added `ResendOTPRequest` schema for resending OTP

#### 2. Email Handler (`backend/app/utils/email_handler.py`)
- Added `send_otp_email()` function
- Professional email template with:
  - LexiAI logo (scales icon)
  - Large, centered 6-digit OTP display
  - 10-minute expiry warning
  - Clean, modern design

#### 3. Auth Routes (`backend/app/api/routes/auth.py`)
- **Modified `/auth/signup`**: Now sends OTP instead of creating user immediately
- **Added `/auth/verify-otp`**: Verifies OTP and creates user account
- **Added `/auth/resend-otp`**: Resends new OTP code
- OTP storage with 10-minute expiry
- 6-digit numeric OTP generation

### Frontend Changes

#### 1. Auth Context (`src/contexts/AuthContext.tsx`)
- Added `setAuth()` method to manually set authentication state
- Updated `AuthContextType` interface

#### 2. Signup Page (`src/routes/signup.tsx`)
- Implemented two-step signup process:
  1. **Step 1**: User enters name, email, password
  2. **Step 2**: User enters 6-digit OTP code
- Features:
  - Large, centered OTP input field
  - Monospace font for better readability
  - Auto-filters non-numeric input
  - Validates 6-digit length
  - Resend OTP button
  - Back to signup button
  - Blue gradient verify button
  - Error handling and validation

## How It Works

### Signup Flow:
1. User fills out signup form (name, email, password)
2. User clicks "Create account"
3. Backend generates 6-digit OTP
4. OTP is sent to user's email
5. Frontend shows OTP verification screen
6. User enters OTP from email
7. Backend verifies OTP
8. User account is created
9. User is logged in automatically

### OTP Details:
- **Length**: 6 digits
- **Expiry**: 10 minutes
- **Storage**: In-memory (for production, use Redis)
- **Resend**: User can request new OTP

## API Endpoints

### POST `/auth/signup`
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
  "message": "Verification code sent to your email. Please check your inbox."
}
```

### POST `/auth/verify-otp`
**Request:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    ...
  }
}
```

### POST `/auth/resend-otp`
**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "message": "New verification code sent to your email."
}
```

## Testing

### To Test:
1. **Restart the backend server** to load new code:
   ```bash
   cd backend
   python -m uvicorn app.main:app --reload
   ```

2. Go to signup page: `http://localhost:8080/signup`

3. Fill out the form and click "Create account"

4. Check your email for the OTP code

5. Enter the 6-digit code on the verification screen

6. Click "Verify & Create Account"

### Email Configuration
Make sure these are set in `backend/.env`:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=lexiaisupport@gmail.com
EMAIL_PASSWORD=xvegqfevxeohslkr
EMAIL_FROM=lexiaisupport@gmail.com
EMAIL_FROM_NAME=LexiAI
```

## Production Considerations

### Current Implementation (Development):
- OTP stored in-memory dictionary
- Lost on server restart
- Not suitable for multiple server instances

### Production Recommendations:
1. **Use Redis** for OTP storage:
   - Persistent across restarts
   - Supports multiple servers
   - Built-in TTL (time-to-live)

2. **Rate Limiting**:
   - Limit OTP requests per email (e.g., 3 per hour)
   - Prevent abuse

3. **Security Enhancements**:
   - Add CAPTCHA to signup form
   - Log failed OTP attempts
   - Lock account after multiple failures

4. **Email Delivery**:
   - Use dedicated email service (SendGrid, AWS SES)
   - Better deliverability
   - Email analytics

## Troubleshooting

### "HTTPError" or 500 Error:
- **Solution**: Restart the backend server to load new endpoints

### OTP Not Received:
- Check spam/junk folder
- Verify email configuration in `.env`
- Check backend logs for email sending errors

### OTP Expired:
- OTPs expire after 10 minutes
- Click "Resend" to get a new code

### Invalid OTP:
- Make sure to enter all 6 digits
- Check for typos
- Request a new code if needed

## Files Modified

### Backend:
- `backend/app/schemas/auth_schema.py`
- `backend/app/api/routes/auth.py`
- `backend/app/utils/email_handler.py`

### Frontend:
- `src/contexts/AuthContext.tsx`
- `src/routes/signup.tsx`

## Next Steps

1. ✅ Restart backend server
2. ✅ Test signup flow
3. ⏳ Consider Redis implementation for production
4. ⏳ Add rate limiting
5. ⏳ Add CAPTCHA for security
