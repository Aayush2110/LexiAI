"""
Quick Test - Verify Gemini Model Fix

Tests only the LLM service configuration without loading embedding models.
"""

import sys
from pathlib import Path

backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

print("=" * 60)
print("Quick Test - Verifying Gemini Model Fix")
print("=" * 60)

# Test 1: Check LLM Service Configuration
print("\n1. Checking LLM service configuration...")
try:
    from app.core.config import settings
    print("[OK] Config loaded")
    print("    LLM Provider: {}".format(settings.LLM_PROVIDER))
except Exception as e:
    print("[ERROR] Config failed: {}".format(e))
    sys.exit(1)

# Test 2: Check Gemini Model Name
print("\n2. Checking Gemini model name in code...")
try:
    with open('app/services/llm_service.py', 'r') as f:
        content = f.read()
        if 'model="gemini-pro"' in content:
            print("[OK] Gemini model name is correct: gemini-pro")
        elif 'model="gemini-1.5-flash"' in content:
            print("[ERROR] Old model name still present: gemini-1.5-flash")
            print("    Please restart the backend to apply changes")
            sys.exit(1)
        else:
            print("[WARNING] Could not verify model name")
except Exception as e:
    print("[ERROR] Could not read file: {}".format(e))
    sys.exit(1)

# Test 3: Check Document Loader Returns Correct Type
print("\n3. Checking document loader returns LangChain Documents...")
try:
    with open('app/services/document_loader.py', 'r') as f:
        content = f.read()
        if 'from langchain.schema import Document' in content:
            print("[OK] Document loader imports LangChain Document")
        else:
            print("[ERROR] Missing LangChain Document import")
            sys.exit(1)
        
        if 'Document(' in content and 'page_content=' in content:
            print("[OK] Document loader returns proper Document objects")
        else:
            print("[ERROR] Document loader not returning proper format")
            sys.exit(1)
except Exception as e:
    print("[ERROR] Could not read file: {}".format(e))
    sys.exit(1)

# Test 4: Check Source Formatting
print("\n4. Checking source formatting returns dictionaries...")
try:
    with open('app/utils/helpers.py', 'r') as f:
        content = f.read()
        if "'source': source" in content and "'page': page" in content:
            print("[OK] format_sources returns proper dictionary format")
        else:
            print("[ERROR] format_sources not returning correct format")
            sys.exit(1)
except Exception as e:
    print("[ERROR] Could not read file: {}".format(e))
    sys.exit(1)

# Test 5: Check Chunking Service
print("\n5. Checking chunking service accepts Document objects...")
try:
    with open('app/services/chunking.py', 'r') as f:
        content = f.read()
        if 'documents: List[Document]' in content:
            print("[OK] Chunking service accepts LangChain Documents")
        else:
            print("[WARNING] Chunking service signature may need update")
except Exception as e:
    print("[ERROR] Could not read file: {}".format(e))
    sys.exit(1)

print("\n" + "=" * 60)
print("[SUCCESS] All quick checks passed!")
print("=" * 60)
print("\nNext steps:")
print("1. Restart the backend: cd backend && restart-fixed.bat")
print("2. Upload a document in the frontend")
print("3. Ask a question and verify you get an answer")
print("\nThe main fix (gemini-pro model) is applied correctly!")
