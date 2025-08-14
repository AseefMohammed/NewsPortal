app = FastAPI(title="NewsPortal API v2.0", description="Enhanced AI-Powered News Portal API", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ...existing code...

# Mobile health check endpoint
@app.get("/test")
async def test_endpoint():
    return {"message": "Backend is working!", "status": "success"}
"""
Enhanced Main Application with AI-Powered News Aggregation
Modern FastAPI application with comprehensive news processing capabilities
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import asyncio
import logging
from datetime import datetime
import uvicorn
import os

# Import our modules
from database import engine, get_db, Base
from enhanced_models import NewsArticle, UserInteraction, NewsSource, TrendingTopic
from enhanced_api_routes import router as enhanced_api_router
from modern_news_aggregator import ModernNewsAggregator, fetch_and_update_news
from ai_service import get_ai_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Background task for periodic news updates
background_tasks_running = False

async def periodic_news_update():
    """Background task to periodically fetch and update news"""
    global background_tasks_running
    background_tasks_running = True
    
    logger.info("Starting periodic news update background task")
    
    while background_tasks_running:
        try:
            logger.info("Running scheduled news update...")
            await fetch_and_update_news()
            logger.info("Scheduled news update completed")
            
            # Wait for 30 minutes before next update
            await asyncio.sleep(1800)
            
        except Exception as e:
            logger.error(f"Error in periodic news update: {e}")
            # Wait 5 minutes before retrying on error
            await asyncio.sleep(300)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting News Portal API v2.0")
    
    # Create database tables
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created/verified")
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
    
    # Initialize AI service
    try:
        ai_service = get_ai_service()
        logger.info("AI service initialized")
    except Exception as e:
        logger.error(f"AI service initialization error: {e}")
    
    # Start background tasks
    asyncio.create_task(periodic_news_update())
    
    # Run initial news fetch
    try:
        asyncio.create_task(fetch_and_update_news())
        logger.info("Initial news fetch initiated")
    except Exception as e:
        logger.error(f"Initial news fetch error: {e}")
    
    yield
    
    # Shutdown
    global background_tasks_running
    background_tasks_running = False
    logger.info("Shutting down News Portal API")

# Create FastAPI application
app = FastAPI(
    title="NewsPortal API",
    description="Advanced AI-Powered News Aggregation Platform",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Include enhanced API routes
app.include_router(enhanced_api_router)

# Static files (if needed)
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "NewsPortal API",
        "version": "2.0.0",
        "description": "Advanced AI-Powered News Aggregation Platform",
        "features": [
            "Multi-source news aggregation",
            "AI-powered summarization",
            "Sentiment analysis",
            "Real-time categorization",
            "Trending detection",
            "Personalized recommendations",
            "Advanced search capabilities"
        ],
        "endpoints": {
            "latest_news": "/api/v2/news/latest",
            "trending": "/api/v2/news/trending",
            "search": "/api/v2/news/search",
            "categories": "/api/v2/news/categories",
            "analytics": "/api/v2/news/analytics",
            "personalized": "/api/v2/news/personalized",
            "refresh": "/api/v2/news/refresh",
            "health": "/api/v2/news/health",
            "docs": "/docs"
        },
        "timestamp": datetime.now().isoformat()
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    """Comprehensive health check"""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0",
        "components": {}
    }
    
    # Check database
    try:
        from sqlalchemy import text
        db = next(get_db())
        db.execute(text("SELECT 1"))
        db.close()
        health_status["components"]["database"] = "healthy"
    except Exception as e:
        health_status["components"]["database"] = f"unhealthy: {str(e)}"
        health_status["status"] = "degraded"
    
    # Check AI service
    try:
        ai_service = get_ai_service()
        health_status["components"]["ai_service"] = "healthy"
    except Exception as e:
        health_status["components"]["ai_service"] = f"unhealthy: {str(e)}"
        health_status["status"] = "degraded"
    
    # Check background tasks
    health_status["components"]["background_tasks"] = "running" if background_tasks_running else "stopped"
    
    return health_status

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.status_code,
                "message": exc.detail,
                "timestamp": datetime.now().isoformat(),
                "path": str(request.url)
            }
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """General exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": 500,
                "message": "Internal server error",
                "timestamp": datetime.now().isoformat(),
                "path": str(request.url)
            }
        }
    )

# Middleware for request logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests"""
    start_time = datetime.now()
    
    response = await call_next(request)
    
    process_time = (datetime.now() - start_time).total_seconds()
    
    logger.info(
        f"{request.method} {request.url} - "
        f"Status: {response.status_code} - "
        f"Time: {process_time:.3f}s"
    )
    
    return response

# Legacy endpoints for backward compatibility
@app.get("/news")
async def get_news_legacy(db=Depends(get_db)):
    """Legacy news endpoint for backward compatibility"""
    try:
        articles = db.query(NewsArticle).order_by(NewsArticle.published_at.desc()).limit(20).all()
        
        legacy_format = []
        for article in articles:
            legacy_format.append({
                "id": article.id,
                "title": article.title,
                "url": article.url,
                "excerpt": article.description,
                "image": article.image_url,
                "published_at": article.published_at.isoformat() if article.published_at else None,
                "source": article.source_name,
                "category": article.category,
                "ai_summary": article.ai_summary
            })
            
        return legacy_format
        
    except Exception as e:
        logger.error(f"Legacy news endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Development configuration
if __name__ == "__main__":
    # Development server configuration
    config = {
        "host": "0.0.0.0",
        "port": 8000,
        "log_level": "info",
        "reload": True,  # Enable auto-reload in development
        "workers": 1     # Single worker for development
    }
    
    logger.info("Starting NewsPortal API in development mode")
    uvicorn.run("enhanced_main:app", **config)
else:
    # Production configuration for Render and similar platforms
    port = int(os.environ.get("PORT", 8000))
    logger.info(f"NewsPortal API loaded for production on port {port}")
    # Do not call uvicorn.run() here; start the server via CLI or external process
