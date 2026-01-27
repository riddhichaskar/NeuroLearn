import json
import sqlite3
import aiofiles
import asyncio
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
import os
from loguru import logger
import hashlib

from .config import config
from .models import UserRole

class KnowledgeBase:
    """Local knowledge base with keyword-based search (no external dependencies)"""
    
    def __init__(self):
        self.memory_db = None
        self.data_loaded = False
        
        # Data storage
        self.devnews_data = []
        self.github_data = []
        self.trends_data = []
        
        # Initialize in async context
        self._init_task = None
        
    async def initialize(self):
        """Initialize knowledge base asynchronously"""
        if self._init_task is None:
            self._init_task = asyncio.create_task(self._async_init())
        await self._init_task
    
    async def _async_init(self):
        """Async initialization"""
        try:
            # Create data directory
            os.makedirs('data', exist_ok=True)
            
            # Load sample data
            await self._load_sample_data()
            
            # Initialize SQLite database
            self._init_database()
            
            self.data_loaded = True
            logger.success("Knowledge base initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize knowledge base: {e}")
            # Still initialize database even if data loading fails
            try:
                self._init_database()
            except:
                pass
    
    def _init_database(self):
        """Initialize SQLite database"""
        self.memory_db = sqlite3.connect(
            config.MEMORY['db_path'],
            check_same_thread=False,
            timeout=10
        )
        cursor = self.memory_db.cursor()
        
        # Create conversations table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS conversations (
                id TEXT PRIMARY KEY,
                user_role TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                message_count INTEGER DEFAULT 0
            )
        ''')
        
        # Create messages table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                conversation_id TEXT,
                content TEXT,
                role TEXT CHECK(role IN ('user', 'assistant')),
                agent_type TEXT,
                confidence REAL,
                metadata TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
            )
        ''')
        
        # Create indexes
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_messages_conversation 
            ON messages(conversation_id, created_at)
        ''')
        
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_conversations_updated 
            ON conversations(updated_at)
        ''')
        
        self.memory_db.commit()
        logger.info("Database initialized")
    
    async def _load_sample_data(self):
        """Load comprehensive sample knowledge data"""
        
        # DevNews sample data
        self.devnews_data = [
            {
                "id": "dn1",
                "title": "AI Agents Gaining Traction in Production",
                "content": "Developers are increasingly adopting AI agents for automated workflows. Tools like LangChain and CrewAI seeing 300% growth in adoption rates across industries.",
                "category": "AI/ML",
                "date": "2024-01-20",
                "impact_score": 0.9,
                "tags": ["ai", "automation", "workflow", "agents", "llm"],
                "source": "TechCrunch"
            },
            {
                "id": "dn2",
                "title": "Rust Adoption Surges in Systems Programming",
                "content": "Rust usage grows 40% year-over-year, especially in web assembly, embedded systems, and infrastructure tools. Companies like Microsoft and Google adopting Rust for memory safety.",
                "category": "Programming Languages",
                "date": "2024-01-19",
                "impact_score": 0.8,
                "tags": ["rust", "systems", "performance", "memory-safety", "webassembly"],
                "source": "InfoQ"
            },
            {
                "id": "dn3",
                "title": "Python 3.12 Performance Improvements Released",
                "content": "Python 3.12 shows 15% performance improvement in benchmarks. Major focus on JIT compiler development for future releases. Backward compatibility maintained.",
                "category": "Programming Languages",
                "date": "2024-01-18",
                "impact_score": 0.7,
                "tags": ["python", "performance", "jit", "programming", "backend"],
                "source": "Python.org"
            },
            {
                "id": "dn4",
                "title": "Edge AI Deployments Growing Rapidly",
                "content": "Edge computing combined with AI models shows 200% growth. TensorFlow Lite and ONNX Runtime leading the space. IoT devices driving adoption.",
                "category": "AI/ML",
                "date": "2024-01-17",
                "impact_score": 0.8,
                "tags": ["edge", "ai", "tensorflow", "onnx", "iot", "mlops"],
                "source": "VentureBeat"
            },
            {
                "id": "dn5",
                "title": "WebAssembly Beyond the Browser",
                "content": "WASM gaining traction for server-side applications, plugin systems, and cross-platform deployment. Startups building entire platforms on WebAssembly runtime.",
                "category": "Web Development",
                "date": "2024-01-16",
                "impact_score": 0.75,
                "tags": ["webassembly", "wasm", "serverless", "plugins", "cross-platform"],
                "source": "The New Stack"
            }
        ]
        
        # GitHub projects sample data
        self.github_data = [
            {
                "id": "gh1",
                "name": "OpenBB Terminal",
                "description": "Investment research for everyone, anywhere. Open source Bloomberg alternative for financial data analysis and visualization.",
                "stars": 25000,
                "forks": 2400,
                "language": "Python",
                "topics": ["finance", "trading", "investment", "data-science", "quant", "stocks", "crypto"],
                "learning_value": "Excellent for learning financial data pipelines, async Python patterns, data visualization, and real-time data processing.",
                "difficulty": "intermediate",
                "last_updated": "2024-01-15",
                "contributors": 450
            },
            {
                "id": "gh2",
                "name": "FastAPI",
                "description": "Modern, fast web framework for building APIs with Python 3.7+ based on standard Python type hints. Automatic OpenAPI documentation.",
                "stars": 68000,
                "forks": 5600,
                "language": "Python",
                "topics": ["api", "rest", "async", "web-framework", "openapi", "swagger", "pydantic"],
                "learning_value": "Perfect for learning modern Python async/await patterns, API design, OpenAPI documentation, and dependency injection.",
                "difficulty": "beginner",
                "last_updated": "2024-01-10",
                "contributors": 520
            },
            {
                "id": "gh3",
                "name": "LangChain",
                "description": "Framework for developing applications powered by language models with composable components for prompts, chains, agents, and memory.",
                "stars": 72000,
                "forks": 9800,
                "language": "Python",
                "topics": ["ai", "llm", "langchain", "agents", "embeddings", "chatgpt", "openai"],
                "learning_value": "Great for understanding AI agent patterns, prompt engineering, LLM application development, and RAG implementations.",
                "difficulty": "intermediate",
                "last_updated": "2024-01-12",
                "contributors": 1200
            },
            {
                "id": "gh4",
                "name": "Next.js",
                "description": "The React Framework for production with hybrid static & server rendering, TypeScript support, smart bundling, and route pre-fetching.",
                "stars": 115000,
                "forks": 25000,
                "language": "JavaScript",
                "topics": ["react", "framework", "ssr", "typescript", "vercel", "frontend", "web"],
                "learning_value": "Best for learning modern React patterns, server-side rendering, static site generation, and full-stack development.",
                "difficulty": "intermediate",
                "last_updated": "2024-01-14",
                "contributors": 3100
            },
            {
                "id": "gh5",
                "name": "RustPython",
                "description": "Python interpreter written in Rust. Runs in browser via WebAssembly. Educational project for learning both Rust and Python internals.",
                "stars": 15000,
                "forks": 1000,
                "language": "Rust",
                "topics": ["python", "rust", "interpreter", "webassembly", "compiler", "educational"],
                "learning_value": "Excellent for understanding language interpreters, Rust systems programming, and Python internals.",
                "difficulty": "advanced",
                "last_updated": "2024-01-08",
                "contributors": 230
            }
        ]
        
        # Tech trends sample data
        self.trends_data = [
            {
                "id": "tt1",
                "technology": "Python",
                "radar_position": "Adopt",
                "adoption_level": "High",
                "growth_rate": 0.15,
                "learning_curve": "Low",
                "market_demand": "Very High",
                "reasoning": "Dominates AI/ML, data science, automation, and backend development. Massive ecosystem, excellent documentation, and strong community support.",
                "use_cases": ["ai-ml", "data-science", "automation", "web-backend", "scripting", "devops"],
                "job_openings": 85000,
                "average_salary": 120000
            },
            {
                "id": "tt2",
                "technology": "Rust",
                "radar_position": "Trial",
                "adoption_level": "Medium",
                "growth_rate": 0.40,
                "learning_curve": "High",
                "market_demand": "High",
                "reasoning": "Growing in systems programming, web assembly, safety-critical systems, and infrastructure. Memory safety without garbage collector overhead.",
                "use_cases": ["systems", "webassembly", "cli", "embedded", "game-engines", "blockchain"],
                "job_openings": 15000,
                "average_salary": 145000
            },
            {
                "id": "tt3",
                "technology": "TypeScript",
                "radar_position": "Adopt",
                "adoption_level": "Very High",
                "growth_rate": 0.25,
                "learning_curve": "Low-Medium",
                "market_demand": "Very High",
                "reasoning": "Essential for modern web development. Type safety with JavaScript compatibility. Excellent tooling and framework support.",
                "use_cases": ["web-frontend", "fullstack", "nodejs", "desktop", "mobile", "cloud"],
                "job_openings": 95000,
                "average_salary": 115000
            },
            {
                "id": "tt4",
                "technology": "AI/ML Engineering",
                "radar_position": "Adopt",
                "adoption_level": "High",
                "growth_rate": 0.50,
                "learning_curve": "High",
                "market_demand": "Very High",
                "reasoning": "Highest demand skill requiring combination of software engineering and ML expertise. Covers model training, deployment, and MLOps.",
                "use_cases": ["ai-apps", "ml-ops", "data-pipelines", "automation", "computer-vision", "nlp"],
                "job_openings": 65000,
                "average_salary": 160000
            },
            {
                "id": "tt5",
                "technology": "Go (Golang)",
                "radar_position": "Adopt",
                "adoption_level": "High",
                "growth_rate": 0.20,
                "learning_curve": "Medium",
                "market_demand": "High",
                "reasoning": "Popular for cloud services, microservices, and CLI tools. Simple syntax, excellent concurrency, and fast compilation.",
                "use_cases": ["cloud", "microservices", "devops", "cli", "apis", "distributed-systems"],
                "job_openings": 45000,
                "average_salary": 135000
            }
        ]
        
        logger.info(f"✅ Loaded {len(self.devnews_data)} DevNews items")
        logger.info(f"✅ Loaded {len(self.github_data)} GitHub projects")
        logger.info(f"✅ Loaded {len(self.trends_data)} tech trends")
    
    def _calculate_similarity(self, query: str, text: str) -> float:
        """Calculate simple text similarity score"""
        if not query or not text:
            return 0.0
        
        query_words = set(query.lower().split())
        text_words = set(text.lower().split())
        
        if not query_words or not text_words:
            return 0.0
        
        # Jaccard similarity
        intersection = len(query_words.intersection(text_words))
        union = len(query_words.union(text_words))
        
        if union == 0:
            return 0.0
        
        return intersection / union
    
    async def search_devnews(self, query: str, limit: int = 5) -> List[Dict]:
        """Search DevNews using text similarity"""
        if not self.data_loaded:
            return []
        
        results = []
        query_lower = query.lower()
        
        for item in self.devnews_data:
            score = 0.0
            
            # Check title
            title_score = self._calculate_similarity(query, item['title'])
            score += title_score * 0.5
            
            # Check content
            content_score = self._calculate_similarity(query, item['content'])
            score += content_score * 0.3
            
            # Check tags
            tags = item.get('tags', [])
            tag_matches = sum(1 for tag in tags if query_lower in tag.lower())
            if tag_matches > 0:
                score += 0.1 + (tag_matches * 0.05)
            
            # Check category
            if query_lower in item.get('category', '').lower():
                score += 0.1
            
            # Boost recent items
            try:
                item_date = datetime.strptime(item.get('date', '2024-01-01'), '%Y-%m-%d')
                days_old = (datetime.now() - item_date).days
                if days_old < 30:  # Recent items get boost
                    score += 0.1 * (1 - days_old/30)
            except:
                pass
            
            if score > 0:
                result = item.copy()
                result['similarity'] = min(1.0, score)
                results.append(result)
        
        # Sort by score
        results.sort(key=lambda x: x['similarity'], reverse=True)
        return results[:limit]
    
    async def search_github(self, query: str, limit: int = 5) -> List[Dict]:
        """Search GitHub projects using text similarity"""
        if not self.data_loaded:
            return []
        
        results = []
        query_lower = query.lower()
        
        for item in self.github_data:
            score = 0.0
            
            # Check name
            name_score = self._calculate_similarity(query, item['name'])
            score += name_score * 0.4
            
            # Check description
            desc_score = self._calculate_similarity(query, item['description'])
            score += desc_score * 0.3
            
            # Check learning value
            learning_score = self._calculate_similarity(query, item.get('learning_value', ''))
            score += learning_score * 0.2
            
            # Check topics
            topics = item.get('topics', [])
            topic_matches = sum(1 for topic in topics if query_lower in topic.lower())
            if topic_matches > 0:
                score += 0.1 + (topic_matches * 0.05)
            
            # Check language
            if query_lower in item.get('language', '').lower():
                score += 0.1
            
            # Boost popular projects
            stars = item.get('stars', 0)
            if stars > 10000:
                score += 0.1
            elif stars > 1000:
                score += 0.05
            
            if score > 0:
                result = item.copy()
                result['similarity'] = min(1.0, score)
                results.append(result)
        
        # Sort by score
        results.sort(key=lambda x: x['similarity'], reverse=True)
        return results[:limit]
    
    async def search_trends(self, query: str, limit: int = 5) -> List[Dict]:
        """Search tech trends using text similarity"""
        if not self.data_loaded:
            return []
        
        results = []
        query_lower = query.lower()
        
        for item in self.trends_data:
            score = 0.0
            
            # Check technology name
            tech_score = self._calculate_similarity(query, item['technology'])
            score += tech_score * 0.5
            
            # Check reasoning
            reasoning_score = self._calculate_similarity(query, item.get('reasoning', ''))
            score += reasoning_score * 0.3
            
            # Check use cases
            use_cases = item.get('use_cases', [])
            use_case_matches = sum(1 for use_case in use_cases if query_lower in use_case.lower())
            if use_case_matches > 0:
                score += 0.1 + (use_case_matches * 0.05)
            
            # Check radar position
            if query_lower in item.get('radar_position', '').lower():
                score += 0.1
            
            # Boost high-growth technologies
            growth = item.get('growth_rate', 0)
            if growth > 0.3:
                score += 0.1
            
            if score > 0:
                result = item.copy()
                result['similarity'] = min(1.0, score)
                results.append(result)
        
        # Sort by score
        results.sort(key=lambda x: x['similarity'], reverse=True)
        return results[:limit]
    
    def save_conversation(self, conversation_id: str, user_role: UserRole):
        """Save or update conversation"""
        try:
            cursor = self.memory_db.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO conversations (id, user_role, updated_at)
                VALUES (?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(id) DO UPDATE SET 
                    updated_at = CURRENT_TIMESTAMP,
                    message_count = message_count + 1
            ''', (conversation_id, user_role.value))
            self.memory_db.commit()
        except Exception as e:
            logger.error(f"Error saving conversation: {e}")
    
    def save_message(self, message: Dict):
        """Save message to database"""
        try:
            cursor = self.memory_db.cursor()
            cursor.execute('''
                INSERT INTO messages 
                (id, conversation_id, content, role, agent_type, confidence, metadata, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                message['id'],
                message['conversation_id'],
                message['content'],
                message['role'],
                message.get('agent_type'),
                message.get('confidence'),
                json.dumps(message.get('metadata', {})),
                datetime.now().isoformat()
            ))
            self.memory_db.commit()
        except Exception as e:
            logger.error(f"Error saving message: {e}")
    
    def get_conversation_history(self, conversation_id: str, limit: int = 10) -> List[Dict]:
        """Get conversation history"""
        try:
            cursor = self.memory_db.cursor()
            cursor.execute('''
                SELECT 
                    content, role, agent_type, confidence, metadata, created_at
                FROM messages 
                WHERE conversation_id = ?
                ORDER BY created_at DESC
                LIMIT ?
            ''', (conversation_id, limit))
            
            history = []
            for row in cursor.fetchall():
                try:
                    metadata = json.loads(row[4]) if row[4] else {}
                except:
                    metadata = {}
                
                history.append({
                    'content': row[0],
                    'role': row[1],
                    'agent_type': row[2],
                    'confidence': row[3],
                    'metadata': metadata,
                    'timestamp': row[5]
                })
            
            return history[::-1]  # Reverse to chronological order
        except Exception as e:
            logger.error(f"Error getting conversation history: {e}")
            return []
    
    def cleanup_old_conversations(self, days: int = 30):
        """Clean up old conversations"""
        try:
            cursor = self.memory_db.cursor()
            cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
            
            cursor.execute('''
                DELETE FROM messages 
                WHERE conversation_id IN (
                    SELECT id FROM conversations 
                    WHERE updated_at < ?
                )
            ''', (cutoff_date,))
            
            cursor.execute('''
                DELETE FROM conversations 
                WHERE updated_at < ?
            ''', (cutoff_date,))
            
            deleted_count = cursor.rowcount
            self.memory_db.commit()
            
            if deleted_count > 0:
                logger.info(f"Cleaned up {deleted_count} old conversations")
        except Exception as e:
            logger.error(f"Error cleaning up conversations: {e}")
    
    async def close(self):
        """Close database connections"""
        try:
            if self.memory_db:
                self.memory_db.close()
            logger.info("Knowledge base closed")
        except Exception as e:
            logger.error(f"Error closing knowledge base: {e}")