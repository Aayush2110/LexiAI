"""
Comparison Script: Semantic vs Hybrid Search

This script demonstrates the difference between semantic-only and hybrid search.

Usage:
    python compare_retrieval_methods.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from loguru import logger
from langchain_core.documents import Document
from app.services.bm25_retriever import bm25_retriever
from app.services.reranker import reranker_service
from app.services.hybrid_retriever import hybrid_retriever


def create_sample_documents():
    """Create sample legal documents for testing"""
    return [
        Document(
            page_content="Section 5.2 Termination: Either party may terminate this agreement with 30 days written notice.",
            metadata={"source": "contract.pdf", "page": 5, "section": "5.2"}
        ),
        Document(
            page_content="The termination clause allows for early exit under specific conditions.",
            metadata={"source": "contract.pdf", "page": 5, "section": "5.1"}
        ),
        Document(
            page_content="Payment terms require net 30 days from invoice date. Late payments incur 5% interest.",
            metadata={"source": "contract.pdf", "page": 3, "section": "3.1"}
        ),
        Document(
            page_content="Confidentiality obligations remain in effect for 2 years after termination of this agreement.",
            metadata={"source": "contract.pdf", "page": 8, "section": "8.1"}
        ),
        Document(
            page_content="The parties agree to resolve disputes through arbitration in accordance with AAA rules.",
            metadata={"source": "contract.pdf", "page": 10, "section": "10.1"}
        ),
        Document(
            page_content="This agreement shall be governed by the laws of the State of California.",
            metadata={"source": "contract.pdf", "page": 11, "section": "11.1"}
        ),
        Document(
            page_content="Section 5.3 outlines the consequences of termination including return of property.",
            metadata={"source": "contract.pdf", "page": 6, "section": "5.3"}
        ),
        Document(
            page_content="Intellectual property rights remain with the original owner after contract termination.",
            metadata={"source": "contract.pdf", "page": 7, "section": "7.1"}
        ),
    ]


def simulate_semantic_search(docs, query, top_k=3):
    """
    Simulate semantic search (simplified)
    In reality, this would use embeddings and cosine similarity
    """
    # Simple keyword matching as proxy for semantic similarity
    query_words = set(query.lower().split())
    
    scores = []
    for doc in docs:
        doc_words = set(doc.page_content.lower().split())
        # Jaccard similarity as simple proxy
        intersection = query_words & doc_words
        union = query_words | doc_words
        score = len(intersection) / len(union) if union else 0
        scores.append((doc, score))
    
    # Sort by score
    scores.sort(key=lambda x: x[1], reverse=True)
    return [doc for doc, score in scores[:top_k]]


def compare_methods(query, docs):
    """Compare semantic vs hybrid search"""
    
    logger.info("=" * 80)
    logger.info(f"QUERY: {query}")
    logger.info("=" * 80)
    
    # Method 1: Semantic Search Only
    logger.info("\n📊 METHOD 1: Semantic Search Only")
    logger.info("-" * 80)
    semantic_results = simulate_semantic_search(docs, query, top_k=3)
    
    for i, doc in enumerate(semantic_results, 1):
        logger.info(f"\nResult {i}:")
        logger.info(f"  Section: {doc.metadata.get('section', 'N/A')}")
        logger.info(f"  Content: {doc.page_content[:100]}...")
    
    # Method 2: BM25 Only
    logger.info("\n\n📊 METHOD 2: BM25 Keyword Search Only")
    logger.info("-" * 80)
    bm25_retriever.index_documents(docs)
    bm25_results = bm25_retriever.retrieve(query, top_k=3)
    
    for i, (doc, score) in enumerate(bm25_results, 1):
        logger.info(f"\nResult {i} (Score: {score:.4f}):")
        logger.info(f"  Section: {doc.metadata.get('section', 'N/A')}")
        logger.info(f"  Content: {doc.page_content[:100]}...")
    
    # Method 3: Hybrid (Semantic + BM25 + Reranking)
    logger.info("\n\n📊 METHOD 3: Hybrid Search (Semantic + BM25 + Reranking)")
    logger.info("-" * 80)
    
    # Get semantic results
    semantic_docs = simulate_semantic_search(docs, query, top_k=5)
    
    # Get BM25 results
    bm25_docs = bm25_retriever.get_top_k_documents(query, top_k=5)
    
    # Fusion
    fused_docs = hybrid_retriever._reciprocal_rank_fusion(
        semantic_docs,
        bm25_docs,
        top_k=5
    )
    
    # Reranking
    reranked_results = reranker_service.rerank(query, fused_docs, top_k=3)
    
    for i, (doc, score) in enumerate(reranked_results, 1):
        logger.info(f"\nResult {i} (Rerank Score: {score:.4f}):")
        logger.info(f"  Section: {doc.metadata.get('section', 'N/A')}")
        logger.info(f"  Content: {doc.page_content[:100]}...")
    
    logger.info("\n" + "=" * 80)
    logger.info("ANALYSIS")
    logger.info("=" * 80)
    
    # Analyze which method found the most relevant result
    target_section = "5.2"  # For "Section 5.2" query
    
    semantic_found = any(doc.metadata.get('section') == target_section for doc in semantic_results)
    bm25_found = any(doc.metadata.get('section') == target_section for doc, _ in bm25_results)
    hybrid_found = any(doc.metadata.get('section') == target_section for doc, _ in reranked_results)
    
    logger.info(f"\nTarget Section: {target_section}")
    logger.info(f"  Semantic Search: {'✓ Found' if semantic_found else '✗ Missed'}")
    logger.info(f"  BM25 Search: {'✓ Found' if bm25_found else '✗ Missed'}")
    logger.info(f"  Hybrid Search: {'✓ Found' if hybrid_found else '✗ Missed'}")
    
    # Check ranking
    if hybrid_found:
        hybrid_rank = next(i for i, (doc, _) in enumerate(reranked_results, 1) 
                          if doc.metadata.get('section') == target_section)
        logger.info(f"\nHybrid Search Ranking: #{hybrid_rank} (Higher is better)")


def main():
    """Run comparison"""
    
    logger.info("🔍 Retrieval Methods Comparison")
    logger.info("=" * 80)
    logger.info("This script compares three retrieval methods:")
    logger.info("  1. Semantic Search Only (traditional)")
    logger.info("  2. BM25 Keyword Search Only")
    logger.info("  3. Hybrid Search (Semantic + BM25 + Reranking)")
    logger.info("=" * 80)
    
    # Create sample documents
    docs = create_sample_documents()
    logger.info(f"\nCreated {len(docs)} sample legal documents")
    
    # Test queries
    queries = [
        "What is in Section 5.2?",
        "Tell me about termination conditions",
        "What are the payment terms?",
    ]
    
    for query in queries:
        compare_methods(query, docs)
        logger.info("\n\n")
    
    # Summary
    logger.info("=" * 80)
    logger.info("SUMMARY")
    logger.info("=" * 80)
    logger.info("""
Key Observations:

1. SEMANTIC SEARCH:
   ✓ Good at understanding meaning and context
   ✗ May miss exact section numbers or technical terms
   
2. BM25 SEARCH:
   ✓ Excellent at exact keyword matching (e.g., "Section 5.2")
   ✗ Doesn't understand semantic meaning
   
3. HYBRID SEARCH:
   ✓ Combines strengths of both methods
   ✓ Reranking refines results for best accuracy
   ✓ Most robust across different query types
   
RECOMMENDATION: Use Hybrid Search for production systems!
    """)


if __name__ == "__main__":
    main()
