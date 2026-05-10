"""
Session Metadata Storage

Stores metadata about each session including document stats.
"""

import json
import os
from typing import Dict, Optional
from loguru import logger
from app.core.config import settings


class SessionMetadata:
    """
    Session Metadata Manager
    
    Stores and retrieves session metadata like total pages and chunks.
    """
    
    def __init__(self):
        """Initialize session metadata manager"""
        self.metadata_dir = os.path.join(settings.vectorstores_dir, ".metadata")
        os.makedirs(self.metadata_dir, exist_ok=True)
    
    def save_metadata(self, session_id: str, metadata: Dict) -> None:
        """
        Save session metadata
        
        Args:
            session_id: Session identifier
            metadata: Metadata dictionary
        """
        try:
            metadata_file = os.path.join(self.metadata_dir, f"{session_id}.json")
            with open(metadata_file, 'w') as f:
                json.dump(metadata, f, indent=2)
            logger.debug(f"Saved metadata for session: {session_id}")
        except Exception as e:
            logger.error(f"Error saving metadata: {str(e)}")
    
    def load_metadata(self, session_id: str) -> Optional[Dict]:
        """
        Load session metadata
        
        Args:
            session_id: Session identifier
            
        Returns:
            Dict: Metadata or None if not found
        """
        try:
            metadata_file = os.path.join(self.metadata_dir, f"{session_id}.json")
            if os.path.exists(metadata_file):
                with open(metadata_file, 'r') as f:
                    return json.load(f)
            return None
        except Exception as e:
            logger.error(f"Error loading metadata: {str(e)}")
            return None
    
    def delete_metadata(self, session_id: str) -> None:
        """
        Delete session metadata
        
        Args:
            session_id: Session identifier
        """
        try:
            metadata_file = os.path.join(self.metadata_dir, f"{session_id}.json")
            if os.path.exists(metadata_file):
                os.remove(metadata_file)
                logger.debug(f"Deleted metadata for session: {session_id}")
        except Exception as e:
            logger.error(f"Error deleting metadata: {str(e)}")


# Global instance
session_metadata = SessionMetadata()
