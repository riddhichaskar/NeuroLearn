from fastapi import FastAPI, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta, timezone
import asyncio
from typing import List, Optional
import threading
import time
import psutil
import torch
import uvicorn

from app.config import config
from app.models.schemas import NewsArticle, NewsResponse, HealthResponse
from app.services.news_scraper import scraper
from app.services.summarizer import summarizer
from app.services.sentiment_analyzer import sentiment_analyzer
from app.services.content_processor import content_processor
from app.utils.cache import cache

app = FastAPI(
    title=config.TITLE,
    description=config.DESCRIPTION,
    version=config.VERSION
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables with thread safety
current_articles_lock = threading.Lock()
top_articles_lock = threading.Lock()
last_fetch_time_lock = threading.Lock()

current_articles = []
top_articles = []
last_fetch_time = None
request_count = 0
start_time = time.time()
is_processing = False

def get_safe_articles():
    with current_articles_lock:
        return current_articles.copy()

def get_safe_top_articles():
    with top_articles_lock:
        return top_articles.copy()

def update_articles(new_articles, new_top_articles):
    global current_articles, top_articles, last_fetch_time
    with current_articles_lock:
        current_articles = new_articles
    with top_articles_lock:
        top_articles = new_top_articles
    with last_fetch_time_lock:
        last_fetch_time = datetime.now(timezone.utc)

async def fetch_and_process_news_batch():
    global is_processing
    
    if is_processing:
        print("⏳ Processing already in progress, skipping...")
        return
        
    is_processing = True
    start_processing = time.time()
    
    try:
        print("🔄 Starting developer news processing pipeline...")
        
        # Step 1: Scrape all sources with strict filtering
        scraped_articles = await scraper.scrape_all_sources()
        
        if not scraped_articles:
            print("❌ No developer articles found from scraping")
            return
        
        print(f"📝 Processing {len(scraped_articles)} developer articles...")
        
        # Step 2: Extract content for summarization
        contents = [article.get('content', article['title']) for article in scraped_articles]
        
        # Step 3: Parallel processing - summarization and article data preparation
        summarization_task = summarizer.summarize_batch(contents)
        
        # Prepare data for sentiment analysis
        articles_data = []
        for i, raw_article in enumerate(scraped_articles):
            category = content_processor.categorize_article(
                raw_article['title'],
                raw_article.get('tags', []),
                raw_article.get('content', '')
            )
            
            articles_data.append({
                'title': raw_article['title'],
                'summary': '',  # Will be filled after summarization
                'tags': raw_article.get('tags', []),
                'category': category,
                'raw_article': raw_article
            })
        
        # Wait for summarization
        summaries = await summarization_task
        
        # Update articles data with summaries
        for i, summary in enumerate(summaries):
            if i < len(articles_data):
                articles_data[i]['summary'] = summary
        
        # Step 4: Batch sentiment analysis
        analyses = await sentiment_analyzer.analyze_articles_batch(articles_data)
        
        # Step 5: Create final processed articles
        processed_articles = []
        
        for i, data in enumerate(articles_data):
            try:
                raw_article = data['raw_article']
                analysis = analyses[i] if i < len(analyses) else {
                    "sentiment": "neutral",
                    "impact": "low"
                }
                
                engagement_score = content_processor.calculate_engagement_score(
                    raw_article['title'],
                    data['summary'],
                    analysis['impact'],
                    analysis['sentiment'],
                    raw_article['published_at']
                )
                
                # Ensure datetime is timezone-aware
                published_at = raw_article['published_at']
                if published_at.tzinfo is None:
                    published_at = published_at.replace(tzinfo=timezone.utc)
                
                # Create processed article
                processed_article = NewsArticle(
                    id=raw_article['id'],
                    title=raw_article['title'],
                    summary=data['summary'],
                    source=content_processor.get_source_display_name(raw_article['source']),
                    url=raw_article['url'],
                    published_at=published_at,
                    sentiment=analysis['sentiment'],
                    impact=analysis['impact'],
                    tags=raw_article.get('tags', []),
                    reading_time=content_processor.estimate_reading_time(
                        f"{raw_article['title']} {data['summary']}"
                    ),
                    content_preview=content_processor.extract_content_preview(
                        raw_article.get('content', '')[:250]
                    ),
                    source_icon=content_processor.get_source_icon(raw_article['source']),
                    category=data['category'],
                    engagement_score=engagement_score
                )
                
                processed_articles.append(processed_article)
                
            except Exception as e:
                print(f"⚠️ Error processing article {i}: {e}")
                continue
        
        # Step 6: Sort and select top articles
        processed_articles.sort(key=lambda x: x.engagement_score or 0, reverse=True)
        new_top_articles = processed_articles[:config.TOP_NEWS_COUNT]
        
        # Step 7: Update global state
        update_articles(processed_articles, new_top_articles)
        
        processing_time = time.time() - start_processing
        print(f"✅ Successfully processed {len(processed_articles)} developer articles in {processing_time:.2f}s")
        
        # Step 8: Cache results
        await cache.set('news_articles', {
            'articles': [article.dict() for article in processed_articles],
            'top_articles': [article.dict() for article in new_top_articles],
            'last_updated': datetime.now(timezone.utc)
        })
        
    except Exception as e:
        print(f"❌ Error in news processing pipeline: {e}")
    finally:
        is_processing = False

@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    print(f"""
    🚀 Starting {config.TITLE}
    📊 Version: {config.VERSION}
    💻 Device: {config.DEVICE.upper()}
    🎯 GPU Available: {config.USE_GPU}
    """)
    
    if config.USE_GPU:
        gpu_props = torch.cuda.get_device_properties(0)
        print(f"    GPU Memory: {gpu_props.total_memory / 1e9:.1f} GB")
        print(f"    GPU Name: {gpu_props.name}")
    
    print(f"    Sources: {', '.join([content_processor.get_source_display_name(source) for source in config.NEWS_SOURCES.keys()])}")
    print("    " + "="*50)
    
    # Initial news processing in background
    asyncio.create_task(fetch_and_process_news_batch())

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    await scraper.close_session()

@app.get("/")
async def root():
    """Root endpoint with system information"""
    global request_count
    request_count += 1
    
    # System metrics
    memory_usage = psutil.Process().memory_info().rss / 1024 / 1024
    gpu_info = ""
    
    if config.USE_GPU:
        gpu_memory = torch.cuda.memory_allocated() / 1e9
        gpu_reserved = torch.cuda.memory_reserved() / 1e9
        gpu_info = f" | GPU: {gpu_memory:.1f}/{gpu_reserved:.1f} GB"
    
    articles = get_safe_articles()
    sources = list(set(article.source for article in articles))
    
    return {
        "message": "Developer News Hub - FREE Edition",
        "version": config.VERSION,
        "status": {
            "articles_available": len(articles),
            "sources_active": len(sources),
            "total_requests": request_count,
            "memory_usage": f"{memory_usage:.1f} MB{gpu_info}",
            "last_updated": last_fetch_time.isoformat() if last_fetch_time else None
        },
        "features": {
            "sources": [content_processor.get_source_display_name(source) for source in config.NEWS_SOURCES.keys()],
            "ai_enabled": config.ENABLE_SUMMARIZATION and config.ENABLE_SENTIMENT_ANALYSIS,
            "gpu_accelerated": config.USE_GPU,
            "cache_duration": f"{config.CACHE_DURATION_MINUTES} minutes"
        }
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    articles = get_safe_articles()
    sources = list(set(article.source for article in articles))
    
    # System health metrics
    cpu_percent = psutil.cpu_percent()
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    gpu_health = {}
    if config.USE_GPU:
        gpu_health = {
            "gpu_memory_allocated": f"{torch.cuda.memory_allocated() / 1e9:.2f} GB",
            "gpu_memory_cached": f"{torch.cuda.memory_reserved() / 1e9:.2f} GB",
            "gpu_utilization": "Active" if torch.cuda.is_available() else "Inactive"
        }
    
    return HealthResponse(
        status="healthy" if len(articles) > 0 else "degraded",
        last_updated=last_fetch_time or datetime.now(timezone.utc),
        article_count=len(articles),
        top_news_count=len(get_safe_top_articles()),
        sources_available=sources,
        system_metrics={
            "cpu_usage": f"{cpu_percent}%",
            "memory_usage": f"{memory.percent}%",
            "disk_usage": f"{disk.percent}%",
            **gpu_health
        }
    )

@app.get("/api/news", response_model=NewsResponse)
async def get_news(
    background_tasks: BackgroundTasks,
    source: Optional[str] = Query(None, description="Filter by source"),
    sentiment: Optional[str] = Query(None, description="Filter by sentiment"),
    impact: Optional[str] = Query(None, description="Filter by impact level"),
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(50, ge=1, le=100, description="Number of articles to return")
):
    """
    Get developer-focused news with AI-powered summarization
    
    - **source**: Filter by source (hackernews, devto, github_trending, reddit_programming, techcrunch, lobsters)
    - **sentiment**: Filter by sentiment (positive, negative, neutral)
    - **impact**: Filter by impact level (high, medium, low)
    - **category**: Filter by category
    - **limit**: Number of articles to return (default: 50, max: 100)
    """
    try:
        articles = get_safe_articles()
        top_news = get_safe_top_articles()
        
        # Trigger background refresh if data is stale
        current_time = datetime.now(timezone.utc)
        if (not last_fetch_time or 
            current_time - last_fetch_time > timedelta(minutes=config.CACHE_DURATION_MINUTES)):
            background_tasks.add_task(fetch_and_process_news_batch)
        
        # Apply filters
        filtered_articles = articles
        
        if source:
            source_lower = source.lower()
            filtered_articles = [
                a for a in filtered_articles 
                if source_lower in a.source.lower() or 
                   source_lower in content_processor.get_source_display_name(a.source).lower()
            ]
        
        if sentiment:
            filtered_articles = [a for a in filtered_articles if a.sentiment.value == sentiment.lower()]
        
        if impact:
            filtered_articles = [a for a in filtered_articles if a.impact.value == impact.lower()]
        
        if category:
            filtered_articles = [a for a in filtered_articles if a.category and category.lower() in a.category.lower()]
        
        # Apply limit and ensure we have articles
        filtered_articles = filtered_articles[:limit] if filtered_articles else []
        
        sources = list(set(article.source for article in filtered_articles))
        categories = list(set(article.category for article in filtered_articles if article.category))
        
        return NewsResponse(
            articles=filtered_articles,
            top_news=top_news[:limit],
            total_count=len(filtered_articles),
            last_updated=last_fetch_time or current_time,
            sources=sources,
            categories=categories
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching news: {str(e)}")

@app.get("/api/news/top", response_model=NewsResponse)
async def get_top_news(
    limit: int = Query(10, ge=1, le=20, description="Number of top articles to return")
):
    """Get top ranked developer news based on engagement score"""
    try:
        top_news = get_safe_top_articles()
        limited_top_news = top_news[:limit]
        sources = list(set(article.source for article in limited_top_news))
        categories = list(set(article.category for article in limited_top_news if article.category))
        
        return NewsResponse(
            articles=limited_top_news,
            top_news=limited_top_news,
            total_count=len(limited_top_news),
            last_updated=last_fetch_time or datetime.now(timezone.utc),
            sources=sources,
            categories=categories
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching top news: {str(e)}")

@app.post("/api/news/refresh")
async def refresh_news(background_tasks: BackgroundTasks):
    """Manually trigger news refresh"""
    background_tasks.add_task(fetch_and_process_news_batch)
    return {
        "message": "Developer news refresh triggered in background",
        "status": "processing",
        "estimated_time": "20-40 seconds"
    }

@app.get("/api/news/sources")
async def get_available_sources():
    """Get list of available news sources with counts"""
    articles = get_safe_articles()
    source_counts = {}
    
    for article in articles:
        source_counts[article.source] = source_counts.get(article.source, 0) + 1
    
    sources = [
        {
            "name": content_processor.get_source_display_name(source),
            "key": source,
            "icon": content_processor.get_source_icon(source),
            "article_count": count
        }
        for source, count in source_counts.items()
    ]
    
    return {"sources": sources}

@app.get("/api/news/categories")
async def get_available_categories():
    """Get list of available categories with counts"""
    articles = get_safe_articles()
    category_counts = {}
    
    for article in articles:
        if article.category:
            category_counts[article.category] = category_counts.get(article.category, 0) + 1
    
    return {"categories": category_counts}

@app.get("/api/performance")
async def get_performance_stats():
    """Get detailed performance statistics"""
    process = psutil.Process()
    system_info = {
        "cpu": {
            "percent": psutil.cpu_percent(),
            "cores": psutil.cpu_count()
        },
        "memory": {
            "percent": psutil.virtual_memory().percent,
            "used_gb": psutil.virtual_memory().used / 1e9,
            "total_gb": psutil.virtual_memory().total / 1e9
        },
        "disk": {
            "percent": psutil.disk_usage('/').percent
        }
    }
    
    gpu_info = {}
    if config.USE_GPU:
        gpu_info = {
            "name": torch.cuda.get_device_name(0),
            "memory_allocated_gb": torch.cuda.memory_allocated() / 1e9,
            "memory_reserved_gb": torch.cuda.memory_reserved() / 1e9,
            "is_available": torch.cuda.is_available()
        }
    
    articles = get_safe_articles()
    uptime = time.time() - start_time
    
    return {
        "application": {
            "uptime_seconds": uptime,
            "requests_served": request_count,
            "articles_cached": len(articles),
            "sources_active": len(set(article.source for article in articles)),
            "processing": is_processing
        },
        "system": system_info,
        "gpu": gpu_info,
        "models": {
            "summarization_loaded": summarizer.model_loaded,
            "sentiment_loaded": sentiment_analyzer.model_loaded,
            "gpu_accelerated": config.USE_GPU
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )