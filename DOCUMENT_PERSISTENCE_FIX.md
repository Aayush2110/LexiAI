# Document Persistence Fix - Complete

## Problem Solved

**Issue:** When switching between chats, uploaded documents were not visible. Each chat should remember and display its own documents.

**Expected Behavior:**
- Chat 1 → Upload Doc1 → Doc1 always visible in Chat 1
- Chat 2 → Upload Doc2 → Doc2 always visible in Chat 2
- Switch between chats → Each shows its own documents

## Solution Implemented

### Documents are now persisted and loaded per chat

Each chat now:
1. **Saves** which documents were uploaded to it
2. **Loads** those documents when you return to the chat
3. **Displays** them in the right panel

## Changes Made

### 1. Backend - New Documents Endpoint
**File:** `backend/app/api/routes/documents.py` (NEW)

```python
GET /documents/{session_id}
Returns: List of documents for that session
```

### 2. Backend - Register Route
**File:** `backend/app/main.py`

Added documents router to the app.

### 3. Frontend - Chat Interface
**File:** `src/contexts/ChatContext.tsx`

- Added `documents` field to Chat interface
- Load documents when selecting a chat
- Store documents with chat data

### 4. Frontend - API Service
**File:** `src/services/api.ts`

- Added `getDocuments(sessionId)` method
- Fetches documents for a session

### 5. Frontend - Chat Page
**File:** `src/routes/chat.tsx`

- Load documents when chat changes
- Display documents in right panel
- Refresh chat after upload to show new documents

## How It Works Now

### Upload Flow:
```
1. User uploads document to Chat 1
   ↓
2. Document saved to MongoDB with session_id
   ↓
3. Chat refreshes and loads documents
   ↓
4. Document appears in right panel
```

### Switch Chat Flow:
```
1. User clicks Chat 2 in sidebar
   ↓
2. ChatContext loads Chat 2 data
   ↓
3. ChatContext fetches documents for Chat 2
   ↓
4. Chat page displays Chat 2's documents
   ↓
5. Right panel shows Chat 2's documents
```

### Return to Chat Flow:
```
1. User clicks back to Chat 1
   ↓
2. ChatContext loads Chat 1 data
   ↓
3. ChatContext fetches documents for Chat 1
   ↓
4. Chat page displays Chat 1's documents
   ↓
5. Right panel shows Chat 1's documents (Doc1)
```

## Testing Steps

### 1. Restart Backend
```bash
cd backend
python -m uvicorn app.main:app --reload
```

### 2. Restart Frontend
```bash
npm run dev
```

### 3. Test Document Persistence

#### Test Case 1: Upload and See Document
1. Open http://localhost:5173/chat
2. Click "New Chat"
3. Upload a document (e.g., "contract.pdf")
4. ✅ Document should appear in right panel as "Indexed"
5. Ask a question about the document
6. ✅ Should get an answer

#### Test Case 2: Create Second Chat
1. Click "New Chat" again
2. ✅ Right panel should be empty (no documents)
3. Upload a different document (e.g., "agreement.pdf")
4. ✅ New document should appear in right panel
5. Ask a question about this document
6. ✅ Should get an answer

#### Test Case 3: Switch Back to First Chat
1. Click on the first chat in sidebar
2. ✅ Should see "contract.pdf" in right panel
3. ✅ Should see previous messages
4. Ask another question
5. ✅ Should answer based on "contract.pdf"

#### Test Case 4: Switch to Second Chat
1. Click on the second chat in sidebar
2. ✅ Should see "agreement.pdf" in right panel
3. ✅ Should see previous messages
4. Ask another question
5. ✅ Should answer based on "agreement.pdf"

## Expected Behavior

### ✅ Each Chat Has Its Own Documents
```
Chat 1: "Contract review"
  └─ Documents: [contract.pdf]
  
Chat 2: "Agreement analysis"
  └─ Documents: [agreement.pdf]
  
Chat 3: "Policy check"
  └─ Documents: [policy.pdf, terms.pdf]
```

### ✅ Documents Persist
- Upload document → Always visible in that chat
- Switch away → Document remembered
- Switch back → Document still there
- Refresh page → Document still there

### ✅ Documents Are Isolated
- Chat 1's documents don't appear in Chat 2
- Chat 2's documents don't appear in Chat 1
- Each chat is independent

## Database Structure

### Documents Collection
```javascript
{
  _id: ObjectId("..."),
  session_id: "abc-123",
  filename: "contract.pdf",
  file_path: "/path/to/file",
  file_size: 1024000,
  file_type: "application/pdf",
  uploaded_at: ISODate("2024-...")
}
```

### Chats Collection
```javascript
{
  _id: ObjectId("..."),
  session_id: "abc-123",
  title: "Contract review",
  messages: [...],
  created_at: ISODate("..."),
  updated_at: ISODate("...")
}
```

## API Endpoints

### Get Documents for Session
```
GET /documents/{session_id}

Response:
{
  "documents": [
    {
      "filename": "contract.pdf",
      "file_size": 1024000,
      "file_type": "application/pdf",
      "uploaded_at": "2024-05-12T10:30:00"
    }
  ],
  "total": 1
}
```

## Troubleshooting

### Issue: Documents not showing after upload

**Check:**
1. Backend logs for upload success
2. MongoDB documents collection
3. Browser console for API errors

**Solution:**
- Wait 1-2 seconds after upload
- Refresh the chat by clicking on it again
- Check backend is running

### Issue: Wrong documents showing in chat

**Check:**
1. Session IDs match
2. Documents collection has correct session_id
3. Browser console logs

**Solution:**
- Create a new chat
- Upload fresh documents
- Verify session_id in logs

### Issue: Documents disappear after refresh

**Check:**
1. MongoDB connection
2. Documents API endpoint
3. ChatContext loading documents

**Solution:**
- Check backend logs
- Verify GET /documents/:id works
- Test with curl

## Console Logs to Watch

### When Switching Chats:
```
[ChatContext] Selecting chat: abc-123
[ChatContext] Received chat data: {...}
[ChatContext] Loaded documents: [{...}]
[ChatContext] Successfully loaded chat: abc-123 with 5 messages and 1 documents
[ChatPage] Current chat changed: abc-123 with 5 messages
[ChatPage] Loaded 1 documents for chat
```

### When Uploading:
```
[UploadPanel] Uploading with session ID: abc-123
[DocsAPI] Adding session_id to upload: abc-123
[DocsAPI] Upload successful
[ChatPage] Session ID received from upload: abc-123
[ChatPage] Refreshing chat to load uploaded documents
[ChatContext] Selecting chat: abc-123
[ChatContext] Loaded documents: [{...}]
```

## Summary

### Before Fix:
❌ Documents cleared when switching chats
❌ No way to see which documents belong to which chat
❌ Had to re-upload documents

### After Fix:
✅ Documents persist per chat
✅ Each chat shows its own documents
✅ Switch between chats freely
✅ Documents always visible
✅ No need to re-upload

## Key Features

1. **Document Persistence** - Documents saved to MongoDB
2. **Per-Chat Documents** - Each chat has its own document list
3. **Automatic Loading** - Documents load when you open a chat
4. **Visual Feedback** - Documents shown in right panel
5. **Isolation** - Chat 1's docs don't appear in Chat 2

## Next Steps

1. **Test thoroughly** - Upload docs to multiple chats
2. **Switch between chats** - Verify docs persist
3. **Refresh page** - Verify docs still there
4. **Ask questions** - Verify RAG works with correct docs

The document persistence is now **fully implemented**! 🎉

Each chat will remember and display its own documents, exactly as you requested.
