import re
import uuid
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
from enum import Enum
import asyncio

from .models import AgentType, UserRole, QueryIntent
from .knowledge_base import KnowledgeBase
from .config import config

class BaseAgent:
    """Base agent with standard execution loop"""
    
    def __init__(self, agent_type: AgentType, knowledge_base: KnowledgeBase):
        self.agent_type = agent_type
        self.kb = knowledge_base
        self.requests_processed = 0
        
    async def execute(self, query: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the agent loop: Observe → Analyze → Reason → Decide → Respond → Learn"""
        self.requests_processed += 1
        
        # 1. Observe
        observation = await self.observe(query, context)
        
        # 2. Analyze
        analysis = await self.analyze(observation)
        
        # 3. Reason
        reasoning = await self.reason(analysis)
        
        # 4. Decide
        decision = await self.decide(reasoning)
        
        # 5. Respond
        response = await self.respond(decision)
        
        # 6. Learn (async, don't wait)
        asyncio.create_task(self.learn(response, context))
        
        return {
            "agent_type": self.agent_type,
            "response": response,
            "metadata": decision.get("metadata", {}),
            "confidence": response.get("confidence", 0.5)
        }
    
    async def observe(self, query: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Observe the current state"""
        return {
            "query": query,
            "original_query": query,
            "context": context,
            "timestamp": datetime.now(),
            "user_role": context.get("user_role", UserRole.TECH_LEARNER)
        }
    
    async def analyze(self, observation: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze the observation"""
        return {"status": "analyzed", "observation": observation}
    
    async def reason(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Apply reasoning logic"""
        return {"status": "reasoned", "analysis": analysis}
    
    async def decide(self, reasoning: Dict[str, Any]) -> Dict[str, Any]:
        """Make decisions based on reasoning"""
        return {"decision": "proceed", "reasoning": reasoning}
    
    async def respond(self, decision: Dict[str, Any]) -> Dict[str, Any]:
        """Generate response"""
        return {
            "content": "Default response",
            "confidence": 0.5,
            "suggested_questions": [],
            "metadata": {}
        }
    
    async def learn(self, response: Dict[str, Any], context: Dict[str, Any]) -> None:
        """Learn from the interaction"""
        pass

class OrchestratorAgent(BaseAgent):
    """Orchestrator agent - routes queries to specialized agents"""
    
    def __init__(self, knowledge_base: KnowledgeBase):
        super().__init__(AgentType.ORCHESTRATOR, knowledge_base)
        self.specialist_agents = {}
        self.intent_keywords = {
            QueryIntent.DEVNEWS: [
                "news", "trend", "happening", "latest", "update", 
                "what's new", "recent", "article", "blog"
            ],
            QueryIntent.GITHUB: [
                "github", "repo", "repository", "project", "open source",
                "star", "fork", "contribute", "code", "source"
            ],
            QueryIntent.TECH_TREND: [
                "trend", "adopt", "radar", "worth learning", "future",
                "relevant", "obsolete", "dying", "growing", "declining"
            ],
            QueryIntent.LEARNING: [
                "learn", "study", "recommend", "should i", "path",
                "skill", "career", "start", "beginner", "advanced",
                "tutorial", "course", "resource", "project"
            ],
            QueryIntent.COMPARISON: [
                "vs", "versus", "compare", "difference", "better",
                "worse", "pros", "cons", "advantages", "disadvantages"
            ],
            QueryIntent.EXPLANATION: [
                "explain", "what is", "how does", "why", "understand",
                "meaning", "definition", "concept", "elaborate"
            ]
        }
    
    def register_agent(self, agent: BaseAgent):
        """Register a specialist agent"""
        self.specialist_agents[agent.agent_type] = agent
    
    async def analyze(self, observation: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze query to determine intent"""
        query = observation["query"].lower()
        
        # Detect intents
        detected_intents = []
        for intent, keywords in self.intent_keywords.items():
            if any(keyword in query for keyword in keywords):
                detected_intents.append(intent)
        
        # If no intent detected, try to infer from context
        if not detected_intents:
            detected_intents.append(QueryIntent.GENERAL)
        
        # Check for multi-intent queries
        requires_multi_agent = len(detected_intents) > 1
        
        return {
            **observation,
            "detected_intents": detected_intents,
            "requires_multi_agent": requires_multi_agent,
            "query_length": len(query),
            "has_question_mark": "?" in observation["original_query"]
        }
    
    async def decide(self, reasoning: Dict[str, Any]) -> Dict[str, Any]:
        """Decide which agent(s) to route to"""
        intents = reasoning["detected_intents"]
        
        # Map intents to agents
        intent_to_agent = {
            QueryIntent.DEVNEWS: AgentType.DEVNEWS,
            QueryIntent.GITHUB: AgentType.GITHUB,
            QueryIntent.TECH_TREND: AgentType.TECH_TREND,
            QueryIntent.LEARNING: AgentType.LEARNING,
            QueryIntent.COMPARISON: AgentType.TECH_TREND,  # Comparison often needs trend analysis
            QueryIntent.EXPLANATION: AgentType.ORCHESTRATOR  # Orchestrator handles explanations
        }
        
        # Select primary agent
        primary_intent = intents[0]
        primary_agent = intent_to_agent.get(primary_intent, AgentType.ORCHESTRATOR)
        
        # Determine supporting agents
        supporting_agents = []
        for intent in intents[1:]:
            agent = intent_to_agent.get(intent)
            if agent and agent != primary_agent:
                supporting_agents.append(agent)
        
        return {
            "primary_agent": primary_agent,
            "supporting_agents": supporting_agents,
            "primary_intent": primary_intent,
            "reasoning": reasoning,
            "metadata": {
                "intents": [intent.value for intent in intents],
                "requires_coordination": len(supporting_agents) > 0
            }
        }
    
    async def respond(self, decision: Dict[str, Any]) -> Dict[str, Any]:
        """Orchestrate responses from multiple agents"""
        primary_agent = decision["primary_agent"]
        reasoning = decision["reasoning"]
        query = reasoning["original_query"]
        context = reasoning["context"]
        
        # Handle general queries directly
        if primary_agent == AgentType.ORCHESTRATOR and not decision["supporting_agents"]:
            return await self._handle_general_query(query, context, decision)
        
        # Coordinate multiple agents
        elif decision["supporting_agents"]:
            return await self._coordinate_agents(query, context, decision)
        
        # Delegate to single specialist agent
        else:
            agent = self.specialist_agents.get(primary_agent)
            if agent:
                result = await agent.execute(query, context)
                return result["response"]
        
        # Fallback response
        return {
            "content": "I need to analyze this further. Could you clarify your question?",
            "confidence": 0.3,
            "suggested_questions": [
                "Are you asking about technology trends?",
                "Do you need GitHub project recommendations?",
                "Looking for learning guidance?"
            ],
            "metadata": {"error": "no_suitable_agent"}
        }
    
    async def _handle_general_query(self, query: str, context: Dict, decision: Dict) -> Dict[str, Any]:
        """Handle general conversational queries"""
        query_lower = query.lower()
        
        # Greetings
        greetings = ["hi", "hello", "hey", "good morning", "good afternoon"]
        if any(greeting in query_lower for greeting in greetings):
            return {
                "content": """👋 **Hello! I'm your NeuroLearn AI Assistant** - an agentic learning intelligence system.

I combine multiple specialized agents to help you with:

🔹 **Developer News Intelligence** - Latest trends and updates
🔹 **GitHub Project Analysis** - Best repos for learning
🔹 **Technology Trend Reasoning** - What's worth learning
🔹 **Learning Recommendations** - Personalized guidance

What would you like to explore today?""",
                "confidence": 1.0,
                "suggested_questions": [
                    "What should I learn in 2026?",
                    "Tell me about AI trends this week",
                    "Best GitHub projects for learning Python"
                ],
                "metadata": {"intent": "greeting"}
            }
        
        # Farewells
        farewells = ["bye", "goodbye", "see you", "thanks", "thank you"]
        if any(farewell in query_lower for farewell in farewells):
            return {
                "content": "👋 Goodbye! Keep learning and growing. Remember, the best investment is in yourself!",
                "confidence": 1.0,
                "suggested_questions": [],
                "metadata": {"intent": "farewell"}
            }
        
        # Try to find relevant information
        devnews_results = await self.kb.search_devnews(query, 1)
        github_results = await self.kb.search_github(query, 1)
        
        if devnews_results or github_results:
            suggestions = []
            if devnews_results:
                suggestions.append("Get the latest developer news")
            if github_results:
                suggestions.append("Explore GitHub projects")
            
            return {
                "content": "I found some relevant information. Let me connect you with the right specialist...",
                "confidence": 0.6,
                "suggested_questions": suggestions,
                "metadata": {"hints_found": True}
            }
        
        # Default clarification
        return {
            "content": """I'm here to help you with developer intelligence, GitHub analysis, tech trends, and learning recommendations.

        Could you be more specific about what you're looking for? For example:
        • "What technologies should I learn for backend development?"
        • "Show me trending GitHub projects in AI"
        • "Is Python still worth learning in 2026?"
        """,
            "confidence": 0.4,
            "suggested_questions": [
                "What's trending in web development?",
                "How do I start with machine learning?",
                "Compare React vs Vue for learning"
            ],
            "metadata": {"intent": "clarification_needed"}
        }
    
    async def _coordinate_agents(self, query: str, context: Dict, decision: Dict) -> Dict[str, Any]:
        """Coordinate responses from multiple agents"""
        all_agents = [decision["primary_agent"]] + decision["supporting_agents"]
        responses = []
        
        # Execute all relevant agents concurrently
        tasks = []
        for agent_type in all_agents:
            agent = self.specialist_agents.get(agent_type)
            if agent:
                tasks.append(agent.execute(query, context))
        
        if tasks:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for result in results:
                if not isinstance(result, Exception):
                    responses.append(result)
        
        # Combine responses
        if responses:
            combined_content = "# 🧠 Multi-Agent Analysis\n\n"
            
            for i, result in enumerate(responses):
                agent_type = result["agent_type"].value.replace("_", " ").title()
                combined_content += f"## 🔹 {agent_type} Analysis\n\n"
                combined_content += result["response"]["content"] + "\n\n"
            
            # Add meta-analysis
            combined_content += "## 🎯 Combined Insights\n\n"
            combined_content += "Based on cross-analysis across multiple intelligence sources:\n\n"
            
            insights = set()
            for result in responses:
                resp = result["response"]
                if "trend" in resp["content"].lower():
                    insights.add("• Shows clear growth patterns")
                if "learn" in resp["content"].lower():
                    insights.add("• Provides actionable learning paths")
                if "github" in resp["content"].lower():
                    insights.add("• Grounded in real open-source projects")
                if "news" in resp["content"].lower():
                    insights.add("• Informed by current developments")
            
            if insights:
                combined_content += "\n".join(insights) + "\n\n"
            
            combined_content += "This integrated view helps you make informed learning and career decisions."
            
            # Generate follow-up questions
            followups = []
            if AgentType.GITHUB in all_agents:
                followups.append("Show me more GitHub projects in this area")
            if AgentType.TECH_TREND in all_agents:
                followups.append("What are alternatives to these technologies?")
            if AgentType.LEARNING in all_agents:
                followups.append("What should I learn next?")
            if len(all_agents) > 1:
                followups.append("How do these insights connect together?")
            
            confidence = min(0.9, sum(r["confidence"] for r in responses) / len(responses))
            
            return {
                "content": combined_content,
                "confidence": confidence,
                "suggested_questions": followups[:3],
                "metadata": {
                    "coordinated_agents": [agt.value for agt in all_agents],
                    "response_count": len(responses),
                    "average_confidence": confidence
                }
            }
        
        return {
            "content": "I'm analyzing this from multiple angles...",
            "confidence": 0.5,
            "suggested_questions": [],
            "metadata": {"status": "analyzing"}
        }
    
    async def learn(self, response: Dict[str, Any], context: Dict[str, Any]) -> None:
        """Learn from coordination patterns"""
        # Store coordination patterns for future optimization
        pass

class DevNewsIntelligenceAgent(BaseAgent):
    """DevNews Intelligence Agent"""
    
    def __init__(self, knowledge_base: KnowledgeBase):
        super().__init__(AgentType.DEVNEWS, knowledge_base)
    
    async def analyze(self, observation: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze DevNews query"""
        query = observation["query"]
        
        # Extract timeframe
        timeframe = "recent"
        query_lower = query.lower()
        if "week" in query_lower:
            timeframe = "week"
        elif "month" in query_lower:
            timeframe = "month"
        elif "year" in query_lower:
            timeframe = "year"
        elif "today" in query_lower:
            timeframe = "today"
        
        # Search relevant news
        news_results = await self.kb.search_devnews(query, config.AGENTS["devnews"]["search_limit"])
        
        return {
            **observation,
            "news_results": news_results,
            "timeframe": timeframe,
            "topic": self._extract_topic(query),
            "results_count": len(news_results)
        }
    
    def _extract_topic(self, query: str) -> str:
        """Extract main topic from query"""
        topics = {
            "ai": ["ai", "artificial intelligence", "machine learning", "llm", "gpt"],
            "python": ["python", "django", "flask", "fastapi"],
            "javascript": ["javascript", "typescript", "react", "vue", "angular"],
            "rust": ["rust", "systems programming"],
            "cloud": ["cloud", "aws", "azure", "gcp", "kubernetes"],
            "web": ["web", "frontend", "backend", "fullstack"]
        }
        
        query_lower = query.lower()
        for topic, keywords in topics.items():
            if any(keyword in query_lower for keyword in keywords):
                return topic
        return "general"
    
    async def reason(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Reason about news patterns"""
        news_results = analysis["news_results"]
        
        if not news_results:
            return {
                "status": "no_news_found",
                "analysis": analysis,
                "patterns": []
            }
        
        # Analyze patterns
        patterns = []
        high_impact_count = 0
        
        for news in news_results:
            # Check impact
            if news.get('impact_score', 0) > 0.7:
                high_impact_count += 1
            
            # Check for growth mentions
            content_lower = news['content'].lower()
            growth_keywords = ["growth", "increase", "surge", "rising", "adoption", "growing"]
            if any(keyword in content_lower for keyword in growth_keywords):
                patterns.append({
                    "type": "growth",
                    "technology": news.get('title', '').split()[0],
                    "evidence": news['content']
                })
        
        if high_impact_count > 0:
            patterns.append({
                "type": "high_impact",
                "count": high_impact_count
            })
        
        # Calculate overall sentiment
        sentiment = 0.5
        if news_results:
            avg_impact = sum(n.get('impact_score', 0.5) for n in news_results) / len(news_results)
            sentiment = min(0.9, avg_impact + (high_impact_count * 0.1))
        
        return {
            "status": "analyzed_patterns",
            "analysis": analysis,
            "patterns": patterns,
            "sentiment": sentiment,
            "high_impact_count": high_impact_count
        }
    
    async def respond(self, decision: Dict[str, Any]) -> Dict[str, Any]:
        """Generate DevNews response"""
        analysis = decision["reasoning"]["analysis"]
        patterns = decision["reasoning"]["patterns"]
        news_results = analysis["news_results"]
        sentiment = decision["reasoning"]["sentiment"]
        
        if not news_results:
            return {
                "content": "I don't have recent news on that specific topic. Would you like me to check broader technology trends instead?",
                "confidence": 0.2,
                "suggested_questions": [
                    "What's trending in AI development?",
                    "Latest news in web development",
                    "Show me high-impact tech news"
                ],
                "metadata": {"status": "no_data"}
            }
        
        # Build response
        response_parts = []
        response_parts.append(f"# 📰 Developer News Analysis ({analysis['timeframe'].title()})")
        response_parts.append(f"\nAnalyzed **{len(news_results)}** relevant news items:\n")
        
        # Key patterns
        if patterns:
            response_parts.append("\n## 🔍 Key Patterns")
            for pattern in patterns[:3]:  # Show top 3 patterns
                if pattern["type"] == "growth":
                    response_parts.append(f"• **Growth Trend**: {pattern['technology']} showing momentum")
                elif pattern["type"] == "high_impact":
                    response_parts.append(f"• **High Impact**: {pattern['count']} significant developments")
        
        # Top news items
        response_parts.append("\n## 📈 Top Developments")
        for i, news in enumerate(news_results[:3], 1):
            response_parts.append(f"\n{i}. **{news['title']}**")
            response_parts.append(f"   {news['content']}")
            if news.get('impact_score', 0) > 0.7:
                response_parts.append("   ⚡ *High Impact*")
        
        # Learning implications
        response_parts.append("\n## 🧠 Implications for Learners")
        
        if analysis['topic'] == "ai":
            response_parts.append("• **AI/ML skills** remain in high demand")
            response_parts.append("• Focus on **practical implementation** over theory")
            response_parts.append("• **Model deployment** and **MLOps** are valuable skills")
        
        elif analysis['topic'] == "python":
            response_parts.append("• **Python ecosystem** continues to expand")
            response_parts.append("• **Async programming** becoming standard")
            response_parts.append("• **Data science** and **automation** strong use cases")
        
        else:
            response_parts.append("• Stay updated with **industry trends**")
            response_parts.append("• Build **portfolio projects** in trending areas")
            response_parts.append("• **Community involvement** accelerates learning")
        
        content = "\n".join(response_parts)
        
        # Calculate confidence
        confidence = min(0.9, sentiment * 0.8 + (len(news_results) / 10))
        
        return {
            "content": content,
            "confidence": confidence,
            "suggested_questions": [
                "How does this affect learning priorities?",
                "Show me GitHub projects in this area",
                "What skills should I focus on?"
            ],
            "metadata": {
                "news_count": len(news_results),
                "timeframe": analysis["timeframe"],
                "topic": analysis["topic"],
                "high_impact_items": decision["reasoning"]["high_impact_count"]
            }
        }

class GitHubIntelligenceAgent(BaseAgent):
    """GitHub Intelligence Agent"""
    
    def __init__(self, knowledge_base: KnowledgeBase):
        super().__init__(AgentType.GITHUB, knowledge_base)
    
    async def analyze(self, observation: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze GitHub-related query"""
        query = observation["query"]
        
        # Search relevant GitHub projects
        github_results = await self.kb.search_github(query, config.AGENTS["github"]["search_limit"])
        
        return {
            **observation,
            "github_results": github_results,
            "comparison_requested": any(word in query.lower() for word in ["vs", "compare", "versus", "difference"]),
            "learning_focus": "learn" in query.lower() or "study" in query.lower(),
            "results_count": len(github_results)
        }
    
    async def reason(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Reason about GitHub projects"""
        github_results = analysis["github_results"]
        
        if not github_results:
            return {
                "status": "no_projects_found",
                "analysis": analysis
            }
        
        # Calculate project metrics
        for project in github_results:
            # Maturity score
            maturity_score = self._calculate_maturity_score(project)
            project['maturity_score'] = maturity_score
            
            # Learning value score
            learning_score = self._calculate_learning_score(project)
            project['learning_score'] = learning_score
        
        # Sort by relevance (similarity * 0.6 + maturity * 0.2 + learning * 0.2)
        for project in github_results:
            similarity = project.get('similarity', 0)
            maturity = project.get('maturity_score', 0)
            learning = project.get('learning_score', 0)
            project['relevance_score'] = (similarity * 0.6 + maturity * 0.2 + learning * 0.2)
        
        github_results.sort(key=lambda x: x['relevance_score'], reverse=True)
        
        # Extract tech stacks
        tech_stacks = set()
        for project in github_results:
            if project.get('language'):
                tech_stacks.add(project['language'])
            if project.get('topics'):
                tech_stacks.update(project['topics'][:3])
        
        return {
            "status": "analyzed_projects",
            "analysis": analysis,
            "top_projects": github_results[:3],
            "tech_stacks": list(tech_stacks),
            "project_count": len(github_results)
        }
    
    def _calculate_maturity_score(self, project: Dict) -> float:
        """Calculate project maturity score (0-1)"""
        score = 0.0
        
        # Stars factor
        stars = project.get('stars', 0)
        if stars > 10000:
            score += 0.4
        elif stars > 1000:
            score += 0.3
        elif stars > 100:
            score += 0.2
        else:
            score += 0.1
        
        # Forks factor
        forks = project.get('forks', 0)
        if forks > 1000:
            score += 0.3
        elif forks > 100:
            score += 0.2
        else:
            score += 0.1
        
        # Topics diversity
        topics = project.get('topics', [])
        if len(topics) >= 5:
            score += 0.1
        elif len(topics) >= 3:
            score += 0.05
        
        # Difficulty consideration
        difficulty = project.get('difficulty', '').lower()
        if difficulty == 'intermediate':
            score += 0.1
        elif difficulty == 'beginner':
            score += 0.05
        
        return min(score, 1.0)
    
    def _calculate_learning_score(self, project: Dict) -> float:
        """Calculate learning value score (0-1)"""
        score = 0.0
        
        learning_text = project.get('learning_value', '').lower()
        
        # Keywords indicating good learning value
        learning_keywords = {
            "excellent": 0.3,
            "great": 0.25,
            "good": 0.2,
            "perfect": 0.3,
            "best": 0.25,
            "useful": 0.15,
            "educational": 0.2,
            "learn": 0.1,
            "understand": 0.1,
            "practice": 0.1
        }
        
        for keyword, value in learning_keywords.items():
            if keyword in learning_text:
                score += value
        
        # Length of learning value description
        if len(learning_text) > 100:
            score += 0.1
        
        return min(score, 1.0)
    
    async def respond(self, decision: Dict[str, Any]) -> Dict[str, Any]:
        """Generate GitHub intelligence response"""
        analysis = decision["reasoning"]["analysis"]
        top_projects = decision["reasoning"]["top_projects"]
        comparison_requested = analysis["comparison_requested"]
        
        if not top_projects:
            return {
                "content": "I couldn't find specific GitHub projects matching your query. Try searching for a specific technology or framework.",
                "confidence": 0.2,
                "suggested_questions": [
                    "Show me popular Python projects",
                    "What are good React projects to learn from?",
                    "Open source projects for AI learning"
                ],
                "metadata": {"status": "no_projects"}
            }
        
        response_parts = []
        response_parts.append("# 💻 GitHub Intelligence")
        response_parts.append(f"\nAnalyzed **{decision['reasoning']['project_count']}** relevant repositories:\n")
        
        # Comparison table if requested
        if comparison_requested and len(top_projects) >= 2:
            response_parts.append("\n## ⚖️ Quick Comparison")
            response_parts.append("\n| Project | Stars | Forks | Best For |")
            response_parts.append("|---------|-------|-------|----------|")
            for project in top_projects[:2]:
                name = project['name'][:20] + "..." if len(project['name']) > 20 else project['name']
                learning = project.get('learning_value', 'Learning')[:30]
                response_parts.append(
                    f"| {name} | {project.get('stars', 0):,} | {project.get('forks', 0):,} | "
                    f"{learning}... |"
                )
        
        # Project analysis
        response_parts.append("\n## 🏆 Top Project Recommendations")
        
        for i, project in enumerate(top_projects, 1):
            response_parts.append(f"\n### {i}. {project['name']}")
            response_parts.append(f"**Description**: {project['description']}")
            response_parts.append(f"**Primary Language**: {project.get('language', 'Multiple')}")
            
            if project.get('stars', 0) > 0:
                response_parts.append(f"**Popularity**: {project['stars']:,} stars, {project.get('forks', 0):,} forks")
            
            response_parts.append(f"**Learning Value**: {project.get('learning_value', 'Great for practical learning')}")
            
            # Maturity indicator
            maturity = project.get('maturity_score', 0.5)
            if maturity > 0.7:
                maturity_text = "✅ High - Production ready"
            elif maturity > 0.4:
                maturity_text = "🟡 Medium - Good for learning"
            else:
                maturity_text = "🔴 Emerging - Experimental"
            
            response_parts.append(f"**Maturity**: {maturity_text}")
            
            if project.get('topics'):
                topics = ', '.join(project['topics'][:5])
                response_parts.append(f"**Topics**: {topics}")
        
        # Learning strategy
        if analysis["learning_focus"]:
            response_parts.append("\n## 🎯 Learning Strategy")
            response_parts.append("\n**For effective open-source learning:**")
            response_parts.append("1. **Start with documentation** - Understand the project structure")
            response_parts.append("2. **Read source code** - Look for patterns and architecture")
            response_parts.append("3. **Check issues/PRs** - See real-world problems and solutions")
            response_parts.append("4. **Contribute small fixes** - Learn through doing")
            response_parts.append("5. **Join community** - Ask questions, participate in discussions")
        
        content = "\n".join(response_parts)
        
        # Calculate confidence
        base_confidence = min(0.9, len(top_projects) * 0.2)
        avg_similarity = sum(p.get('similarity', 0) for p in top_projects) / len(top_projects)
        confidence = (base_confidence * 0.6) + (avg_similarity * 0.4)
        
        return {
            "content": content,
            "confidence": confidence,
            "suggested_questions": [
                "How do these compare to similar projects?",
                "What specific skills can I learn from these?",
                "Show me beginner-friendly projects"
            ],
            "metadata": {
                "projects_analyzed": len(top_projects),
                "comparison_made": comparison_requested,
                "learning_focus": analysis["learning_focus"],
                "avg_maturity": sum(p.get('maturity_score', 0) for p in top_projects) / len(top_projects)
            }
        }

class TechTrendReasoningAgent(BaseAgent):
    """Tech Trend Reasoning Agent"""
    
    def __init__(self, knowledge_base: KnowledgeBase):
        super().__init__(AgentType.TECH_TREND, knowledge_base)
    
    async def analyze(self, observation: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze tech trend query"""
        query = observation["query"]
        
        # Search relevant tech trends
        trend_results = await self.kb.search_trends(query, config.AGENTS["tech_trend"]["search_limit"])
        
        # Extract technologies for comparison
        technologies = self._extract_technologies(query)
        
        return {
            **observation,
            "trend_results": trend_results,
            "technologies": technologies,
            "timeframe": self._extract_timeframe(query),
            "comparison_requested": any(word in query.lower() for word in ["vs", "compare", "versus", "difference"]),
            "future_focus": any(word in query.lower() for word in ["2026", "future", "next year", "tomorrow"]),
            "results_count": len(trend_results)
        }
    
    def _extract_technologies(self, query: str) -> List[str]:
        """Extract technology names from query"""
        tech_keywords = [
            "python", "rust", "javascript", "typescript", "go", "golang", "java", "c++", "c#",
            "react", "vue", "angular", "svelte", "nextjs",
            "fastapi", "django", "flask", "spring", "express",
            "ai", "machine learning", "deep learning", "llm", "generative ai",
            "aws", "azure", "gcp", "cloud", "kubernetes", "docker"
        ]
        
        found = []
        query_lower = query.lower()
        for tech in tech_keywords:
            if tech in query_lower:
                found.append(tech)
        
        return found
    
    def _extract_timeframe(self, query: str) -> str:
        """Extract timeframe from query"""
        query_lower = query.lower()
        if "2026" in query_lower:
            return "2026"
        elif "2025" in query_lower:
            return "2025"
        elif "future" in query_lower or "next year" in query_lower:
            return "future"
        else:
            return "current"
    
    async def reason(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Reason about technology trends"""
        trend_results = analysis["trend_results"]
        
        if not trend_results:
            return {
                "status": "no_trends_found",
                "analysis": analysis,
                "advisory": "insufficient_data"
            }
        
        # Analyze radar distribution
        radar_counts = {"Adopt": 0, "Trial": 0, "Assess": 0, "Hold": 0}
        sentiment_scores = []
        
        for trend in trend_results:
            position = trend.get('radar_position', 'Assess')
            if position in radar_counts:
                radar_counts[position] += 1
            
            # Calculate sentiment score for this trend
            score = 0.0
            
            # Radar position score
            position_scores = {"Adopt": 0.4, "Trial": 0.3, "Assess": 0.2, "Hold": 0.1}
            score += position_scores.get(position, 0.2)
            
            # Growth rate score
            growth = trend.get('growth_rate', 0)
            score += min(growth * 0.3, 0.3)
            
            # Market demand score
            demand = trend.get('market_demand', '').lower()
            if "very high" in demand:
                score += 0.2
            elif "high" in demand:
                score += 0.15
            elif "medium" in demand:
                score += 0.1
            
            sentiment_scores.append(score)
        
        # Overall sentiment
        avg_sentiment = sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0.5
        
        # Generate advisory
        if avg_sentiment > 0.7:
            advisory = "strong_consider"
        elif avg_sentiment > 0.5:
            advisory = "consider"
        elif avg_sentiment > 0.3:
            advisory = "cautious"
        else:
            advisory = "reconsider"
        
        # Sort trends by sentiment
        for trend in trend_results:
            idx = trend_results.index(trend)
            trend['sentiment_score'] = sentiment_scores[idx]
        
        trend_results.sort(key=lambda x: x['sentiment_score'], reverse=True)
        
        return {
            "status": "trends_analyzed",
            "analysis": analysis,
            "radar_distribution": radar_counts,
            "average_sentiment": avg_sentiment,
            "advisory": advisory,
            "top_trends": trend_results[:3],
            "sentiment_scores": sentiment_scores
        }
    
    async def respond(self, decision: Dict[str, Any]) -> Dict[str, Any]:
        """Generate tech trend response"""
        analysis = decision["reasoning"]["analysis"]
        top_trends = decision["reasoning"]["top_trends"]
        radar_distribution = decision["reasoning"]["radar_distribution"]
        advisory = decision["reasoning"]["advisory"]
        
        if not top_trends:
            return {
                "content": "I don't have specific trend data for that technology. Consider checking GitHub activity and recent news for insights.",
                "confidence": 0.3,
                "suggested_questions": [
                    "What technologies are trending in 2026?",
                    "Is Python still a good language to learn?",
                    "Show me adoption trends for web frameworks"
                ],
                "metadata": {"status": "no_trend_data"}
            }
        
        response_parts = []
        
        # Header with timeframe
        timeframe = analysis["timeframe"]
        timeframe_text = f"({timeframe.title()})" if timeframe != "current" else ""
        response_parts.append(f"# 📊 Technology Trend Analysis {timeframe_text}")
        
        # Radar summary
        response_parts.append("\n## 🎯 Adoption Radar Overview")
        response_parts.append("\n| Stage | Count | Guidance |")
        response_parts.append("|-------|-------|----------|")
        
        radar_explanations = {
            "Adopt": "✅ **Proven** - Widely adopted, production-ready",
            "Trial": "🔬 **Promising** - Good for early adopters",
            "Assess": "📊 **Watch** - Evaluate before investing",
            "Hold": "⏸️ **Limited** - Consider alternatives"
        }
        
        for stage, count in radar_distribution.items():
            if count > 0:
                response_parts.append(f"| {stage} | {count} | {radar_explanations[stage]} |")
        
        # Technology deep dive
        response_parts.append("\n## 🚀 Technology Deep Dive")
        
        for trend in top_trends:
            response_parts.append(f"\n### {trend['technology']} ({trend['radar_position']})")
            
            # Metrics
            metrics = []
            if trend.get('adoption_level'):
                metrics.append(f"**Adoption**: {trend['adoption_level']}")
            if trend.get('growth_rate'):
                growth_pct = trend['growth_rate'] * 100
                metrics.append(f"**Growth**: {growth_pct:.1f}% YoY")
            if trend.get('learning_curve'):
                metrics.append(f"**Learning Curve**: {trend['learning_curve']}")
            if trend.get('market_demand'):
                metrics.append(f"**Market Demand**: {trend['market_demand']}")
            
            if metrics:
                response_parts.append(", ".join(metrics))
            
            # Reasoning
            response_parts.append(f"\n**Why this matters**:")
            response_parts.append(trend.get('reasoning', 'Significant industry traction'))
            
            # Learning recommendation based on position
            position = trend.get('radar_position', 'Assess')
            if position == "Adopt":
                advice = "✅ **Learning Priority: High** - Strong career value, proven track record"
            elif position == "Trial":
                advice = "🔬 **Learning Priority: Medium-High** - Future potential, growing adoption"
            elif position == "Assess":
                advice = "📊 **Learning Priority: Medium** - Monitor developments, learn fundamentals"
            else:
                advice = "⏸️ **Learning Priority: Low** - Limited ROI, focus on alternatives"
            
            response_parts.append(f"\n{advice}")
            
            # Use cases
            if trend.get('use_cases'):
                response_parts.append(f"\n**Best for**: {', '.join(trend['use_cases'])}")
        
        # Strategic recommendations
        response_parts.append("\n## 🧠 Strategic Learning Insights")
        
        advisory_texts = {
            "strong_consider": "**Overall Recommendation: Strong Learning Opportunity**",
            "consider": "**Overall Recommendation: Worth Exploring**",
            "cautious": "**Overall Recommendation: Proceed with Caution**",
            "reconsider": "**Overall Recommendation: Consider Alternatives**",
            "insufficient_data": "**Recommendation: Insufficient Data**"
        }
        
        response_parts.append(f"\n{advisory_texts.get(advisory, '**Analysis Complete**')}")
        
        if advisory == "strong_consider":
            response_parts.append("• Multiple technologies showing strong growth")
            response_parts.append("• Good alignment with industry demand")
            response_parts.append("• Excellent time for skill investment")
            response_parts.append("• Consider building portfolio projects")
        elif advisory == "consider":
            response_parts.append("• Positive trends with some variability")
            response_parts.append("• Good for skill diversification")
            response_parts.append("• Start with foundational concepts")
            response_parts.append("• Monitor industry adoption")
        elif advisory == "cautious":
            response_parts.append("• Limited or mixed signals")
            response_parts.append("• Consider complementary skills")
            response_parts.append("• Focus on transferable concepts")
            response_parts.append("• Wait for clearer trends")
        elif advisory == "reconsider":
            response_parts.append("• Limited growth or adoption")
            response_parts.append("• Higher learning opportunity cost")
            response_parts.append("• Look at adjacent technologies")
            response_parts.append("• Consider sunsetting this skill")
        
        # Future outlook if requested
        if analysis["future_focus"]:
            response_parts.append("\n## 🔮 Future Outlook")
            response_parts.append("\nBased on current trends:")
            
            if timeframe == "2026":
                response_parts.append("• **AI integration** will become ubiquitous")
                response_parts.append("• **Edge computing** will see significant growth")
                response_parts.append("• **Developer experience** tools will evolve")
                response_parts.append("• **Low-code/No-code** will complement traditional development")
        
        content = "\n".join(response_parts)
        
        # Confidence calculation
        confidence = min(0.9, decision["reasoning"]["average_sentiment"])
        
        return {
            "content": content,
            "confidence": confidence,
            "suggested_questions": [
                "How do these trends compare to last year?",
                "What skills complement these technologies?",
                "Show me learning resources for these trends"
            ],
            "metadata": {
                "technologies_analyzed": analysis["technologies"],
                "radar_distribution": radar_distribution,
                "advisory_level": advisory,
                "timeframe": analysis["timeframe"],
                "future_focus": analysis["future_focus"],
                "avg_sentiment": decision["reasoning"]["average_sentiment"]
            }
        }

class LearningRecommendationAgent(BaseAgent):
    """Learning Recommendation Agent"""
    
    def __init__(self, knowledge_base: KnowledgeBase):
        super().__init__(AgentType.LEARNING, knowledge_base)
    
    async def analyze(self, observation: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze learning recommendation query"""
        query = observation["query"]
        context = observation["context"]
        user_role = context.get("user_role", UserRole.TECH_LEARNER)
        
        # Extract learning goals
        goals = self._extract_learning_goals(query)
        
        # Determine experience level
        experience = self._determine_experience_level(query, user_role)
        
        return {
            **observation,
            "goals": goals,
            "experience_level": experience,
            "time_horizon": self._extract_time_horizon(query),
            "career_focus": self._extract_career_focus(query),
            "user_role": user_role
        }
    
    def _extract_learning_goals(self, query: str) -> List[str]:
        """Extract learning goals from query"""
        goal_keywords = {
            "backend": ["backend", "server", "api", "database", "node", "python", "java"],
            "frontend": ["frontend", "ui", "ux", "react", "vue", "angular", "javascript"],
            "fullstack": ["fullstack", "full stack", "both"],
            "ai": ["ai", "artificial intelligence", "machine learning", "ml", "deep learning", "llm"],
            "data": ["data science", "data analysis", "analytics", "data engineering"],
            "devops": ["devops", "deployment", "cloud", "docker", "kubernetes", "ci/cd"],
            "mobile": ["mobile", "android", "ios", "react native", "flutter", "swift"],
            "web3": ["web3", "blockchain", "smart contract", "crypto", "solidity"]
        }
        
        goals = []
        query_lower = query.lower()
        
        for goal, keywords in goal_keywords.items():
            if any(keyword in query_lower for keyword in keywords):
                goals.append(goal)
        
        return goals if goals else ["general"]
    
    def _determine_experience_level(self, query: str, user_role: UserRole) -> str:
        """Determine user experience level"""
        query_lower = query.lower()
        
        if any(word in query_lower for word in ["beginner", "start", "new", "first time", "zero"]):
            return "beginner"
        elif any(word in query_lower for word in ["intermediate", "some experience", "know basics", "familiar"]):
            return "intermediate"
        elif any(word in query_lower for word in ["advanced", "expert", "senior", "professional", "experienced"]):
            return "advanced"
        else:
            # Default based on role
            if user_role == UserRole.STUDENT:
                return "beginner"
            elif user_role == UserRole.DEVELOPER:
                return "intermediate"
            else:
                return "beginner"
    
    def _extract_time_horizon(self, query: str) -> str:
        """Extract learning time horizon"""
        query_lower = query.lower()
        
        if any(word in query_lower for word in ["quick", "fast", "soon", "immediately", "now", "week", "month"]):
            return "short_term"
        elif any(word in query_lower for word in ["3 months", "quarter", "few months", "medium"]):
            return "medium_term"
        elif any(word in query_lower for word in ["2026", "next year", "long term", "career", "year"]):
            return "long_term"
        else:
            return "medium_term"
    
    def _extract_career_focus(self, query: str) -> str:
        """Extract career focus"""
        query_lower = query.lower()
        
        if any(word in query_lower for word in ["job", "career", "hire", "employment", "work", "salary"]):
            return "career"
        elif any(word in query_lower for word in ["project", "build", "create", "make", "portfolio"]):
            return "projects"
        elif any(word in query_lower for word in ["learn", "understanding", "knowledge", "education", "curious"]):
            return "knowledge"
        else:
            return "balanced"
    
    async def reason(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Reason about learning recommendations"""
        goals = analysis["goals"]
        experience = analysis["experience_level"]
        time_horizon = analysis["time_horizon"]
        career_focus = analysis["career_focus"]
        
        # Get relevant trends for learning priorities
        trend_query = " ".join(goals)
        trend_results = await self.kb.search_trends(trend_query, config.AGENTS["tech_trend"]["search_limit"])
        
        # Filter trends based on experience level
        suitable_trends = []
        for trend in trend_results:
            learning_curve = trend.get('learning_curve', '').lower()
            
            if experience == "beginner" and learning_curve in ["low", "low-medium"]:
                suitable_trends.append(trend)
            elif experience == "intermediate" and learning_curve in ["low", "medium", "low-medium"]:
                suitable_trends.append(trend)
            elif experience == "advanced":
                suitable_trends.append(trend)  # All curves suitable for advanced
        
        # Get GitHub projects for practical learning
        github_query = " ".join(goals)
        github_results = await self.kb.search_github(github_query, 3)
        
        # Filter GitHub projects by difficulty
        suitable_projects = []
        for project in github_results:
            difficulty = project.get('difficulty', '').lower()
            
            if experience == "beginner" and difficulty == "beginner":
                suitable_projects.append(project)
            elif experience == "intermediate" and difficulty in ["beginner", "intermediate"]:
                suitable_projects.append(project)
            elif experience == "advanced":
                suitable_projects.append(project)  # All projects suitable
        
        # Build learning path
        learning_path = await self._build_learning_path(
            goals, experience, time_horizon, career_focus, suitable_trends, suitable_projects
        )
        
        # Calculate confidence
        confidence_factors = [
            len(suitable_trends) / 5,  # Up to 0.2
            len(suitable_projects) / 3,  # Up to 0.33
            0.3 if len(goals) > 0 else 0.1,
            0.1 if experience != "beginner" else 0.05  # More confidence with clearer experience level
        ]
        
        confidence = min(0.9, sum(confidence_factors))
        
        return {
            "status": "recommendations_generated",
            "analysis": analysis,
            "suitable_trends": suitable_trends[:3],
            "suitable_projects": suitable_projects[:2],
            "learning_path": learning_path,
            "confidence": confidence
        }
    
    async def _build_learning_path(self, goals, experience, time_horizon, career_focus, trends, projects):
        """Build structured learning path"""
        path = {
            "overview": "",
            "phases": {},
            "resources": [],
            "timeline": {}
        }
        
        # Build overview
        goal_text = ", ".join(goals) if goals else "general technology"
        path["overview"] = f"Personalized learning path for {experience} level focusing on {goal_text}"
        
        # Phase 1: Foundation (1-4 weeks)
        path["phases"]["phase_1"] = {
            "title": "Foundation Building",
            "duration": "1-4 weeks",
            "focus": "Core Concepts",
            "activities": []
        }
        
        if experience == "beginner":
            path["phases"]["phase_1"]["activities"] = [
                "Learn basic syntax and concepts",
                "Complete interactive tutorials",
                "Build simple console applications",
                "Understand debugging fundamentals"
            ]
        elif experience == "intermediate":
            path["phases"]["phase_1"]["activities"] = [
                "Review and solidify core concepts",
                "Explore advanced language features",
                "Study design patterns",
                "Practice algorithm problems"
            ]
        else:  # advanced
            path["phases"]["phase_1"]["activities"] = [
                "Deep dive into performance optimization",
                "Study system architecture patterns",
                "Master testing strategies",
                "Explore tooling and automation"
            ]
        
        # Phase 2: Practical Application (2-8 weeks)
        path["phases"]["phase_2"] = {
            "title": "Practical Application",
            "duration": "2-8 weeks",
            "focus": "Hands-on Projects",
            "activities": []
        }
        
        if projects:
            project_names = [p['name'] for p in projects[:2]]
            path["phases"]["phase_2"]["activities"] = [
                f"Study {project_names[0]} source code",
                "Contribute to open source issues",
                "Build a small portfolio project",
                "Practice code review and collaboration"
            ]
        else:
            path["phases"]["phase_2"]["activities"] = [
                "Build a complete portfolio project",
                "Implement industry-standard patterns",
                "Practice deployment and monitoring",
                "Document your learning journey"
            ]
        
        # Phase 3: Specialization (4-12 weeks)
        if time_horizon in ["medium_term", "long_term"]:
            path["phases"]["phase_3"] = {
                "title": "Specialization & Depth",
                "duration": "4-12 weeks",
                "focus": "Advanced Topics",
                "activities": []
            }
            
            if trends:
                tech_names = [t['technology'] for t in trends[:2]]
                path["phases"]["phase_3"]["activities"] = [
                    f"Master {tech_names[0]} for {goals[0] if goals else 'development'}",
                    "Build complex real-world applications",
                    "Learn related tools and ecosystem",
                    "Contribute meaningfully to open source"
                ]
        
        # Resources based on career focus
        path["resources"] = []
        
        if career_focus == "career":
            path["resources"].extend([
                "Industry blogs and newsletters",
                "Professional certification paths",
                "LinkedIn Learning/Coursera courses",
                "Tech interview preparation platforms"
            ])
        elif career_focus == "projects":
            path["resources"].extend([
                "Project-based tutorials",
                "GitHub trending repositories",
                "Documentation and API references",
                "Community forums (Stack Overflow, Reddit)"
            ])
        else:  # knowledge or balanced
            path["resources"].extend([
                "Official documentation",
                "Technical books and papers",
                "Conference talks and workshops",
                "Interactive learning platforms"
            ])
        
        # Add experience-specific resources
        if experience == "beginner":
            path["resources"].extend(["Interactive coding platforms", "Video tutorials", "Beginner-friendly communities"])
        elif experience == "intermediate":
            path["resources"].extend(["Advanced tutorials", "Code review platforms", "Tech newsletters"])
        else:  # advanced
            path["resources"].extend(["Research papers", "Source code analysis", "Architecture patterns"])
        
        # Timeline adjustment based on time horizon
        if time_horizon == "short_term":
            # Compress phases
            for phase in path["phases"].values():
                if "1-4" in phase["duration"]:
                    phase["duration"] = "1-2 weeks"
                elif "2-8" in phase["duration"]:
                    phase["duration"] = "2-3 weeks"
                elif "4-12" in phase["duration"]:
                    phase["duration"] = "3-4 weeks"
        
        elif time_horizon == "long_term":
            # Expand phases
            for phase in path["phases"].values():
                if "1-4" in phase["duration"]:
                    phase["duration"] = "2-6 weeks"
                elif "2-8" in phase["duration"]:
                    phase["duration"] = "4-12 weeks"
                elif "4-12" in phase["duration"]:
                    phase["duration"] = "8-16 weeks"
        
        return path
    
    async def respond(self, decision: Dict[str, Any]) -> Dict[str, Any]:
        """Generate learning recommendation response"""
        analysis = decision["reasoning"]["analysis"]
        learning_path = decision["reasoning"]["learning_path"]
        suitable_trends = decision["reasoning"]["suitable_trends"]
        suitable_projects = decision["reasoning"]["suitable_projects"]
        
        response_parts = []
        
        # Personalized header
        user_role = analysis["user_role"].value.replace("_", " ").title()
        experience = analysis["experience_level"]
        goals = analysis["goals"]
        
        response_parts.append(f"# 🎯 Personalized Learning Path")
        response_parts.append(f"\n*Tailored for **{experience}** {user_role} interested in **{', '.join(goals) if goals else 'technology'}***\n")
        
        # Learning strategy
        response_parts.append("## 📚 Learning Strategy")
        response_parts.append(f"\n**Career Focus**: {analysis['career_focus'].replace('_', ' ').title()}")
        response_parts.append(f"**Time Horizon**: {analysis['time_horizon'].replace('_', ' ').title()}")
        
        strategy_advice = {
            "career": [
                "• Focus on **industry-demanded skills**",
                "• Build a **strong portfolio** with relevant projects",
                "• Network through **open source contributions**",
                "• Prepare for **technical interviews**"
            ],
            "projects": [
                "• Prioritize **hands-on practice** over theory",
                "• Use **project-based learning** approach",
                "• Master **specific tools and frameworks**",
                "• Get **quick feedback loops**"
            ],
            "knowledge": [
                "• Build **strong conceptual understanding**",
                "• Explore **different approaches and paradigms**",
                "• Balance **theory and practice**",
                "• Follow **your curiosity**"
            ],
            "balanced": [
                "• Combine **practical skills** with **theoretical knowledge**",
                "• Build **portfolio** while understanding **fundamentals**",
                "• Balance **depth** and **breadth**",
                "• Stay **adaptive** to industry changes"
            ]
        }
        
        focus = analysis["career_focus"]
        for advice in strategy_advice.get(focus, strategy_advice["balanced"]):
            response_parts.append(advice)
        
        # Learning path phases
        response_parts.append("\n## 🗺️ Learning Journey")
        
        for phase_key, phase in learning_path["phases"].items():
            response_parts.append(f"\n### {phase['title']} ({phase['duration']})")
            response_parts.append(f"**Focus**: {phase['focus']}")
            for i, activity in enumerate(phase['activities'], 1):
                response_parts.append(f"{i}. {activity}")
        
        # Recommended technologies
        if suitable_trends:
            response_parts.append("\n## 🚀 Recommended Technologies")
            
            for trend in suitable_trends:
                position = trend.get('radar_position', 'Assess')
                learning_reason = self._generate_learning_reason(trend, experience)
                
                response_parts.append(f"\n**{trend['technology']}** ({position})")
                response_parts.append(f"*Why learn*: {learning_reason}")
                
                if trend.get('use_cases'):
                    response_parts.append(f"*Best for*: {', '.join(trend['use_cases'][:3])}")
        
        # Recommended projects
        if suitable_projects:
            response_parts.append("\n## 💻 Recommended Projects")
            
            for project in suitable_projects:
                response_parts.append(f"\n**{project['name']}**")
                response_parts.append(f"*Learning value*: {project.get('learning_value', 'Great for practical learning')}")
                
                if project.get('topics'):
                    response_parts.append(f"*Topics*: {', '.join(project['topics'][:3])}")
        
        # Learning resources
        response_parts.append("\n## 📖 Recommended Resources")
        
        for i, resource in enumerate(learning_path["resources"][:5], 1):
            response_parts.append(f"{i}. {resource}")
        
        # Weekly commitment
        response_parts.append("\n## ⏱️ Suggested Commitment")
        
        time_horizon = analysis["time_horizon"]
        if time_horizon == "short_term":
            response_parts.append("**Intensive Learning (4-6 weeks):**")
            response_parts.append("• 15-20 hours per week")
            response_parts.append("• Focused, project-driven approach")
            response_parts.append("• Daily practice and review")
        elif time_horizon == "medium_term":
            response_parts.append("**Sustainable Learning (3-6 months):**")
            response_parts.append("• 8-12 hours per week")
            response_parts.append("• Balance theory and practice")
            response_parts.append("• Weekly progress reviews")
        else:  # long_term
            response_parts.append("**Career Development (6-12 months):**")
            response_parts.append("• 5-10 hours per week (consistent)")
            response_parts.append("• Deep specialization focus")
            response_parts.append("• Monthly milestone reviews")
        
        response_parts.append("\n> 💡 **Remember**: Consistency beats intensity. Regular practice with clear goals leads to mastery!")
        
        content = "\n".join(response_parts)
        
        return {
            "content": content,
            "confidence": decision["reasoning"]["confidence"],
            "suggested_questions": [
                "What projects should I build first?",
                "How do I know when I'm ready for the next level?",
                "Show me job trends for these skills"
            ],
            "metadata": {
                "goals": goals,
                "experience_level": experience,
                "time_horizon": analysis["time_horizon"],
                "career_focus": analysis["career_focus"],
                "phases_count": len(learning_path["phases"]),
                "trends_recommended": len(suitable_trends),
                "projects_recommended": len(suitable_projects)
            }
        }
    
    def _generate_learning_reason(self, trend: Dict, experience: str) -> str:
        """Generate reason for learning a technology"""
        position = trend.get('radar_position', 'Assess')
        learning_curve = trend.get('learning_curve', '').lower()
        
        reasons = []
        
        if position == "Adopt":
            reasons.append("Industry standard with proven track record")
        elif position == "Trial":
            reasons.append("Growing adoption with future potential")
        elif position == "Assess":
            reasons.append("Emerging technology worth monitoring")
        
        if learning_curve == "low" and experience == "beginner":
            reasons.append("Beginner-friendly with good resources")
        elif learning_curve == "high" and experience == "advanced":
            reasons.append("High-skill advantage in the market")
        
        if trend.get('market_demand', '').lower() == "very high":
            reasons.append("High market demand")
        
        if trend.get('growth_rate', 0) > 0.3:
            reasons.append("Rapid growth in adoption")
        
        return ". ".join(reasons) if reasons else "Good learning opportunity based on current trends"