import os
from typing import Dict, Any
from loguru import logger
import torch  # Since you installed this in requirements, we can use it to auto-detect

class Config:
    """Configuration manager for NeuroLearn AI Assistant"""
    
    # Server Configuration
    HOST = os.getenv("HOST", "127.0.0.1")
    PORT = int(os.getenv("PORT", 8000))
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"
    
    # Hardware Configuration
    # Auto-detects your RTX 5060. If torch is installed correctly, it uses the GPU.
    USE_GPU = os.getenv("USE_GPU", "true").lower() == "true" and torch.cuda.is_available()
    
    # Agent Configuration
    AGENTS = {
        "orchestrator": {"enabled": True, "max_history": 10},
        "devnews": {"enabled": True, "search_limit": 5},
        "github": {"enabled": True, "search_limit": 5},
        "tech_trend": {"enabled": True, "search_limit": 5},
        "learning": {"enabled": True, "search_limit": 5}
    }
    
    # Knowledge Base Configuration
    KNOWLEDGE_BASE = {
        "similarity_threshold": 0.1,
        "max_results": 5
    }
    
    # Memory Configuration
    MEMORY = {
        "db_path": "data/conversations.db",
        "max_messages": 100,
        "retention_days": 30
    }
    
    # Response Configuration
    RESPONSE = {
        "max_length": 5000,
        "enable_streaming": True,
        "confidence_threshold": 0.3
    }
    
    @classmethod
    def validate(cls):
        """Validate configuration"""
        logger.info(f"Server: {cls.HOST}:{cls.PORT}")
        logger.info(f"Debug Mode: {cls.DEBUG}")
        logger.info(f"GPU Enabled: {cls.USE_GPU} (RTX 5060 active: {torch.cuda.is_available()})")
        logger.info(f"Enabled Agents: {[agent for agent, config in cls.AGENTS.items() if config['enabled']]}")
        return True

config = Config()