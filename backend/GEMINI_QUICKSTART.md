# 🚀 Quick Start with Google Gemini

## Get Your Free Gemini API Key (2 minutes)

### Step 1: Get Gemini API Key

1. Go to **Google AI Studio**: https://aistudio.google.com/app/apikey
   - Or: https://makersuite.google.com/app/apikey

2. Click **"Get API Key"** or **"Create API Key"**

3. Select or create a Google Cloud project

4. Copy your API key (starts with `AIza...`)

### Why Gemini?

✅ **Free tier available** - Generous free quota
✅ **Fast responses** - Similar to GPT-3.5 Turbo
✅ **Good quality** - Competitive with GPT-3.5
✅ **Easy to use** - Simple API
✅ **No credit card required** - For free tier

---

## Setup (3 minutes)

### Windows

```bash
cd backend

# Run setup
setup.bat

# Edit .env file
notepad .env
```

Add your Gemini API key:
```env
LLM_PROVIDER=gemini
GOOGLE_API_KEY=AIza...your-key-here
```

Save and run:
```bash
start.bat
```

### Linux/Mac

```bash
cd backend

# Run setup
chmod +x setup.sh start.sh
./setup.sh

# Edit .env file
nano .env
```

Add your Gemini API key:
```env
LLM_PROVIDER=gemini
GOOGLE_API_KEY=AIza...your-key-here
```

Save and run:
```bash
./start.sh
```

---

## Test the API (2 minutes)

### 1. Open Swagger UI

Go to: http://localhost:8000/docs

### 2. Upload a Document

1. Click **POST /upload**
2. Click **Try it out**
3. Upload a PDF, DOCX, or TXT file
4. Click **Execute**
5. Copy the `session_id` from response

### 3. Ask a Question

1. Click **POST /chat**
2. Click **Try it out**
3. Paste your `session_id`
4. Enter a question like: "What is this document about?"
5. Click **Execute**
6. See the AI-generated answer!

---

## Gemini API Limits

### Free Tier (Generous!)

- **60 requests per minute**
- **1,500 requests per day**
- **1 million tokens per day**

This is **more than enough** for development and testing!

### Rate Limits

If you hit rate limits, the app will show an error. Just wait a minute and try again.

---

## Gemini vs OpenAI

| Feature | Gemini (Free) | OpenAI (Paid) |
|---------|---------------|---------------|
| **Cost** | Free tier | $0.002/1K tokens |
| **Speed** | Fast | Fast |
| **Quality** | Good | Excellent |
| **Rate Limit** | 60/min | 3500/min |
| **Best for** | Development, Testing | Production |

**Recommendation**: Start with Gemini (free), switch to OpenAI for production if needed.

---

## Switching to OpenAI Later

If you want to switch to OpenAI later, just:

1. Get OpenAI API key from: https://platform.openai.com/api-keys
2. Edit `.env`:
   ```env
   LLM_PROVIDER=openai
   OPENAI_API_KEY=sk-...your-key-here
   ```
3. Restart the application

That's it! No code changes needed.

---

## Example API Calls

### Using cURL

**Upload:**
```bash
curl -X POST "http://localhost:8000/upload" \
  -F "files=@contract.pdf"
```

**Chat:**
```bash
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "your-session-id",
    "question": "What are the main terms?"
  }'
```

### Using Python

```python
import requests

# Upload
files = {'files': open('contract.pdf', 'rb')}
response = requests.post('http://localhost:8000/upload', files=files)
session_id = response.json()['session_id']

# Chat
data = {
    "session_id": session_id,
    "question": "What are the payment terms?"
}
response = requests.post('http://localhost:8000/chat', json=data)
print(response.json()['answer'])
```

---

## Troubleshooting

### "API key not configured"

**Solution**: Check your `.env` file has:
```env
LLM_PROVIDER=gemini
GOOGLE_API_KEY=AIza...
```

### "Invalid API key"

**Solution**: 
1. Verify your API key is correct
2. Make sure there are no extra spaces
3. Get a new key from: https://aistudio.google.com/app/apikey

### "Rate limit exceeded"

**Solution**: 
- Wait 1 minute and try again
- Free tier: 60 requests/minute
- Upgrade to paid tier for higher limits

### "Module not found"

**Solution**: 
```bash
pip install -r requirements.txt
```

---

## Gemini Model Details

### Model: gemini-pro

- **Context window**: 32K tokens (~24K words)
- **Output limit**: 8K tokens (~6K words)
- **Languages**: 100+ languages
- **Capabilities**: Text understanding, generation, reasoning

### Temperature Setting

In `.env`, you can adjust:
```env
LLM_TEMPERATURE=0.1  # 0.0 = deterministic, 1.0 = creative
```

For legal documents: **0.1-0.3** (more factual, less creative)

---

## Next Steps

1. ✅ **Test with your documents** - Upload PDFs, DOCX, TXT
2. ✅ **Read the docs** - See `README.md` for full documentation
3. ✅ **Understand RAG** - Read `docs/rag_explained.md`
4. ✅ **Customize** - Adjust settings in `.env`
5. ✅ **Deploy** - See `docs/deployment.md` when ready

---

## Useful Links

- **Gemini API Docs**: https://ai.google.dev/docs
- **Get API Key**: https://aistudio.google.com/app/apikey
- **Pricing**: https://ai.google.dev/pricing
- **Rate Limits**: https://ai.google.dev/docs/rate_limits
- **Models**: https://ai.google.dev/models/gemini

---

## 🎉 You're All Set!

Your LegalRAG backend is now running with **Google Gemini**!

- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **Health**: http://localhost:8000/health

**Happy coding!** 🚀

---

## Support

- **Documentation**: Read `README.md`
- **RAG Concepts**: Read `docs/rag_explained.md`
- **Architecture**: Read `docs/architecture.md`
- **Deployment**: Read `docs/deployment.md`

For issues, check the troubleshooting section above or read the full documentation.
