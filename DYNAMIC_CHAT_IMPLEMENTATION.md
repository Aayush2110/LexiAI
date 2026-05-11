# Dynamic Chat System Implementation

## Overview
Implemented a fully dynamic chat system with MongoDB storage, replacing hardcoded dummy data with real-time chat management.

## Features Implemented

### 1. Backend (MongoDB Storage)

#### Database Model Updates
- **File**: `backend/app/models/db_models.py`
- Added `title` field to `ChatSessionModel` (default: "New Chat")

#### New API Endpoints
- **File**: `backend/app/api/routes/chat.py`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chats` | POST | Create new chat session |
| `/chats` | GET | List all user chats (sorted by updated_at) |
| `/chats/{session_id}/title` | PATCH | Update chat title |
| `/chats/{session_id}` | DELETE | Delete chat session |

#### Auto-Title Generation
- **Function**: `generate_title_from_message()`
- Automatically generates title from first user message
- Removes common question words (what, how, why, etc.)
- Truncates to 30 characters max
- Example: "Explain NDA confidentiality clause" → "NDA confidentiality clause"

### 2. Frontend (React + TypeScript)

#### API Service
- **File**: `src/services/api.ts`
- Added methods:
  - `createChat()` - Create new chat
  - `listChats()` - Fetch all chats
  - `updateTitle()` - Update chat title
  - `deleteChat()` - Delete chat

#### MainLayout Component
- **File**: `src/layouts/MainLayout.tsx`
- Loads chats from MongoDB on mount
- Handles "New Chat" button click
- Manages chat selection
- Auto-refreshes chat list

#### Chat Page
- **File**: `src/routes/chat.tsx`
- Creates initial chat on page load
- Auto-generates title after first message
- Refreshes title from backend after generation
- Manages active chat state

#### Sidebar Component
- **File**: `src/components/lexi/Sidebar.tsx`
- Displays dynamic chat list from MongoDB
- Highlights active chat
- Shows message count per chat
- Empty state when no chats exist

## How It Works

### New Chat Flow
1. User clicks "New Chat" button
2. Frontend calls `POST /chats`
3. Backend creates chat in MongoDB with:
   - Unique `session_id` (UUID)
   - Default title: "New Chat"
   - Empty messages array
   - Timestamps
4. Frontend adds chat to sidebar
5. Chat is automatically selected

### Auto-Title Generation Flow
1. User sends first message
2. Backend receives message via `POST /chat`
3. Backend checks if chat has 0 messages
4. If first message:
   - Generates title using `generate_title_from_message()`
   - Updates chat document with new title
5. Frontend refreshes chat list after 500ms
6. Sidebar shows updated title

### Chat Persistence
- All chats stored in MongoDB `chats` collection
- Survives page refresh
- Accessible from any device (multi-device ready)
- Sorted by `updated_at` (most recent first)

## Data Structure

### MongoDB Chat Document
```json
{
  "_id": ObjectId,
  "session_id": "uuid-string",
  "user_id": "default_user",
  "title": "NDA confidentiality clause",
  "messages": [
    {
      "role": "user",
      "content": "Explain NDA confidentiality clause",
      "timestamp": ISODate
    },
    {
      "role": "assistant",
      "content": "The NDA confidentiality clause...",
      "timestamp": ISODate
    }
  ],
  "created_at": ISODate,
  "updated_at": ISODate
}
```

### Frontend Chat Item
```typescript
interface ChatItem {
  id: string;              // session_id
  title: string;           // Chat title
  updatedAt: string;       // ISO timestamp
  messageCount?: number;   // Number of messages
}
```

## Future Enhancements

### Recommended Next Steps
1. **Load Messages**: Fetch and display messages when selecting existing chat
2. **AI-Powered Titles**: Use Gemini API for smarter title generation
3. **Chat Search**: Search through chat history
4. **Chat Folders**: Organize chats by category
5. **Export Chat**: Download chat as PDF/TXT
6. **Share Chat**: Generate shareable links
7. **Chat Analytics**: Track usage patterns
8. **Infinite Scroll**: Lazy load older chats

## Testing

### Manual Testing Steps
1. Open app → Should create initial chat
2. Click "New Chat" → New chat appears in sidebar
3. Send message → Title auto-updates after first message
4. Refresh page → Chats persist
5. Select different chat → Switches active chat

### API Testing (Postman/curl)
```bash
# Create chat
curl -X POST http://localhost:8000/api/chats \
  -H "Content-Type: application/json" \
  -d '{"user_id": "default_user"}'

# List chats
curl http://localhost:8000/api/chats?user_id=default_user

# Update title
curl -X PATCH http://localhost:8000/api/chats/{session_id}/title \
  -H "Content-Type: application/json" \
  -d '{"title": "New Title"}'

# Delete chat
curl -X DELETE http://localhost:8000/api/chats/{session_id}
```

## Files Modified

### Backend
- `backend/app/models/db_models.py` - Added title field
- `backend/app/models/request_models.py` - Added CreateChatRequest, UpdateChatTitleRequest
- `backend/app/models/response_models.py` - Added ChatListResponse, CreateChatResponse
- `backend/app/api/routes/chat.py` - Added 4 new endpoints + title generation

### Frontend
- `src/services/api.ts` - Added chat management methods
- `src/layouts/MainLayout.tsx` - Dynamic chat loading
- `src/routes/chat.tsx` - Chat creation and title management
- `src/components/lexi/Sidebar.tsx` - Updated interface
- `src/components/lexi/RightContextPanel.tsx` - Removed stats (previous change)

## Architecture Benefits

✅ **Scalable**: MongoDB handles millions of chats
✅ **Multi-device**: Access chats from anywhere
✅ **Persistent**: Data survives crashes/refreshes
✅ **Fast**: Indexed queries, efficient updates
✅ **Secure**: User-based access control ready
✅ **Extensible**: Easy to add features (search, folders, etc.)

## Notes
- Currently uses `default_user` for all chats
- Ready for multi-user authentication integration
- Title generation is simple text extraction (can be upgraded to AI)
- Messages are stored but not yet loaded on chat selection (TODO)
