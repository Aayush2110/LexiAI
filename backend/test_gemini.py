"""
Test Gemini API Connection

This script tests if the Gemini API key works and can generate responses.
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

print("=" * 50)
print("Testing Gemini API Connection")
print("=" * 50)
print()

if not GOOGLE_API_KEY:
    print("❌ ERROR: GOOGLE_API_KEY not found in .env")
    exit(1)

print(f"✅ API Key found: {GOOGLE_API_KEY[:10]}...")
print()

try:
    print("Installing required package...")
    import google.generativeai as genai
    print("✅ Package imported successfully")
    print()
    
    print("Configuring Gemini...")
    genai.configure(api_key=GOOGLE_API_KEY)
    print("✅ Gemini configured")
    print()
    
    print("Creating model...")
    model = genai.GenerativeModel('gemini-pro')
    print("✅ Model created")
    print()
    
    print("Sending test prompt...")
    response = model.generate_content("Say 'Hello, I am working!' in one sentence.")
    print("✅ Response received!")
    print()
    
    print("Response:")
    print("-" * 50)
    print(response.text)
    print("-" * 50)
    print()
    
    print("=" * 50)
    print("✅ SUCCESS! Gemini API is working!")
    print("=" * 50)
    
except ImportError as e:
    print(f"❌ ERROR: Missing package - {e}")
    print()
    print("Install with: pip install google-generativeai")
    
except Exception as e:
    print(f"❌ ERROR: {e}")
    print()
    print("Possible issues:")
    print("1. Invalid API key")
    print("2. API key quota exceeded")
    print("3. Network connection issue")
    print("4. Gemini API service down")
    print()
    print("Check your API key at: https://makersuite.google.com/app/apikey")
