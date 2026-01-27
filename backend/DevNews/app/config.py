import os
import torch
from typing import Set, Dict, List
from datetime import timedelta

class Config:

    TITLE = "🚀 Developer News Hub - FREE Edition"
    DESCRIPTION = "Real-time developer news with AI-powered summarization - 100% Free"
    VERSION = "8.1.0"
    

    USE_GPU = torch.cuda.is_available()
    DEVICE = "cuda" if USE_GPU else "cpu"
    
 
    NEWS_SOURCES: Dict[str, Dict] = {
        "hackernews": {
            "url": "https://news.ycombinator.com/newest",
            "type": "html",
            "enabled": True,
            "priority": 1
        },
        "devto": {
            "url": "https://dev.to/api/articles/latest",
            "type": "api", 
            "enabled": True,
            "priority": 1
        },
        "github_trending": {
            "url": "https://github.com/trending",
            "type": "html",
            "enabled": True,
            "priority": 2
        },
        "reddit_programming": {
            "url": "https://www.reddit.com/r/programming/new/.rss",
            "type": "rss",
            "enabled": True,
            "priority": 1
        },
        "techcrunch": {
            "url": "https://techcrunch.com/feed/",
            "type": "rss",
            "enabled": True,
            "priority": 2
        },
        "lobsters": {
            "url": "https://lobste.rs/newest",
            "type": "html",
            "enabled": True,
            "priority": 2
        }
    }
    
 
    DEVELOPER_KEYWORDS: Set[str] = {
        
        'python', 'javascript', 'java', 'typescript', 'go', 'rust', 'c++', 'c#', 'php', 'ruby',
        'swift', 'kotlin', 'scala', 'dart', 'r', 'matlab', 'html', 'css', 'sql',
        
        
        'react', 'angular', 'vue', 'django', 'flask', 'spring', 'laravel', 'express', 'fastapi',
        'node.js', 'nodejs', 'tensorflow', 'pytorch', 'keras', 'pandas', 'numpy', 'nextjs', 'nuxt',
        'svelte', 'ember', 'backbone', 'jquery', 'bootstrap', 'tailwind',
        
        
        'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'cloud', 'machine learning', 'ai',
        'artificial intelligence', 'devops', 'cybersecurity', 'blockchain', 'web3',
        'api', 'microservices', 'database', 'nosql', 'mongodb', 'postgresql', 'mysql',
        'redis', 'elasticsearch', 'graphql', 'rest', 'websocket', 'grpc',
        
       
        'programming', 'coding', 'development', 'software', 'engineer', 'developer',
        'backend', 'frontend', 'fullstack', 'mobile', 'web', 'app', 'ios', 'android',
        'job', 'career', 'hire', 'hiring', 'recruitment', 'interview', 'resume', 'salary',
        'vacancy', 'position', 'opening', 'remote job', 'tech job', 'developer job',
        'startup', 'tech', 'technology', 'opensource', 'open source', 'github', 'gitlab',
        
        
        'git', 'github', 'gitlab', 'agile', 'scrum', 'ci/cd', 'testing', 'debug',
        'vscode', 'pycharm', 'intellij', 'vim', 'emacs', 'terminal', 'command line',
        'jenkins', 'travis', 'github actions', 'gitlab ci', 'devops',
        
      
        'mern stack', 'mean stack', 'jamstack', 'serverless', 'microservices',
        'monolith', 'architecture', 'system design', 'clean code', 'refactoring',
        
        
        'tutorial', 'guide', 'best practices', 'code review', 'pair programming',
        'trending', 'new technology', 'framework update', 'library release',

        'microsoft', 'google', 'apple', 'amazon', 'meta', 'netflix', 'twitter', 'x',
        'openai', 'anthropic', 'github', 'gitlab', 'docker', 'hashicorp'
    }

    EXCLUDE_KEYWORDS: Set[str] = {
        'شماره خاله', '09389632898', 'سکس', 'فحش', 'porn', 'adult', 'spam', 'casino', 'gambling',
        'bitcoin', 'crypto', 'forex', 'investment', 'money', 'profit', 'finance', 'stock',
        'politics', 'sports', 'entertainment', 'celebrity', 'movie', 'music', 'gaming',
        'health', 'fitness', 'food', 'travel', 'lifestyle', 'fashion', 'beauty',
        'real estate', 'insurance', 'loan', 'mortgage', 'trading'
    }
    

    SENTIMENT_MODEL = "cardiffnlp/twitter-roberta-base-sentiment-latest"
    SUMMARIZATION_MODEL = "facebook/bart-large-cnn"
    

    CACHE_DURATION_MINUTES = 5
    MAX_ARTICLES_PER_SOURCE = 25
    TOP_NEWS_COUNT = 15
    MAX_ARTICLE_AGE_HOURS = 24
    

    BATCH_SIZE = 8 if USE_GPU else 4
    MODEL_MAX_LENGTH = 512
    SUMMARIZATION_MAX_LENGTH = 120
    SUMMARIZATION_MIN_LENGTH = 40
    

    REQUEST_TIMEOUT = 15
    MAX_CONCURRENT_REQUESTS = 15
    RATE_LIMIT_DELAY = 0.2
    

    ENABLE_SUMMARIZATION = True
    ENABLE_SENTIMENT_ANALYSIS = True
    ENABLE_IMAGE_GENERATION = True  
    ENABLE_GEMINI_ENHANCED_SUMMARIES = False
    ENABLE_CONTENT_CLEANING = True
    

    ENABLE_TRENDING_ANALYSIS = True
    ENABLE_TECH_STACK_EXTRACTION = True
    ENABLE_READING_DIFFICULTY = True

config = Config()