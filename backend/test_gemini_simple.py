"""
Test Gemini API Connection - Simple Version

This script tests if the Gemini API key works.
"""

import sys
import os

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("=" * 50)
print("Testing Gemini API Connection")
print("=" * 50)
print()

try:
    print("Loading configuration...")
    from app.core.config import settings
    print("[OK] Configuration loaded")
    print()
    
    print(f"LLM Provider: {settings.LLM_PROVIDER}")
    print(f"API Key: {settings.GOOGLE_API_KEY[:10]}..." if settings.GOOGLE_API_KEY else "[ERROR] No API key found")
    print()
    
    if not settings.GOOGLE_API_KEY:
        print("[ERROR] GOOGLE_API_KEY not set in .env")
        exit(1)
    
    print("Importing Gemini library...")
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain_core.messages import HumanMessage
    print("[OK] Library imported")
    print()
    
    print("Creating Gemini model...")
    llm = ChatGoogleGenerativeAI(
        model="gemini-pro",
        temperature=0.1,
        google_api_key=settings.GOOGLE_API_KEY,
        convert_system_message_to_human=True
    )
    print("[OK] Model created")
    print()
    
    print("Sending test message...")
    print("(This may take 5-10 seconds...)")
    message = HumanMessage(content="Say 'Hello, I am working!' in one sentence.")
    response = llm.invoke([message])
    print("[OK] Response received!")
    print()
    
    print("Response:")
    print("-" * 50)
    print(response.content)
    print("-" * 50)
    print()
    
    print("=" * 50)
    print("[SUCCESS] Gemini API is working!")
    print("=" * 50)
    print()
    print("Your backend should work now.")
    print("If you're still getting errors, restart the backend.")
    
except ImportError as e:
    print(f"[ERROR] Missing package - {e}")
    print()
    print("Run: pip install -r requirements.txt")
    
except Exception as e:
    print(f"[ERROR] {e}")
    print()
    print("Error type:", type(e).__name__)
    print()
    print("Possible issues:")
    print("1. Invalid API key")
    print("2. API key quota exceeded")
    print("3. Network connection issue")
    print("4. Gemini API service down")
    print()
    print("Solutions:")
    print("- Check API key at: https://makersuite.google.com/app/apikey")
    print("- Verify you have internet connection")
    print("- Try creating a new API key")
    print()
    import traceback
    print("Full error:")
    print(traceback.format_exc())
