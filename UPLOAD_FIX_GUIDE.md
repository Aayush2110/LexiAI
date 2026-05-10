# 🔧 UPLOAD FAILURE - FIX GUIDE

## Your Issue:
```
home_rental_agreement_dummy_data.pdf
3 KB · Failed
```

## Root Cause:
The frontend is not connecting to the backend. This happens when:
1. Frontend wasn't restarted after .env changes
2. CORS issue
3. Backend not running
4. Wrong API URL

## ✅ STEP-BY-STEP FIX:

### Step 1: Stop Everything
```bash
# Stop frontend (Ctrl+C in terminal)
# Stop backend (Ctrl+C in terminal)
```

### Step 2: Verify .env Files Exist
Run this diagnostic:
```bash
diagnose-upload.bat
```

This will:
- Check if backend is running
- Verify .env files
- Test upload directly to backend

### Step 3: Start Backend
```bash
cd backend
python -m uvicorn app.main:app --reload
```

**Wait for this message:**
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 4: Verify Backend Works
Open browser: http://localhost:8000/docs

You should see the Swagger API documentation.

### Step 5: Start Frontend (FRESH)
```bash
# In root directory
bun run dev
```

**IMPORTANT:** Make sure you see this in the output:
```
VITE v7.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Step 6: Open Browser with DevTools
1. Open: http://localhost:5173/chat
2. Press F12 to open DevTools
3. Go to Console tab
4. Keep it open

### Step 7: Try Upload Again
1. Find upload panel:
   - **Desktop:** Right sidebar, top section
   - **Mobile:** Click "Upload" button

2. Drop your PDF file

3. **Watch the Console** - you should see:
```
[DocsAPI] Starting upload: { fileCount: 1, files: [...] }
[DocsAPI] Appending file: home_rental_agreement_dummy_data.pdf
[DocsAPI] Sending POST request to /upload
[DocsAPI] Upload progress: 50%
[DocsAPI] Upload progress: 100%
[DocsAPI] Upload successful: { session_id: "...", ... }
```

### Step 8: Check for Errors

#### If you see CORS error:
```
Access to XMLHttpRequest at 'http://localhost:8000/upload' from origin 
'http://localhost:5173' has been blocked by CORS policy
```

**Fix:**
1. Check backend .env has:
   ```
   CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:5174,http://localhost:4173,http://localhost:8080
   ```
2. Restart backend
3. Try again

#### If you see Network Error:
```
[DocsAPI] Upload failed: { message: "Network Error" }
```

**Fix:**
1. Backend is not running
2. Start backend: `cd backend && python -m uvicorn app.main:app --reload`
3. Try again

#### If you see 422 Error:
```
[DocsAPI] Upload failed: { status: 422, response: {...} }
```

**Fix:**
1. Check file format (PDF, DOCX, TXT only)
2. Check file size (< 10 MB)
3. Try a simple .txt file first

#### If you see 500 Error:
```
[DocsAPI] Upload failed: { status: 500 }
```

**Fix:**
1. Check backend logs: `backend/logs/app_2026-05-10.log`
2. Look for ERROR messages
3. Common issues:
   - Missing dependencies
   - Google API key issue
   - File processing error

---

## 🧪 Quick Test:

### Test 1: Backend Direct Upload
```bash
# Create test file
echo "This is a test document" > test.txt

# Upload directly to backend
curl -X POST http://localhost:8000/upload -F "files=@test.txt"
```

**Expected Response:**
```json
{
  "session_id": "some-uuid",
  "message": "Files uploaded and processed successfully",
  "files_processed": 1,
  "chunks_created": 1
}
```

If this works, backend is fine. Issue is in frontend.

### Test 2: Frontend API URL
Open browser console and type:
```javascript
console.log(import.meta.env.VITE_API_URL)
```

**Expected:** `http://localhost:8000`

If it shows `undefined`, the .env is not loaded:
1. Make sure .env is in ROOT directory
2. Restart frontend with `bun run dev`
3. Check again

---

## 📋 Checklist:

- [ ] Backend running on port 8000
- [ ] Can access http://localhost:8000/docs
- [ ] .env file exists in ROOT directory
- [ ] .env contains: `VITE_API_URL=http://localhost:8000`
- [ ] Frontend restarted AFTER creating .env
- [ ] Browser DevTools Console open
- [ ] No CORS errors in console
- [ ] Upload shows detailed logs in console

---

## 🎯 Most Common Issue:

**Frontend not restarted after .env changes!**

The .env file is only read when Vite starts. If you:
1. Started frontend
2. Then created/modified .env
3. Didn't restart frontend

→ Frontend doesn't know about the API URL!

**Solution:** Always restart frontend after .env changes:
```bash
# Stop with Ctrl+C
# Then start again
bun run dev
```

---

## 📞 Still Not Working?

Run the diagnostic:
```bash
diagnose-upload.bat
```

Then check:
1. Backend logs: `backend/logs/app_2026-05-10.log`
2. Browser Console (F12 → Console tab)
3. Browser Network tab (F12 → Network tab)
   - Look for the /upload request
   - Check its status
   - Check response

Share the error messages you see!
