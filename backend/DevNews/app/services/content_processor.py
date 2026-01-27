import re
import html
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import hashlib
from urllib.parse import urlparse
from app.config import config

class ContentProcessor:
    
    @staticmethod
    def clean_text(text: str) -> str:
        """Comprehensive text cleaning"""
        if not text:
            return ""
        
        # Decode HTML entities
        text = html.unescape(text)
        
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        
        # Remove URLs
        text = re.sub(r'http\S+', '', text)
        
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s.,!?@#$%&*()\-+=:;/]', '', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    @staticmethod
    def extract_content_preview(text: str, max_length: int = 150) -> str:
        """Extract clean preview"""
        cleaned = ContentProcessor.clean_text(text)
        if len(cleaned) > max_length:
            return cleaned[:max_length].rsplit(' ', 1)[0] + "..."
        return cleaned
    
    @staticmethod
    def estimate_reading_time(text: str) -> int:
        """Estimate reading time in minutes"""
        words = len(text.split())
        return max(1, words // 200)
    
    @staticmethod
    def generate_id(title: str, source: str) -> str:
        """Generate unique ID for article"""
        unique_string = f"{title}_{source}_{datetime.now().timestamp()}"
        return hashlib.md5(unique_string.encode()).hexdigest()[:12]
    
    @staticmethod
    def get_source_display_name(source: str) -> str:
        """Get clean source display name"""
        source_names = {
            "hackernews": "Hacker News",
            "devto": "Dev.to", 
            "github_trending": "GitHub Trending",
            "reddit_programming": "Reddit Programming",
            "techcrunch": "TechCrunch",
            "lobsters": "Lobsters"
        }
        return source_names.get(source, source)
    
    @staticmethod
    def get_source_icon(source: str) -> str:
        """Get source icon/emoji"""
        icons = {
            "hackernews": "🟠",
            "devto": "🔷", 
            "github_trending": "🐙",
            "reddit_programming": "📱",
            "techcrunch": "💼",
            "lobsters": "🦞"
        }
        return icons.get(source, "📰")
    
    @staticmethod
    def is_developer_content(title: str, content: str, tags: List[str]) -> bool:
        """Strict check if content is developer-related"""
        text = f"{title} {' '.join(tags)} {content}".lower()
        
        # First, exclude non-developer content
        if any(exclude in text for exclude in config.EXCLUDE_KEYWORDS):
            return False
        
        # Then, check for developer keywords with context
        developer_keywords_found = 0
        
        for keyword in config.DEVELOPER_KEYWORDS:
            if keyword in text:
                # Check context around the keyword
                keyword_index = text.find(keyword)
                context_start = max(0, keyword_index - 20)
                context_end = min(len(text), keyword_index + len(keyword) + 20)
                context = text[context_start:context_end]
                
                # Count valid occurrences
                if any(tech in context for tech in ['development', 'programming', 'code', 'software', 'engineer', 'developer']):
                    developer_keywords_found += 1
                
                if developer_keywords_found >= 2:  # Require multiple relevant keywords
                    return True
        
        return False
    
    @staticmethod
    def categorize_article(title: str, tags: List[str], content: str) -> str:
        """Categorize article based on developer content"""
        text = f"{title} {' '.join(tags)} {content}".lower()
        
        categories = {
            "AI & Machine Learning": ["ai", "artificial intelligence", "machine learning", "neural", "llm", "gpt", "deep learning", "tensorflow", "pytorch"],
            "Web Development": ["web development", "react", "angular", "vue", "javascript", "css", "html", "frontend", "browser", "nextjs", "nuxt"],
            "Backend & DevOps": ["backend", "server", "api", "database", "docker", "kubernetes", "devops", "cloud", "microservices", "aws", "azure", "gcp"],
            "Mobile Development": ["mobile", "ios", "android", "flutter", "react native", "swift", "kotlin", "mobile app"],
            "Programming Languages": ["python", "javascript", "java", "typescript", "go", "rust", "c++", "php", "ruby", "programming language"],
            "Career & Jobs": ["job", "career", "hire", "hiring", "interview", "salary", "resume", "recruitment", "vacancy", "position", "remote job"],
            "Tools & Productivity": ["tool", "productivity", "vscode", "git", "terminal", "workflow", "automation", "ide", "debug"],
            "Open Source": ["open source", "opensource", "github", "gitlab", "contribute", "repository", "pull request"],
            "Security": ["security", "cybersecurity", "vulnerability", "hack", "encryption", "privacy", "secure coding"],
            "Startups & Business": ["startup", "business", "funding", "vc", "investment", "entrepreneur", "tech business"],
            "Data Science": ["data", "analytics", "big data", "data science", "visualization", "pandas", "numpy"],
            "Cloud & Infrastructure": ["cloud", "aws", "azure", "gcp", "infrastructure", "serverless", "scalability"]
        }
        
        for category, keywords in categories.items():
            if any(keyword in text for keyword in keywords):
                return category
        
        return "Developer Tools"
    
    @staticmethod
    def calculate_engagement_score(title: str, summary: str, impact: str, sentiment: str, published_at: datetime) -> float:
        """Calculate engagement score for ranking"""
        score = 0.0
        
        # Impact weighting
        impact_weights = {"high": 1.0, "medium": 0.7, "low": 0.3}
        score += impact_weights.get(impact, 0.5)
        
        # Sentiment weighting
        if sentiment == "positive":
            score += 0.2
        elif sentiment == "negative":
            score += 0.1
        
        # Recency bonus (articles from last 2 hours get bonus)
        time_diff = datetime.now(timezone.utc) - published_at
        if time_diff.total_seconds() < 7200:  # 2 hours
            score += 0.3
        elif time_diff.total_seconds() < 43200:  # 12 hours
            score += 0.1
        
        # Title length optimization
        title_words = len(title.split())
        if 8 <= title_words <= 15:
            score += 0.2
        
        # Summary quality
        summary_words = len(summary.split())
        if 25 <= summary_words <= 80:
            score += 0.2
        
        return min(1.0, score)
    
    @staticmethod
    def validate_url(url: str) -> bool:
        """Validate URL format"""
        try:
            result = urlparse(url)
            return all([result.scheme, result.netloc])
        except:
            return False

content_processor = ContentProcessor()