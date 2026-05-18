# Quick Start: Multi-User Chat System

## 🚀 Quick Setup (3 Steps)

### Step 1: Run Migration (If You Have Existing Data)
```bash
cd backend
python migrate_existing_chats.py
```
**What it does**: Adds `user_id` to existing chats, documents, and sessions

### Step 2: Restart Backend
```bash
cd backend
python -m uvicorn app.main:app --reload
```
**What changed**: All endpoints now require authentication and validate ownership

### Step 3: Test It!
1. Create two user accounts (User A and User B)
2. Login as User A → Create chats
3. Logout → Login as User B
4. ✅ User B should see empty chat list (not User A's chats)

## 🔒 What's Protected Now

### Every API Endpoint Requires:
1. ✅ Valid JWT token in Authorization header
2. ✅ User ownership validation
3. ✅ Returns 403 if user doesn't own resource

### Protected Operations:
- Create chat
- List chats
- View chat messages
- Update chat title
- Delete chat
- Upload documents
- View documents
- Send messages

## 🧪 Quick Test

### Test User Isolation:
```bash
# Terminal 1: User A
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"User A","email":"usera@test.com","password":"Test1234"}'

# Get token, create chat, note session_id

# Terminal 2: User B
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"User B","email":"userb@test.com","password":"Test1234"}'

# Try to access User A's chat with User B's token
curl -X GET http://localhost:8000/chats/USER_A_SESSION_ID \
  -H "Authorization: Bearer USER_B_TOKEN"

# Expected: 403 Forbidden ✅
```

## 📊 Database Indexes (Optional but Recommended)

```javascript
// Run in MongoDB shell for better performance:
use lexi_ai

db.chats.createIndex({ "user_id": 1, "updated_at": -1 })
db.documents.createIndex({ "session_id": 1, "user_id": 1 })
db.sessions.createIndex({ "user_id": 1 })
```

## 🐛 Troubleshooting

### Issue: "Not authenticated" error
**Solution**: Make sure JWT token is in Authorization header
```typescript
headers: { Authorization: `Bearer ${token}` }
```

### Issue: "Access denied" (403)
**Solution**: User trying to access another user's resource
- This is expected behavior
- Verify user owns the resource

### Issue: Old chats visible after logout
**Solution**: Clear browser cache or use incognito mode
- Logout now clears localStorage/sessionStorage
- Restart frontend if needed

### Issue: Migration script fails
**Solution**: Check MongoDB connection
```bash
# Verify MongoDB is running
mongosh mongodb://localhost:27017

# Check .env file has correct MONGODB_URL
```

## 📝 API Changes

### Before (Insecure)
```typescript
// User ID sent from frontend (can be forged!)
POST /chats
Body: { "user_id": "any_user_id" }

GET /chats?user_id=any_user_id
```

### After (Secure)
```typescript
// User ID extracted from JWT token
POST /chats
Headers: { Authorization: "Bearer <jwt_token>" }
Body: {}  // No user_id needed!

GET /chats
Headers: { Authorization: "Bearer <jwt_token>" }
// No user_id parameter!
```

## ✅ Verification Checklist

After setup, verify:

- [ ] Backend starts without errors
- [ ] Can create new user account
- [ ] Can login and get JWT token
- [ ] Can create chat (returns session_id)
- [ ] Can list chats (only sees own chats)
- [ ] Can upload documents
- [ ] Can send messages
- [ ] Logout clears data
- [ ] New user sees empty state
- [ ] Cannot access other user's chats (403)

## 🎯 Key Points

1. **JWT Required**: All protected endpoints need valid JWT token
2. **User ID from Token**: Backend extracts user_id from JWT (never trusts frontend)
3. **Ownership Validated**: Every operation checks if user owns the resource
4. **403 vs 404**: 
   - 403 = Resource exists but you don't own it
   - 404 = Resource doesn't exist
5. **Clean Logout**: All cached data cleared on logout

## 📚 Documentation

- **Full Guide**: `MULTI_USER_CHAT_ISOLATION.md`
- **Summary**: `IMPLEMENTATION_SUMMARY.md`
- **This File**: `QUICK_START_MULTI_USER.md`

## 🆘 Need Help?

1. Check backend logs: `tail -f backend/logs/app.log`
2. Check browser console for frontend errors
3. Verify JWT token is being sent
4. Test with curl/Postman first
5. Check MongoDB for user_id fields

## 🎉 Success Indicators

You'll know it's working when:
- ✅ User A creates chat
- ✅ User B logs in and sees empty chat list
- ✅ User B creates own chat
- ✅ User A still only sees their own chats
- ✅ Trying to access other user's chat returns 403
- ✅ Logout clears all data
- ✅ No cross-user data visibility

---

**Status**: Ready to use! 🚀

Your chat system now has complete user isolation. Each user has their own private chat history, documents, and sessions.
