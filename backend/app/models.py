from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union
from enum import Enum
from datetime import datetime
import uuid

class UserRole(str, Enum):
    """User role enumeration"""
    STUDENT = "student"
    DEVELOPER = "developer"
    EDUCATOR = "educator"
    TECH_LEARNER = "tech_learner"

class AgentType(str, Enum):
    """Agent type enumeration"""
    ORCHESTRATOR = "orchestrator"
    DEVNEWS = "devnews"
    GITHUB = "github"
    TECH_TREND = "tech_trend"
    LEARNING = "learning"

class QueryIntent(str, Enum):
    """Query intent enumeration"""
    DEVNEWS = "devnews"
    GITHUB = "github"
    TECH_TREND = "tech_trend"
    LEARNING = "learning"
    GENERAL = "general"
    COMPARISON = "comparison"
    EXPLANATION = "explanation"

class ChatRequest(BaseModel):
    """Chat request model"""
    message: str = Field(..., min_length=1, max_length=1000, description="User message")
    user_role: UserRole = Field(default=UserRole.TECH_LEARNER, description="User role")
    conversation_id: Optional[str] = Field(default=None, description="Conversation ID for context")
    stream: bool = Field(default=False, description="Enable streaming response")
    
    @validator('conversation_id')
    def validate_conversation_id(cls, v):
        if v and not v.strip():
            return None
        return v

class AgentResponse(BaseModel):
    """Agent response model"""
    content: str = Field(..., description="Response content")
    agent_type: AgentType = Field(..., description="Agent that generated response")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Response metadata")
    suggested_questions: List[str] = Field(default_factory=list, description="Follow-up questions")
    conversation_id: Optional[str] = Field(default=None, description="Conversation ID")
    
    @validator('content')
    def validate_content_length(cls, v):
        if len(v) > 5000:
            return v[:5000] + "..."
        return v

class ChatResponse(BaseModel):
    """Standard chat response model"""
    success: bool = Field(default=True, description="Request success status")
    response: AgentResponse = Field(..., description="Agent response")
    processing_time: float = Field(..., description="Processing time in seconds")
    timestamp: datetime = Field(default_factory=datetime.now, description="Response timestamp")

class ConversationHistory(BaseModel):
    """Conversation history model"""
    conversation_id: str = Field(..., description="Conversation ID")
    messages: List[Dict[str, Any]] = Field(default_factory=list, description="Messages")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

class HealthResponse(BaseModel):
    """Health check response model"""
    status: str = Field(default="healthy", description="System status")
    version: str = Field(default="1.0.0", description="API version")
    agents: List[str] = Field(default_factory=list, description="Available agents")
    uptime: float = Field(..., description="System uptime in seconds")

class AgentStatus(BaseModel):
    """Agent status model"""
    agent_type: AgentType = Field(..., description="Agent type")
    status: str = Field(..., description="Status: active/thinking/idle")
    last_active: datetime = Field(..., description="Last active timestamp")
    requests_processed: int = Field(..., description="Total requests processed")