from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class Sentiment(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"

class ImpactLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class NewsArticle(BaseModel):
    id: str
    title: str
    summary: str
    source: str
    url: str
    published_at: datetime
    sentiment: Sentiment
    impact: ImpactLevel
    tags: List[str]
    reading_time: int
    content_preview: Optional[str] = None
    source_icon: Optional[str] = None
    category: Optional[str] = None
    engagement_score: Optional[float] = None
    # generated_image: Optional[str] = None  # Base64 encoded image

class NewsResponse(BaseModel):
    articles: List[NewsArticle]
    top_news: List[NewsArticle]
    total_count: int
    last_updated: datetime
    sources: List[str]
    categories: List[str]

class HealthResponse(BaseModel):
    status: str
    last_updated: datetime
    article_count: int
    top_news_count: int
    sources_available: List[str]
    system_metrics: Optional[Dict[str, Any]] = None