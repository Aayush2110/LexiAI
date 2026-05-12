# Quick Start Guide - Dynamic Chat System

## Prerequisites
- MongoDB running (local or cloud)
- Python 3.8+ with dependencies installed
- Node.js 16+ with dependencies installed

## Step 1: Start MongoDB
```bash
# If using local MongoDB
mongod

# Or if using the provided script
./start-mongodb.bat
```

## Step 2: Start Backend
```bash
cd backend

# Make sure .env is configured with MongoDB connection
# MONGODB_URI=mongodb://localhost:27017/lexiai

# Start the FastAPI server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected output:**
```
INFO:     Starting LegalRAG AI Chatbot v1.0.0
INFO:     MongoDB connected successfully
INFO:     Application started successfully
INFO:     API Documentation: http://0.0.0.0:8000/docs
```

## Step 3: Start Frontend
```bash
# In project root
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Step 4: Test the Chat System

### 1. Open the App
Navigate to `http://localhost:5173/chat`

### 2. Create First Chat
- Click the **"+ New Chat"** button in the sidebar
- A new empty chat should appear
- The sidebar should show "New Chat" in the "Today" section

### 3. Upload a Document
- In the right panel, click **"Upload Documents"**
- Select a PDF or DOCX file
- Wait for processing to complete
- You should see a session ID generated

### 4. Send First Message
- Type a question in the chat input
- Press Enter or click Send
- **Watch the magic:**
  - Message appears in chat
  - Backend processes with RAG
  - Response appears with citations
  - **Chat title auto-generates** from your question
  - Sidebar updates with new title

### 5. Test Chat Switching
- Click **"+ New Chat"** again
- Send a different question
- Click on the first chat in the sidebar
- **Verify:** All previous messages load correctly

### 6. Test Search
- Type in the search box at the top of sidebar
- Chats should filter in real-time
- Clear search to see all chats again

### 7. Test Rename
- Hover over a chat in the sidebar
- Click the **edit icon** (pencil)
- Type a new name
- Press **Enter** to save or **Escape** to cancel
- **Verify:** Title updates in sidebar and persists

### 8. Test Delete
- Hover over a chat in the sidebar
- Click the **delete icon** (trash)
- Confirm the deletion
- **Verify:** Chat disappears from sidebar
- **If active chat deleted:** New chat is created automatically

### 9. Test Grouping
- Create chats over multiple days (or modify MongoDB dates)
- **Verify groups appear:**
  - Today
  - Yesterday
  - Previous 7 Days
  - Older

### 10. Test Mobile View
- Resize browser to mobile width (< 1024px)
- Click hamburger menu to open sidebar
- Select a chat
- **Verify:** Sidebar closes automatically
- Chat messages are visible

## Verification Checklist

### Backend Health
```bash
# Test backend is running
curl http://localhost:8000/health

# Expected response:
{
  "status": "healthy",
  "mongodb": "connected",
  "timestamp": "2024-..."
}
```

### MongoDB Data
```bash
# Connect to MongoDB
mongosh

# Switch to database
use lexiai

# Check chats collection
db.chats.find().pretty()

# You should see documents like:
{
  "_id": ObjectId("..."),
  "session_id": "uuid-here",
  "user_id": "default_user",
  "title": "Your question here",
  "messages": [
    {
      "role": "user",
      "content": "Your question",
      "timestamp": ISODate("...")
    },
    {
      "role": "assistant",
      "content": "AI response",
      "timestamp": ISODate("...")
    }
  ],
  "created_at": ISODate("..."),
  "updated_at": ISODate("...")
}
```

### Frontend Console
Open browser DevTools (F12) and check console:

**Expected logs:**
```
[ChatContext] Loaded chats: 3
[ChatContext] Created new chat: abc-123-def
[ChatContext] Loaded chat: abc-123-def with 4 messages
[ChatPage] Sending message. Session ID: abc-123-def
```

**No errors should appear!**

## Common Issues & Solutions

### Issue: "No chats appear in sidebar"
**Solution:**
1. Check MongoDB is running: `mongosh`
2. Check backend logs for MongoDB connection
3. Check browser console for API errors
4. Verify CORS settings in backend

### Issue: "Chat title doesn't auto-generate"
**Solution:**
1. Check backend logs for title generation
2. Verify first message is being sent
3. Check MongoDB for title field
4. Refresh chat list manually

### Issue: "Messages don't persist"
**Solution:**
1. Check MongoDB connection
2. Verify session_id is being passed
3. Check backend logs for save errors
4. Verify chat exists in MongoDB

### Issue: "Sidebar doesn't close on mobile"
**Solution:**
1. Check browser width < 1024px
2. Verify onClose() is being called
3. Check console for errors
4. Try hard refresh (Ctrl+Shift+R)

### Issue: "Search doesn't work"
**Solution:**
1. Check search input is visible
2. Verify chats are loaded
3. Check console for filter errors
4. Try typing slowly

### Issue: "Delete confirmation doesn't appear"
**Solution:**
1. Check browser allows confirm() dialogs
2. Try different browser
3. Check console for errors
4. Verify onDeleteChat prop is passed

## API Endpoints Reference

### Chat Management
```
POST   /chats              - Create new chat
GET    /chats              - List all chats (with ?user_id=default_user)
GET    /chats/:id          - Get specific chat with messages
PATCH  /chats/:id/title    - Update chat title
DELETE /chats/:id          - Delete chat
```

### Messaging
```
POST   /chat               - Send message and get response
                            Body: { question: string, session_id: string }
```

### Document Upload
```
POST   /upload             - Upload documents
                            Returns: { session_id: string, ... }
```

## Testing with cURL

### Create Chat
```bash
curl -X POST http://localhost:8000/chats \
  -H "Content-Type: application/json" \
  -d '{"user_id": "default_user"}'
```

### List Chats
```bash
curl http://localhost:8000/chats?user_id=default_user
```

### Get Specific Chat
```bash
curl http://localhost:8000/chats/YOUR_SESSION_ID
```

### Update Title
```bash
curl -X PATCH http://localhost:8000/chats/YOUR_SESSION_ID/title \
  -H "Content-Type: application/json" \
  -d '{"title": "My Custom Title"}'
```

### Delete Chat
```bash
curl -X DELETE http://localhost:8000/chats/YOUR_SESSION_ID
```

## Environment Variables

### Backend (.env)
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/lexiai

# LLM Provider (gemini or openai)
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_key_here

# Or for OpenAI
# LLM_PROVIDER=openai
# OPENAI_API_KEY=your_key_here

# Embedding Model
EMBEDDING_MODEL=all-MiniLM-L6-v2

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=true

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## Success Indicators

✅ **Backend Started:**
- MongoDB connected
- API docs available at /docs
- Health endpoint returns 200

✅ **Frontend Started:**
- Vite dev server running
- No compilation errors
- Page loads without errors

✅ **Chat System Working:**
- New chats create successfully
- Messages send and receive
- Titles auto-generate
- Chat switching works
- Search filters correctly
- Rename saves to backend
- Delete removes from DB
- Grouping shows correct sections
- Mobile sidebar closes properly

## Next Steps

1. **Customize Styling:** Modify Tailwind classes in Sidebar.tsx
2. **Add Features:** Implement bulk delete, export, etc.
3. **Improve Search:** Add debouncing, fuzzy search
4. **Add Analytics:** Track chat usage, popular queries
5. **Implement Auth:** Add real user authentication
6. **Deploy:** Set up production MongoDB and hosting

## Support

If you encounter issues:
1. Check this guide first
2. Review CHAT_SYSTEM_IMPLEMENTATION.md
3. Check browser console for errors
4. Check backend logs for errors
5. Verify MongoDB is running and accessible
6. Test API endpoints with cURL
7. Try clearing browser cache and localStorage

## Demo Flow

**Perfect demo sequence:**
1. Open app → Shows empty or existing chats
2. Click "New Chat" → Creates fresh chat
3. Upload document → Gets session ID
4. Ask "What is this document about?" → Title becomes "Document about"
5. Continue conversation → Messages persist
6. Click "New Chat" → Creates another
7. Ask different question → New title generates
8. Click first chat → Loads all previous messages
9. Search for keyword → Filters chats
10. Rename a chat → Updates everywhere
11. Delete a chat → Removes from sidebar
12. Resize to mobile → Sidebar works perfectly

**Result:** ChatGPT-like experience! 🎉
