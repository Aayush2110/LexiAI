# Upload Troubleshooting Guide

## Issues Fixed:
1. ✅ Frontend now connects to real backend API
2. ✅ Session management implemented
3. ✅ Upload panel visible on desktop (right sidebar)
4. ✅ Upload panel visible on mobile (click "Upload" button)
5. ✅ CORS configured for multiple localhost ports
6. ✅ Error handling and logging added

## How to Test:

### Step 1: Start Backend
```bash
cd backend
python -m uvicorn app.main:app --reload
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### Step 2: Verify Backend is Running
Open browser: http://localhost:8000/docs
You should see the FastAPI Swagger documentation.

### Step 3: Start Frontend
```bash
# In root directory
bun run dev
```

**Expected Output:**
```
VITE v7.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Step 4: Test Upload

#### Desktop (Screen width > 1280px):
- Look at the RIGHT sidebar
- You'll see "Upload Documents" section at the top
- Drag & drop files or click to upload

#### Mobile/Tablet:
- Click the "Upload" button in the top bar
- Upload panel will slide down
- Drag & drop files or click to upload

## Common Issues:

### Issue 1: Upload Fails with CORS Error
**Symptom:** Browser console shows CORS error
**Solution:** 
1. Check backend is running on port 8000
2. Check frontend .env has: `VITE_API_URL=http://localhost:8000`
3. Restart both frontend and backend

### Issue 2: Upload Fails with 500 Error
**Symptom:** File shows "Failed" status
**Solution:**
1. Check backend logs: `backend/logs/app_2026-05-10.log`
2. Verify Google API key is set in `backend/.env`
3. Check file format (PDF, DOCX, TXT only)

### Issue 3: Upload Panel Not Visible
**Desktop:**
- Make sure screen width > 1280px (xl breakpoint)
- Right sidebar should be visible
- Upload panel is at the TOP of right sidebar

**Mobile:**
- Click "Upload" button in top bar
- Panel slides down below the button

### Issue 4: Session ID Not Set
**Symptom:** Can't ask questions after upload
**Solution:**
1. Open browser console (F12)
2. Check for errors during upload
3. Verify backend returns `session_id` in response

## Debug Commands:

### Check Backend Health:
```bash
curl http://localhost:8000/health
```

### Test Upload (with test file):
```bash
# Create test file
echo "This is a test document" > test.txt

# Upload it
curl -X POST http://localhost:8000/upload -F "files=@test.txt"
```

### Check Backend Logs:
```bash
cd backend
type logs\app_2026-05-10.log
```

### Check Frontend Console:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors during upload
4. Check Network tab for failed requests

## File Requirements:
- **Formats:** PDF, DOCX, TXT only
- **Size:** Up to 10 MB per file (configurable in backend/.env)
- **Content:** Must have readable text

## Expected Flow:
1. Upload file → Status: "Uploading" (progress bar)
2. Backend processes → Status: "Processing"
3. Embeddings created → Status: "Indexed" (green checkmark)
4. Session ID stored → Can now ask questions

## Still Having Issues?

Check these files for errors:
1. Browser Console (F12 → Console)
2. Backend logs: `backend/logs/app_2026-05-10.log`
3. Network tab (F12 → Network) - look for failed requests

Common error patterns:
- `ERR_CONNECTION_REFUSED` → Backend not running
- `CORS error` → Wrong port or CORS not configured
- `422 Unprocessable Entity` → Wrong request format
- `500 Internal Server Error` → Check backend logs
