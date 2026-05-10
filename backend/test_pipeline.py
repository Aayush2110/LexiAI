"""
Test RAG Pipeline End-to-End

This script tests the complete RAG pipeline to identify any issues.
"""

import os
import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.services.document_loader import document_loader
from app.services.chunking import chunking_service
from app.services.vector_store import vector_store_service
from app.services.retriever import retriever_service
from app.services.llm_service import llm_service
from loguru import logger

def test_pipeline():
    """Test the complete RAG pipeline"""
    
    print("=" * 60)
    print("Testing RAG Pipeline")
    print("=" * 60)
    
    # Test 1: Check if test document exists
    print("\n1. Checking for test documents...")
    uploads_dir = backend_dir / "data" / "uploads"
    
    # Find any uploaded PDF
    test_file = None
    for session_dir in uploads_dir.iterdir():
        if session_dir.is_dir():
            for file in session_dir.iterdir():
                if file.suffix == '.pdf':
                    test_file = str(file)
                    break
            if test_file:
                break
    
    if not test_file:
        print("[ERROR] No test PDF found. Please upload a document first.")
        return False
    
    print("[OK] Found test file: {}".format(test_file))
    
    # Test 2: Load document
    print("\n2. Testing document loading...")
    try:
        documents = document_loader.load_documents([test_file])
        print("[OK] Loaded {} document sections".format(len(documents)))
        if documents:
            print("  First doc preview: {}...".format(documents[0].page_content[:100]))
    except Exception as e:
        print("[ERROR] Document loading failed: {}".format(e))
        return False
    
    # Test 3: Chunk documents
    print("\n3. Testing document chunking...")
    try:
        chunks = chunking_service.chunk_documents(documents)
        print("[OK] Created {} chunks".format(len(chunks)))
        stats = chunking_service.get_chunk_stats(chunks)
        print("  Stats: {}".format(stats))
    except Exception as e:
        print("[ERROR] Chunking failed: {}".format(e))
        return False
    
    # Test 4: Create vector store
    print("\n4. Testing vector store creation...")
    try:
        test_session = "test_pipeline_session"
        vectorstore = vector_store_service.create_vectorstore(chunks, test_session)
        print("[OK] Vector store created for session: {}".format(test_session))
    except Exception as e:
        print("[ERROR] Vector store creation failed: {}".format(e))
        return False
    
    # Test 5: Load vector store
    print("\n5. Testing vector store loading...")
    try:
        loaded_vectorstore = vector_store_service.load_vectorstore(test_session)
        if loaded_vectorstore:
            print("[OK] Vector store loaded successfully")
        else:
            print("[ERROR] Vector store loading returned None")
            return False
    except Exception as e:
        print("[ERROR] Vector store loading failed: {}".format(e))
        return False
    
    # Test 6: Retrieve documents
    print("\n6. Testing document retrieval...")
    try:
        test_query = "What is the lease start date?"
        retrieved_docs = retriever_service.retrieve(loaded_vectorstore, test_query)
        print("[OK] Retrieved {} documents".format(len(retrieved_docs)))
        if retrieved_docs:
            print("  First result preview: {}...".format(retrieved_docs[0].page_content[:100]))
    except Exception as e:
        print("[ERROR] Retrieval failed: {}".format(e))
        return False
    
    # Test 7: Format context
    print("\n7. Testing context formatting...")
    try:
        context = retriever_service.format_context(retrieved_docs)
        print("[OK] Context formatted ({} characters)".format(len(context)))
        print("  Context preview: {}...".format(context[:200]))
    except Exception as e:
        print("[ERROR] Context formatting failed: {}".format(e))
        return False
    
    # Test 8: Generate answer
    print("\n8. Testing LLM answer generation...")
    try:
        answer = llm_service.generate_answer(test_query, context)
        print("[OK] Answer generated ({} characters)".format(len(answer)))
        print("  Answer: {}".format(answer))
    except Exception as e:
        print("[ERROR] Answer generation failed: {}".format(e))
        import traceback
        traceback.print_exc()
        return False
    
    # Cleanup
    print("\n9. Cleaning up test session...")
    try:
        vector_store_service.delete_vectorstore(test_session)
        print("[OK] Test session cleaned up")
    except Exception as e:
        print("[WARNING] Cleanup warning: {}".format(e))
    
    print("\n" + "=" * 60)
    print("[SUCCESS] All tests passed! Pipeline is working correctly.")
    print("=" * 60)
    return True

if __name__ == "__main__":
    try:
        success = test_pipeline()
        sys.exit(0 if success else 1)
    except Exception as e:
        print("\n[ERROR] Test failed with exception: {}".format(e))
        import traceback
        traceback.print_exc()
        sys.exit(1)
