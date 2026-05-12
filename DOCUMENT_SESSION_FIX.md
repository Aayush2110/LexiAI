# Document Session Issue - Explanation & Solution

## The Issue

When you click on different chats in the sidebar, you see:
```
"No documents found for this session. Please upload documents first."
```

Even though you have already uploaded a document (visible in the right panel).

## Why This Happens

### Current System Design
```
Chat 1 (session_id: abc-123)
  ├─ Messages: [...]
  └─ Documents: NONE

Chat 2 (session_id: def-456)  
  ├─ Messages: [...]
  └─ Documents: NONE

Chat 3 (session_id: ghi-789) ← Currently active
  ├─ Messages: [...]
  └─ Documents: [home_rental_agreement.pdf] ✓
```

**Each chat has its own `session_id`**, and documents are uploaded to a specific session.

When you:
1. Create a new chat → Gets `session_id: abc-123`
2. Upload document → Creates NEW `session_id: def-456` for the upload
3. Click on old chat → Loads `session_id: abc-123` (no documents)

## The Root Cause

The upload process creates a **new session_id** instead of using the current chat's session_id.

### Current Flow (Broken)
```
User creates chat
  ↓
Chat gets session_id: "abc-123"
  ↓
User uploads document
  ↓
Upload creates NEW session_id: "def-456"  ❌ PROBLEM
  ↓
Document is linked to "def-456"
  ↓
Chat still uses "abc-123" (no documents)
```

### Expected Flow (Fixed)
```
User creates chat
  ↓
Chat gets session_id: "abc-123"
  ↓
User uploads document
  ↓
Upload uses SAME session_id: "abc-123"  ✓ CORRECT
  ↓
Document is linked to "abc-123"
  ↓
Chat can access the document
```

## Solutions

### Option 1: Use Current Chat's Session ID (Recommended)

Modify the upload to use the current chat's session_id instead of creating a new one.

**Backend Change Required:**
```python
# backend/app/api/routes/upload.py

@router.post("/upload")
async def upload_documents(
    files: List[UploadFile] = File(...),
    session_id: str = None  # Accept session_id from frontend
):
    # Use provided session_id or generate new one
    if not session_id:
        session_id = generate_session_id()
    
    # Rest of the code...
```

**Frontend Change:**
```typescript
// src/services/api.ts

export const DocsAPI = {
  upload: async (files: File[], sessionId?: string, onProgress?: (p: number) => void) => {
    const formData = new FormData();
    files.forEach(f => formData.append("files", f));
    
    // Add session_id if provided
    if (sessionId) {
      formData.append("session_id", sessionId);
    }
    
    const res = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (e.total) {
          const progress = Math.round((e.loaded * 100) / e.total);
          onProgress?.(progress);
        }
      },
    });
    return res.data;
  },
};
```

### Option 2: Share Documents Across All Chats

Create a global document store that all chats can access.

**Pros:**
- Upload once, use in all chats
- Better user experience

**Cons:**
- More complex to implement
- Need to track which documents are relevant to which chat

### Option 3: Current Behavior (Keep As Is)

Each chat requires its own document upload.

**Pros:**
- Simple and isolated
- Clear separation between chats

**Cons:**
- User must upload documents for each new chat
- Confusing UX

## Recommended Fix

### Step 1: Modify Backend Upload Route

```python
# backend/app/api/routes/upload.py

from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import List, Optional

@router.post("/upload", response_model=UploadResponse, tags=["Documents"])
async def upload_documents(
    files: List[UploadFile] = File(...),
    session_id: Optional[str] = Form(None)  # Accept session_id from form
):
    """Upload documents to a specific session or create new session"""
    
    try:
        logger.info(f"Received upload request with {len(files)} files")
        
        # Use provided session_id or generate new one
        if session_id:
            logger.info(f"Using provided session ID: {session_id}")
        else:
            session_id = generate_session_id()
            logger.info(f"Generated new session ID: {session_id}")
        
        # Rest of the code remains the same...
```

### Step 2: Modify Frontend API Call

```typescript
// src/services/api.ts

export const DocsAPI = {
  upload: async (
    files: File[], 
    sessionId?: string,  // Add sessionId parameter
    onProgress?: (p: number) => void
  ) => {
    const formData = new FormData();
    files.forEach(f => formData.append("files", f));
    
    // Include session_id if provided
    if (sessionId) {
      formData.append("session_id", sessionId);
    }
    
    const res = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (e.total) {
          const progress = Math.round((e.loaded * 100) / e.total);
          onProgress?.(progress);
        }
      },
    });
    return res.data;
  },
};
```

### Step 3: Update UploadPanel Component

```typescript
// src/components/lexi/UploadPanel.tsx

interface UploadPanelProps {
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  onSessionId?: (sessionId: string) => void;
  currentSessionId?: string;  // Add current session ID
}

export function UploadPanel({ 
  files, 
  onChange, 
  onSessionId,
  currentSessionId  // Receive current session
}: UploadPanelProps) {
  
  const handleFiles = useCallback(async (list: FileList | null) => {
    // ... existing code ...
    
    try {
      const fileArray = Array.from(list);
      
      // Pass current session ID to upload
      const result = await DocsAPI.upload(
        fileArray, 
        currentSessionId,  // Use current session
        (p) => {
          // progress callback
        }
      );
      
      // ... rest of the code ...
    }
  }, [files, onChange, onSessionId, currentSessionId]);
}
```

### Step 4: Update Chat Page

```typescript
// src/routes/chat.tsx

<RightContextPanel 
  files={files} 
  onFilesChange={setFiles} 
  onSessionId={handleSessionId}
  currentSessionId={sessionId}  // Pass current session ID
/>
```

## Testing the Fix

### Before Fix:
1. Create new chat → session_id: "abc-123"
2. Upload document → creates session_id: "def-456"
3. Try to chat → "No documents found" ❌

### After Fix:
1. Create new chat → session_id: "abc-123"
2. Upload document → uses session_id: "abc-123" ✓
3. Try to chat → Document found, chat works! ✓

## Alternative: Quick Workaround

If you don't want to modify the backend, you can:

1. **Always upload documents AFTER creating a new chat**
2. **Don't switch between old chats** - they won't have documents
3. **Create a new chat for each document upload**

## Summary

The "Document is already uploaded" error isn't actually an error - it's the system telling you that:

1. Old chats don't have documents (they have different session_ids)
2. Only the chat where you uploaded the document has access to it
3. You need to upload documents for each new chat session

**Best Solution:** Modify the system to use the current chat's session_id when uploading documents, so all uploads are associated with the active chat.

Would you like me to implement the recommended fix?
