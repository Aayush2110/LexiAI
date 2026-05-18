# Password Reset Setup Guide

## 📧 Gmail SMTP Configuration

### Step 1: Enable 2-Step Verification

1. Go to your Google Account: https://myaccount.google.com/
2. Click "Security" in the left sidebar
3. Under "How you sign in to Google", click "2-Step Verification"
4. Follow the steps to enable it

### Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
2. If you don't see this option, make sure 2-Step Verification is enabled
3. Select app: "Mail"
4. Select device: "Other (Custom name)"
5. Enter name: "LexiAI Backend"
6. Click "Generate"
7. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

### Step 3: Update Backend .env

Edit `backend/.env` and add your credentials:

```env
# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=LexiAI

# Password Reset
RESET_TOKEN_EXPIRE_MINUTES=30
FRONTEND_URL=http://localhost:8080
```

**Replace:**
- `your-email@gmail.com` with your Gmail address
- `abcdefghijklmnop` with the app password you generated (remove spaces)

### Step 4: Install New Dependencies

```bash
cd backend
pip install aiosmtplib==3.0.2 email-validator==2.2.0
```

Or reinstall all:
```bash
pip install -r requirements.txt
```

### Step 5: Restart Backend

```bash
# Stop backend (Ctrl+C)
# Then restart
python -m app.main
```

### Step 6: Restart Frontend

```bash
# Stop frontend (Ctrl+C)
# Then restart
npm run dev
```

---

## 🧪 Testing Password Reset

### Test 1: Request Password Reset

1. Go to `http://localhost:8080/login`
2. Click "Forgot password?"
3. Enter your email address
4. Click "Send reset link"
5. Check your email inbox (and spam folder)

### Test 2: Reset Password

1. Open the email you received
2. Click "Reset Password" button
3. Enter new password (must meet requirements)
4. Confirm password
5. Click "Reset password"
6. You should see success message
7. Try logging in with new password

### Test 3: Expired Token

1. Wait 30 minutes after requesting reset
2. Try to use the reset link
3. Should show "Invalid or expired token" error

---

## 🔐 API Endpoints

### POST /auth/forgot-password
Request password reset email

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If an account exists with this email, you will receive password reset instructions."
}
```

### POST /auth/reset-password
Reset password with token

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "new_password": "NewSecurePass123"
}
```

**Response:**
```json
{
  "message": "Password reset successful. You can now login with your new password."
}
```

---

## 🐛 Troubleshooting

### Email Not Sending

**Check 1: App Password**
- Make sure you're using the app password, not your regular Gmail password
- Remove any spaces from the app password

**Check 2: 2-Step Verification**
- Must be enabled to generate app passwords
- Go to: https://myaccount.google.com/security

**Check 3: Backend Logs**
- Check backend console for error messages
- Look for "Failed to send email" errors

**Check 4: Gmail Settings**
- Make sure "Less secure app access" is NOT needed (app passwords work without it)
- Check if Gmail is blocking the login attempt

### Token Expired Error

- Reset tokens expire after 30 minutes
- Request a new password reset link

### Invalid Token Error

- Token might be malformed
- Make sure the full URL is copied correctly
- Try requesting a new reset link

---

## 📧 Email Template

The password reset email includes:
- ✅ Professional design
- ✅ Clear "Reset Password" button
- ✅ Security warning (30-minute expiry)
- ✅ Fallback link (if button doesn't work)
- ✅ LexiAI branding

---

## 🔒 Security Features

1. **Token Expiry**: Reset tokens expire after 30 minutes
2. **One-Time Use**: Tokens are validated but not invalidated (consider adding token blacklist for production)
3. **Email Verification**: Only sends email if account exists (but doesn't reveal this for security)
4. **Google OAuth Protection**: Cannot reset password for Google OAuth accounts
5. **Password Strength**: Enforces same password requirements as signup

---

## 📊 Configuration Options

### Change Token Expiry Time

Edit `backend/.env`:
```env
RESET_TOKEN_EXPIRE_MINUTES=60  # 1 hour instead of 30 minutes
```

### Change Frontend URL

If your frontend is on a different port:
```env
FRONTEND_URL=http://localhost:5173
```

### Customize Email Sender Name

```env
EMAIL_FROM_NAME=Your Company Name
```

---

## ✅ Checklist

Before going live:

- [ ] 2-Step Verification enabled on Gmail
- [ ] App password generated
- [ ] Backend .env updated with credentials
- [ ] Dependencies installed
- [ ] Backend restarted
- [ ] Frontend restarted
- [ ] Test email sending works
- [ ] Test password reset flow
- [ ] Test expired token handling
- [ ] Test invalid token handling

---

## 🎉 Success!

Once configured, users can:
1. Click "Forgot password?" on login page
2. Enter their email
3. Receive professional reset email
4. Click link to reset password
5. Login with new password

**The password reset system is now fully functional!** 🔐📧
