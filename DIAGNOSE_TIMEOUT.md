# 🔍 Diagnosing "Failed to get response"

## What's Happening:

The backend is processing your request but either:
1. Gemini API is slow/timing out
2. Gemini API key has issues
3. Network connectivity problem
4. Frontend timing out before backend responds

## 🧪 Step 1: Test Gemini API Directly

```bash
cd backend
python test_gemini.py
```

This will test if your Gemini API key works.

**Expected Output:**
```
✅ SUCCESS! Gemini API is working!
Response: Hello, I am working!
```

**If it fails:**
- Check API key at: https://makersuite.google.com/app/apikey
- Verify API key quota hasn't been exceeded
- Check network connection

## 🔍 Step 2: Check Backend Logs in Real-Time

Open backend terminal and watch for errors when you ask a question.

**Look for:**
```
ERROR | app.services.llm_service:generate_answer - Error generating answer: ...
```

## 🚀 Step 3: Restart Backend with New Fixes

I've added:
- Better error logging
- Increased frontend timeout (60 seconds)
- More detailed debugging

**Restart backend:**
```bash
cd backend
python -m uvicorn app.main:app --reload
```

**Restart frontend:**
```bash
# Ctrl+C to stop
bun run dev
```

## 🧪 Step 4: Try Again

1. Upload your PDF (if not already uploaded)
2. Ask a simple question: "What is this document about?"
3. Wait up to 60 seconds
4. Check backend terminal for logs

## 📊 What You Should See:

### Backend Terminal:
```
INFO: Generating answer from LLM
DEBUG: Question: what is lease start date?
DEBUG: Context length: 1529 characters
INFO: Answer generated successfully
DEBUG: Answer length: 150 characters
INFO: Query processed successfully
```

### Browser:
Answer appears with source citations!

## 🐛 Common Issues:

### Issue 1: Gemini API Key Invalid
**Symptom:** test_gemini.py fails
**Fix:** 
1. Go to https://makersuite.google.com/app/apikey
2. Create new API key
3. Update backend/.env with new key
4. Restart backend

### Issue 2: API Quota Exceeded
**Symptom:** "Quota exceeded" error
**Fix:**
- Wait for quota to reset (usually daily)
- Or create new API key
- Or upgrade to paid plan

### Issue 3: Slow Network
**Symptom:** Takes > 30 seconds
**Fix:**
- Frontend timeout now 60 seconds
- Just wait longer
- Check internet connection

### Issue 4: Gemini Service Down
**Symptom:** Connection errors
**Fix:**
- Check https://status.cloud.google.com/
- Wait for service to recover
- Or temporarily switch to OpenAI

## 🔄 Alternative: Switch to OpenAI

If Gemini keeps failing, you can use OpenAI instead:

1. Get OpenAI API key: https://platform.openai.com/api-keys
2. Update backend/.env:
   ```
   LLM_PROVIDER=openai
   OPENAI_API_KEY=sk-your-key-here
   ```
3. Restart backend

## 📝 Debug Checklist:

- [ ] Ran test_gemini.py successfully
- [ ] Backend restarted with new code
- [ ] Frontend restarted
- [ ] Waited 60 seconds for response
- [ ] Checked backend logs for errors
- [ ] Verified API key is valid
- [ ] Checked network connection

## 💡 Quick Test:

Run this to see if Gemini works:
```bash
cd backend
python test_gemini.py
```

If this works, the issue is in the integration. If it fails, the issue is with the API key or network.
