"""
Test Script for Hybrid Search Implementation

This script tests the hybrid search functionality to ensure everything works correctly.

Usage:
    python test_hybrid_search.py
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from loguru import logger
from langchain_core.documents import Document


def test_bm25_retriever():
    """Test BM25 retriever"""
    logger.info("=" * 60)
    logger.info("TEST 1: BM25 Retriever")
    logger.info("=" * 60)
    
    try:
        from app.services.bm25_retriever import bm25_retriever
        
        # Create sample documents
        docs = [
            Document(
                page_content="The termination clause in Section 5.2 states that either party may terminate with 30 days notice.",
                metadata={"source": "contract.pdf", "page": 5}
            ),
            Document(
                page_content="Payment terms require net 30 days from invoice date.",
                metadata={"source": "contract.pdf", "page": 3}
            ),
            Document(
                page_content="The confidentiality agreement remains in effect for 2 years after termination.",
                metadata={"source": "contract.pdf", "page": 8}
            ),
        ]
        
        # Index documents
        logger.info("Indexing documents for BM25...")
        bm25_retriever.index_documents(docs)
        
        # Test query
        query = "What is in Section 5.2?"
        logger.info(f"Query: {query}")
        
        results = bm25_retriever.retrieve(query, top_k=2)
        
        logger.info(f"Retrieved {len(results)} documents")
        for i, (doc, score) in enumerate(results, 1):
            logger.info(f"Result {i} - Score: {score:.4f}")
            logger.info(f"  Content: {doc.page_content[:100]}...")
        
        logger.success("✓ BM25 Retriever test passed")
        return True
    
    except Exception as e:
        logger.error(f"✗ BM25 Retriever test failed: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return False


def test_reranker():
    """Test reranker service"""
    logger.info("\n" + "=" * 60)
    logger.info("TEST 2: Reranker Service")
    logger.info("=" * 60)
    
    try:
        from app.services.reranker import reranker_service
        
        # Create sample documents
        docs = [
            Document(
                page_content="The termination clause in Section 5.2 states that either party may terminate with 30 days notice.",
                metadata={"source": "contract.pdf", "page": 5}
            ),
            Document(
                page_content="Payment terms require net 30 days from invoice date.",
                metadata={"source": "contract.pdf", "page": 3}
            ),
            Document(
                page_content="The confidentiality agreement remains in effect for 2 years after termination.",
                metadata={"source": "contract.pdf", "page": 8}
            ),
        ]
        
        # Test query
        query = "What are the termination conditions?"
        logger.info(f"Query: {query}")
        
        # Rerank
        logger.info("Reranking documents...")
        results = reranker_service.rerank(query, docs, top_k=2)
        
        logger.info(f"Reranked to {len(results)} documents")
        for i, (doc, score) in enumerate(results, 1):
            logger.info(f"Result {i} - Score: {score:.4f}")
            logger.info(f"  Content: {doc.page_content[:100]}...")
        
        logger.success("✓ Reranker test passed")
        return True
    
    except Exception as e:
        logger.error(f"✗ Reranker test failed: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return False


def test_reciprocal_rank_fusion():
    """Test RRF fusion"""
    logger.info("\n" + "=" * 60)
    logger.info("TEST 3: Reciprocal Rank Fusion")
    logger.info("=" * 60)
    
    try:
        from app.services.hybrid_retriever import hybrid_retriever
        
        # Create sample documents
        semantic_docs = [
            Document(page_content="Termination clause details", metadata={"source": "doc1.pdf", "page": 1}),
            Document(page_content="Payment terms", metadata={"source": "doc1.pdf", "page": 2}),
        ]
        
        bm25_docs = [
            Document(page_content="Section 5.2 termination", metadata={"source": "doc1.pdf", "page": 3}),
            Document(page_content="Termination clause details", metadata={"source": "doc1.pdf", "page": 1}),
        ]
        
        # Test fusion
        logger.info("Fusing semantic and BM25 results...")
        fused = hybrid_retriever._reciprocal_rank_fusion(
            semantic_docs,
            bm25_docs,
            top_k=3
        )
        
        logger.info(f"Fused to {len(fused)} documents")
        for i, doc in enumerate(fused, 1):
            logger.info(f"Result {i}: {doc.page_content}")
        
        logger.success("✓ RRF test passed")
        return True
    
    except Exception as e:
        logger.error(f"✗ RRF test failed: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return False


def test_configuration():
    """Test configuration loading"""
    logger.info("\n" + "=" * 60)
    logger.info("TEST 4: Configuration")
    logger.info("=" * 60)
    
    try:
        from app.core.config import settings
        
        logger.info(f"USE_HYBRID_SEARCH: {settings.USE_HYBRID_SEARCH}")
        logger.info(f"USE_RERANKING: {settings.USE_RERANKING}")
        logger.info(f"RETRIEVAL_K: {settings.RETRIEVAL_K}")
        logger.info(f"TOP_K_RETRIEVAL: {settings.TOP_K_RETRIEVAL}")
        logger.info(f"SEMANTIC_WEIGHT: {settings.SEMANTIC_WEIGHT}")
        logger.info(f"BM25_WEIGHT: {settings.BM25_WEIGHT}")
        logger.info(f"RERANKER_MODEL: {settings.RERANKER_MODEL}")
        
        logger.success("✓ Configuration test passed")
        return True
    
    except Exception as e:
        logger.error(f"✗ Configuration test failed: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return False


def main():
    """Run all tests"""
    logger.info("Starting Hybrid Search Tests")
    logger.info("=" * 60)
    
    results = []
    
    # Run tests
    results.append(("Configuration", test_configuration()))
    results.append(("BM25 Retriever", test_bm25_retriever()))
    results.append(("Reranker", test_reranker()))
    results.append(("RRF Fusion", test_reciprocal_rank_fusion()))
    
    # Summary
    logger.info("\n" + "=" * 60)
    logger.info("TEST SUMMARY")
    logger.info("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        logger.info(f"{test_name}: {status}")
    
    logger.info("=" * 60)
    logger.info(f"Results: {passed}/{total} tests passed")
    
    if passed == total:
        logger.success("🎉 All tests passed!")
        return 0
    else:
        logger.error(f"❌ {total - passed} test(s) failed")
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
