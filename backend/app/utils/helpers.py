"""
Helper Utilities Module

General helper functions used across the application.
"""

from typing import List, Dict, Any
import re


def clean_text(text: str) -> str:
    """
    Clean extracted text from documents
    
    Removes:
    - Extra whitespace
    - Special characters that might interfere with processing
    - Multiple newlines
    
    Args:
        text: Raw text from document
        
    Returns:
        str: Cleaned text
    """
    
    # Remove multiple spaces
    text = re.sub(r'\s+', ' ', text)
    
    # Remove multiple newlines
    text = re.sub(r'\n+', '\n', text)
    
    # Strip leading/trailing whitespace
    text = text.strip()
    
    return text


def format_sources(documents: List[Any]) -> List[Dict[str, Any]]:
    """
    Format retrieved documents into readable source citations
    
    Args:
        documents: List of LangChain Document objects
        
    Returns:
        List[Dict]: Formatted source dictionaries with 'source' and 'page' keys
    """
    
    sources = []
    for doc in documents:
        # Get page number if available
        page = doc.metadata.get('page', 1)
        source = doc.metadata.get('source', 'Unknown')
        
        sources.append({
            'source': source,
            'page': page
        })
    
    return sources


def merge_texts(texts: List[str]) -> str:
    """
    Merge multiple document texts into one
    
    Args:
        texts: List of text strings from different documents
        
    Returns:
        str: Merged text with document separators
    """
    
    merged = "\n\n--- DOCUMENT SEPARATOR ---\n\n".join(texts)
    return merged
