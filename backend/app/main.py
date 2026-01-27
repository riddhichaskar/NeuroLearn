from fastapi import FastAPI, HTTPException, BackgroundTasks, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import asyncio
import uuid
import json
from datetime import datetime
from typing import List, Optional
import time

from .models import *
from .knowledge_base import KnowledgeBase
from .agents import *
from .config import config

# Initialize FastAPI app
app = FastAPI(
    title="NeuroLearn AI Assistant API",
    description="Agentic Learning Intelligence System for Developers, Students & Educators",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
kb = None
orchestrator = None
startup_time = time.time()

async def startup_event():
    """Initialize the application on startup"""
    global kb, orchestrator
    
    config.validate()
    
    # Initialize knowledge base
    kb = KnowledgeBase()
    await kb.initialize()
    
    # Initialize agents
    orchestrator = OrchestratorAgent(kb)
    
    # Register specialist agents
    if config.AGENTS["devnews"]["enabled"]:
        orchestrator.register_agent(DevNewsIntelligenceAgent(kb))
    
    if config.AGENTS["github"]["enabled"]:
        orchestrator.register_agent(GitHubIntelligenceAgent(kb))
    
    if config.AGENTS["tech_trend"]["enabled"]:
        orchestrator.register_agent(TechTrendReasoningAgent(kb))
    
    if config.AGENTS["learning"]["enabled"]:
        orchestrator.register_agent(LearningRecommendationAgent(kb))
    
    print("✅ NeuroLearn AI Assistant initialized successfully")

async def shutdown_event():
    """Cleanup on shutdown"""
    if kb:
        await kb.close()
    print("👋 NeuroLearn AI Assistant shutdown complete")

app.add_event_handler("startup", startup_event)
app.add_event_handler("shutdown", shutdown_event)

# Dependency to get knowledge base
async def get_knowledge_base():
    return kb

# Dependency to get orchestrator
async def get_orchestrator():
    return orchestrator

@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint - health check"""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        agents=[agent.value for agent in AgentType],
        uptime=time.time() - startup_time
    )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "agents_initialized": orchestrator is not None,
        "knowledge_base_loaded": kb.data_loaded if kb else False
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    background_tasks: BackgroundTasks,
    kb: KnowledgeBase = Depends(get_knowledge_base),
    orchestrator: OrchestratorAgent = Depends(get_orchestrator)
):
    """Main chat endpoint with agentic routing"""
    start_time = time.time()
    
    try:
        # Generate conversation ID if not provided
        conversation_id = request.conversation_id or str(uuid.uuid4())
        
        # Prepare context
        context = {
            "user_role": request.user_role,
            "conversation_id": conversation_id,
            "stream": request.stream
        }
        
        # Get conversation history
        if conversation_id:
            history = kb.get_conversation_history(conversation_id, limit=5)
            context["history"] = history
        
        # Save conversation
        kb.save_conversation(conversation_id, request.user_role)
        
        # Process through orchestrator
        result = await orchestrator.execute(request.message, context)
        
        # Create response
        agent_response = AgentResponse(
            content=result["response"]["content"],
            agent_type=result["agent_type"],
            confidence=result["response"]["confidence"],
            metadata={**result["response"]["metadata"], "conversation_id": conversation_id},
            suggested_questions=result["response"]["suggested_questions"],
            conversation_id=conversation_id
        )
        
        # Save user message
        user_message = {
            "id": str(uuid.uuid4()),
            "conversation_id": conversation_id,
            "content": request.message,
            "role": "user",
            "agent_type": None,
            "confidence": None,
            "metadata": {"user_role": request.user_role.value},
            "created_at": datetime.now().isoformat()
        }
        kb.save_message(user_message)
        
        # Save assistant response
        assistant_message = {
            "id": str(uuid.uuid4()),
            "conversation_id": conversation_id,
            "content": agent_response.content,
            "role": "assistant",
            "agent_type": agent_response.agent_type.value,
            "confidence": agent_response.confidence,
            "metadata": agent_response.metadata,
            "created_at": datetime.now().isoformat()
        }
        kb.save_message(assistant_message)
        
        processing_time = time.time() - start_time
        
        return ChatResponse(
            response=agent_response,
            processing_time=processing_time,
            timestamp=datetime.now()
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing request: {str(e)}"
        )

@app.post("/api/chat/stream")
async def chat_stream(
    request: ChatRequest,
    kb: KnowledgeBase = Depends(get_knowledge_base),
    orchestrator: OrchestratorAgent = Depends(get_orchestrator)
):
    """Streaming chat endpoint"""
    async def stream_response():
        conversation_id = request.conversation_id or str(uuid.uuid4())
        
        # Prepare context
        context = {
            "user_role": request.user_role,
            "conversation_id": conversation_id,
            "stream": True
        }
        
        # Save conversation
        kb.save_conversation(conversation_id, request.user_role)
        
        # Process through orchestrator
        result = await orchestrator.execute(request.message, context)
        
        response = result["response"]
        
        # Stream response in chunks (simulated for demo)
        chunks = response["content"].split('\n')
        for chunk in chunks:
            if chunk.strip():
                yield f"data: {json.dumps({'type': 'content', 'chunk': chunk})}\n\n"
                await asyncio.sleep(0.05)  # Simulate typing
        
        # Stream metadata
        yield f"data: {json.dumps({'type': 'metadata', 'agent': result['agent_type'].value, 'confidence': response['confidence']})}\n\n"
        
        # Stream suggested questions
        for question in response["suggested_questions"]:
            yield f"data: {json.dumps({'type': 'suggestion', 'question': question})}\n\n"
        
        yield f"data: {json.dumps({'type': 'complete'})}\n\n"
        
        # Save messages
        user_message = {
            "id": str(uuid.uuid4()),
            "conversation_id": conversation_id,
            "content": request.message,
            "role": "user",
            "agent_type": None,
            "confidence": None,
            "metadata": {"user_role": request.user_role.value},
            "created_at": datetime.now().isoformat()
        }
        kb.save_message(user_message)
        
        assistant_message = {
            "id": str(uuid.uuid4()),
            "conversation_id": conversation_id,
            "content": response["content"],
            "role": "assistant",
            "agent_type": result["agent_type"].value,
            "confidence": response["confidence"],
            "metadata": response["metadata"],
            "created_at": datetime.now().isoformat()
        }
        kb.save_message(assistant_message)
    
    return StreamingResponse(
        stream_response(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@app.get("/api/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    limit: int = Query(20, ge=1, le=100),
    kb: KnowledgeBase = Depends(get_knowledge_base)
):
    """Get conversation history"""
    history = kb.get_conversation_history(conversation_id, limit)
    
    return {
        "conversation_id": conversation_id,
        "messages": history,
        "count": len(history),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/agents/status")
async def get_agents_status(orchestrator: OrchestratorAgent = Depends(get_orchestrator)):
    """Get status of all agents"""
    agents_status = []
    
    for agent_type, agent in orchestrator.specialist_agents.items():
        agents_status.append({
            "agent_type": agent_type.value,
            "status": "active",
            "requests_processed": agent.requests_processed,
            "last_active": datetime.now().isoformat()
        })
    
    return {
        "orchestrator": {
            "status": "active",
            "requests_processed": orchestrator.requests_processed,
            "registered_agents": len(orchestrator.specialist_agents),
            "last_active": datetime.now().isoformat()
        },
        "specialist_agents": agents_status,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/knowledge/stats")
async def get_knowledge_stats(kb: KnowledgeBase = Depends(get_knowledge_base)):
    """Get knowledge base statistics"""
    if not kb.data_loaded:
        raise HTTPException(status_code=503, detail="Knowledge base not loaded")
    
    return {
        "devnews": {
            "count": len(kb.devnews_data),
            "categories": list(set(item.get('category', '') for item in kb.devnews_data))
        },
        "github": {
            "count": len(kb.github_data),
            "languages": list(set(item.get('language', '') for item in kb.github_data))
        },
        "trends": {
            "count": len(kb.trends_data),
            "radar_positions": list(set(item.get('radar_position', '') for item in kb.trends_data))
        },
        "timestamp": datetime.now().isoformat()
    }

@app.delete("/api/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """Delete a conversation (placeholder - implement with actual DB)"""
    return {
        "status": "success",
        "message": f"Conversation {conversation_id} marked for deletion",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/cleanup")
async def cleanup_old_conversations(
    days: int = Query(30, ge=1, le=365),
    kb: KnowledgeBase = Depends(get_knowledge_base)
):
    """Clean up old conversations"""
    kb.cleanup_old_conversations(days)
    
    return {
        "status": "success",
        "message": f"Cleaned up conversations older than {days} days",
        "timestamp": datetime.now().isoformat()
    }

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": f"Internal server error: {str(exc)}",
            "timestamp": datetime.now().isoformat()
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=config.HOST,
        port=config.PORT,
        reload=config.DEBUG,
        log_level="info" if config.DEBUG else "warning"
    )