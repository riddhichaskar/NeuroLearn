import aiohttp
import asyncio
from bs4 import BeautifulSoup
import feedparser
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, timezone
import re
import json
from asyncio_throttle import Throttler
from app.config import config
from app.services.content_processor import content_processor

class NewsScraper:
    def __init__(self):
        self.throttler = Throttler(rate_limit=config.MAX_CONCURRENT_REQUESTS, period=1)
        self.session = None
        self.user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    
    async def get_session(self) -> aiohttp.ClientSession:
        if self.session is None or self.session.closed:
            timeout = aiohttp.ClientTimeout(total=config.REQUEST_TIMEOUT)
            self.session = aiohttp.ClientSession(
                timeout=timeout,
                headers={'User-Agent': self.user_agent}
            )
        return self.session
    
    async def close_session(self):
        if self.session and not self.session.closed:
            await self.session.close()
    
    def get_utc_now(self) -> datetime:
        return datetime.now(timezone.utc)
    
    def is_recent_article(self, published_at: datetime) -> bool:
        now = self.get_utc_now()
        if published_at.tzinfo is None:
            published_at = published_at.replace(tzinfo=timezone.utc)
        time_diff = now - published_at
        return time_diff <= timedelta(hours=config.MAX_ARTICLE_AGE_HOURS)
    
    async def scrape_hacker_news(self) -> List[Dict[str, Any]]:
        """Scrape Hacker News newest stories"""
        articles = []
        try:
            async with self.throttler:
                session = await self.get_session()
                async with session.get(config.NEWS_SOURCES["hackernews"]["url"]) as response:
                    if response.status == 200:
                        html = await response.text()
                    else:
                        return articles
            
            soup = BeautifulSoup(html, 'html.parser')
            rows = soup.find_all('tr', class_='athing')
            
            for i, row in enumerate(rows[:config.MAX_ARTICLES_PER_SOURCE]):
                try:
                    title_link = row.find('a', class_='titlelink')
                    if not title_link:
                        continue
                    
                    title = content_processor.clean_text(title_link.get_text().strip())
                    url = title_link.get('href', '')
                    
                    # Fix relative URLs
                    if url.startswith('item?'):
                        url = f"https://news.ycombinator.com/{url}"
                    elif not url.startswith('http'):
                        url = f"https://news.ycombinator.com/from?site={url.split('/')[0]}"
                    
                    if not content_processor.validate_url(url):
                        continue
                    
                    # Strict developer content filtering
                    if content_processor.is_developer_content(title, title, ['programming', 'technology']):
                        article = {
                            'id': content_processor.generate_id(title, 'hackernews'),
                            'title': title,
                            'url': url,
                            'source': 'hackernews',
                            'published_at': self.get_utc_now() - timedelta(minutes=i * 10),
                            'tags': ['programming', 'technology', 'startups'],
                            'content': title,
                            'score': i
                        }
                        articles.append(article)
                        
                except Exception as e:
                    continue
                    
        except Exception as e:
            print(f"❌ Hacker News scraping error: {e}")
        
        return articles
    
    async def scrape_dev_to(self) -> List[Dict[str, Any]]:
        """Scrape Dev.to latest articles"""
        articles = []
        try:
            async with self.throttler:
                session = await self.get_session()
                async with session.get(config.NEWS_SOURCES["devto"]["url"] + "?per_page=30") as response:
                    if response.status == 200:
                        data = await response.json()
                    else:
                        return articles
            
            for item in data[:config.MAX_ARTICLES_PER_SOURCE]:
                try:
                    title = content_processor.clean_text(item.get('title', '').strip())
                    description = item.get('description') or item.get('body_markdown', '')[:400] or title
                    description = content_processor.clean_text(description)
                    
                    # Parse published date
                    published_at = self.get_utc_now()
                    if item.get('published_at'):
                        try:
                            published_at = datetime.fromisoformat(
                                item['published_at'].replace('Z', '+00:00')
                            ).replace(tzinfo=timezone.utc)
                        except:
                            published_at = self.get_utc_now()
                    
                    tags = [tag.lower() for tag in item.get('tag_list', [])]
                    
                    # Strict developer content filtering
                    if content_processor.is_developer_content(title, description, tags):
                        article = {
                            'id': content_processor.generate_id(title, 'devto'),
                            'title': title,
                            'url': item.get('url', ''),
                            'source': 'devto',
                            'published_at': published_at,
                            'tags': tags,
                            'content': description,
                            'reactions': item.get('positive_reactions_count', 0)
                        }
                        articles.append(article)
                        
                except Exception as e:
                    continue
                    
        except Exception as e:
            print(f"❌ Dev.to scraping error: {e}")
        
        return articles
    
    async def scrape_github_trending(self) -> List[Dict[str, Any]]:
        """Scrape GitHub trending repositories"""
        articles = []
        try:
            async with self.throttler:
                session = await self.get_session()
                async with session.get(config.NEWS_SOURCES["github_trending"]["url"]) as response:
                    if response.status == 200:
                        html = await response.text()
                    else:
                        return articles
            
            soup = BeautifulSoup(html, 'html.parser')
            repos = soup.find_all('article', class_='Box-row')
            
            for repo in repos[:config.MAX_ARTICLES_PER_SOURCE]:
                try:
                    title_elem = repo.find('h2', class_='h3')
                    if not title_elem:
                        continue
                    
                    title = content_processor.clean_text(title_elem.get_text().strip())
                    description_elem = repo.find('p', class_='col-9')
                    description = description_elem.get_text().strip() if description_elem else "Trending repository"
                    description = content_processor.clean_text(description)
                    
                    # Get repository URL
                    repo_link = title_elem.find('a')
                    if repo_link:
                        repo_path = repo_link.get('href', '')
                        url = f"https://github.com{repo_path}"
                    else:
                        continue
                    
                    # Get programming language
                    lang_elem = repo.find('span', itemprop='programmingLanguage')
                    language = lang_elem.get_text().strip() if lang_elem else "Unknown"
                    
                    tags = ['open-source', 'github', 'trending', 'programming', language.lower()]
                    
                    # Always include GitHub trending as it's developer-focused
                    article = {
                        'id': content_processor.generate_id(title, 'github_trending'),
                        'title': f"GitHub Trending: {title}",
                        'url': url,
                        'source': 'github_trending',
                        'published_at': self.get_utc_now(),
                        'tags': tags,
                        'content': description,
                    }
                    articles.append(article)
                        
                except Exception as e:
                    continue
                    
        except Exception as e:
            print(f"❌ GitHub Trending scraping error: {e}")
        
        return articles
    
    async def scrape_reddit_programming(self) -> List[Dict[str, Any]]:
        """Scrape Reddit Programming newest posts"""
        articles = []
        try:
            feed = feedparser.parse(config.NEWS_SOURCES["reddit_programming"]["url"])
            
            for entry in feed.entries[:config.MAX_ARTICLES_PER_SOURCE]:
                try:
                    title = content_processor.clean_text(entry.title.strip())
                    summary = entry.get('summary', '') or entry.get('description', '') or title
                    summary = content_processor.clean_text(summary)
                    
                    # Parse published date
                    published_at = self.get_utc_now()
                    if hasattr(entry, 'published_parsed'):
                        try:
                            published_at = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
                        except:
                            published_at = self.get_utc_now()
                    
                    # Strict developer content filtering for Reddit
                    if content_processor.is_developer_content(title, summary, ['programming', 'development']):
                        article = {
                            'id': content_processor.generate_id(title, 'reddit_programming'),
                            'title': title,
                            'url': entry.link,
                            'source': 'reddit_programming',
                            'published_at': published_at,
                            'tags': ['programming', 'reddit', 'development', 'discussion'],
                            'content': content_processor.extract_content_preview(summary, 300)
                        }
                        articles.append(article)
                        
                except Exception as e:
                    continue
                    
        except Exception as e:
            print(f"❌ Reddit Programming scraping error: {e}")
        
        return articles
    
    async def scrape_techcrunch(self) -> List[Dict[str, Any]]:
        """Scrape TechCrunch latest articles with strict filtering"""
        articles = []
        try:
            feed = feedparser.parse(config.NEWS_SOURCES["techcrunch"]["url"])
            
            for entry in feed.entries[:config.MAX_ARTICLES_PER_SOURCE]:
                try:
                    title = content_processor.clean_text(entry.title.strip())
                    summary = entry.get('summary', '') or entry.get('description', '') or title
                    summary = content_processor.clean_text(summary)
                    
                    # Parse published date
                    published_at = self.get_utc_now()
                    if hasattr(entry, 'published_parsed'):
                        try:
                            published_at = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
                        except:
                            published_at = self.get_utc_now()
                    
                    # Strict filtering for developer-relevant TechCrunch articles
                    if content_processor.is_developer_content(title, summary, ['technology', 'startups']):
                        article = {
                            'id': content_processor.generate_id(title, 'techcrunch'),
                            'title': title,
                            'url': entry.link,
                            'source': 'techcrunch',
                            'published_at': published_at,
                            'tags': ['technology', 'startups', 'business', 'innovation'],
                            'content': content_processor.extract_content_preview(summary, 350)
                        }
                        articles.append(article)
                        
                except Exception as e:
                    continue
                    
        except Exception as e:
            print(f"❌ TechCrunch scraping error: {e}")
        
        return articles
    
    async def scrape_lobsters(self) -> List[Dict[str, Any]]:
        """Scrape Lobsters newest stories"""
        articles = []
        try:
            async with self.throttler:
                session = await self.get_session()
                async with session.get(config.NEWS_SOURCES["lobsters"]["url"]) as response:
                    if response.status == 200:
                        html = await response.text()
                    else:
                        return articles
            
            soup = BeautifulSoup(html, 'html.parser')
            story_links = soup.find_all('a', class_='u-url')
            
            for i, link in enumerate(story_links[:config.MAX_ARTICLES_PER_SOURCE]):
                try:
                    title = content_processor.clean_text(link.get_text().strip())
                    url = link.get('href', '')
                    
                    if not url.startswith('http'):
                        continue
                    
                    if not content_processor.validate_url(url):
                        continue
                    
                    # Lobsters is already developer-focused, but apply strict filtering
                    if content_processor.is_developer_content(title, title, ['programming', 'technology']):
                        article = {
                            'id': content_processor.generate_id(title, 'lobsters'),
                            'title': title,
                            'url': url,
                            'source': 'lobsters',
                            'published_at': self.get_utc_now() - timedelta(minutes=i * 15),
                            'tags': ['programming', 'technology', 'news', 'discussion'],
                            'content': title
                        }
                        articles.append(article)
                        
                except Exception as e:
                    continue
                    
        except Exception as e:
            print(f"❌ Lobsters scraping error: {e}")
        
        return articles
    
    async def scrape_all_sources(self) -> List[Dict[str, Any]]:
        """Scrape all enabled news sources concurrently with strict filtering"""
        scraping_tasks = []
        
        for source_name, source_config in config.NEWS_SOURCES.items():
            if source_config.get('enabled', True):
                if source_name == "hackernews":
                    scraping_tasks.append(self.scrape_hacker_news())
                elif source_name == "devto":
                    scraping_tasks.append(self.scrape_dev_to())
                elif source_name == "github_trending":
                    scraping_tasks.append(self.scrape_github_trending())
                elif source_name == "reddit_programming":
                    scraping_tasks.append(self.scrape_reddit_programming())
                elif source_name == "techcrunch":
                    scraping_tasks.append(self.scrape_techcrunch())
                elif source_name == "lobsters":
                    scraping_tasks.append(self.scrape_lobsters())
        
        results = await asyncio.gather(*scraping_tasks, return_exceptions=True)
        
        all_articles = []
        source_counts = {}
        
        for result in results:
            if isinstance(result, list):
                all_articles.extend(result)
        
        # Filter only recent articles and remove duplicates
        recent_articles = []
        seen_titles = set()
        
        for article in all_articles:
            if (self.is_recent_article(article['published_at']) and 
                article['title'].lower() not in seen_titles):
                
                seen_titles.add(article['title'].lower())
                recent_articles.append(article)
                
                # Count articles per source
                source = article['source']
                source_counts[source] = source_counts.get(source, 0) + 1
        
        # Print scraping statistics
        print(f"📊 Scraping Results (Developer-Focused):")
        for source, count in source_counts.items():
            print(f"   {content_processor.get_source_display_name(source)}: {count} articles")
        print(f"   Total Developer Articles: {len(recent_articles)}")
        
        return recent_articles

# Global scraper instance
scraper = NewsScraper()