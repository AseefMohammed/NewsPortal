from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import News
from news_fetcher import fetch_and_store_news
from typing import List
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
import threading
import time
import os

app = FastAPI(title="NewsPortal API", description="AI-Powered News Portal API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def background_news_fetcher():
    while True:
        try:
            db = SessionLocal()
            fetch_and_store_news(db)
            db.close()
            print("Background news fetch completed")
        except Exception as e:
            print(f"Background news fetch error: {e}")
        time.sleep(3600)

@app.on_event("startup")
async def startup_event():
    thread = threading.Thread(target=background_news_fetcher, daemon=True)
    thread.start()
    print("Background news fetcher started")

class NewsOut(BaseModel):
    title: str
    url: str
    excerpt: str = None
    image: str = None
    published_at: str
    source: str = None
    class Config:
        orm_mode = True

@app.get("/api/test")
def api_test_endpoint():
    return {
        "message": "NewsPortal API is working!",
        "status": "online",
        "ai_enabled": False,  # Disabled for fast deployment
        "endpoints": {
            "news": "/api/news",
            "ai_summary": "Available after installing AI dependencies",
            "ai_sentiment": "Available after installing AI dependencies", 
            "ai_trending": "Available after installing AI dependencies"
        }
    }

@app.get("/test")
def test_endpoint():
    return {"message": "Backend is working!"}

@app.get("/debug")
def debug_database(db: Session = Depends(get_db)):
    try:
        # Test database connection
        db.execute(text("SELECT 1"))
        
        # Get news count
        news_count = db.query(News).count()
        
        # Get latest news
        latest_news = db.query(News).order_by(News.id.desc()).limit(3).all()
        
        return {
            "database_status": "Connected",
            "news_count": news_count,
            "latest_news": [
                {
                    "id": news.id,
                    "title": news.title[:50] + "..." if len(news.title) > 50 else news.title,
                    "source": news.source,
                    "published_at": str(news.published_at)
                } for news in latest_news
            ],
            "ai_status": "Disabled for fast deployment"
        }
    except Exception as e:
        return {
            "database_status": "Error",
            "error": str(e)
        }

@app.get("/api/news", response_model=List[NewsOut])
def get_news(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    try:
        news = db.query(News).order_by(News.published_at.desc()).offset(skip).limit(limit).all()
        return news
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/news/{news_id}", response_model=NewsOut)
def get_news_item(news_id: int, db: Session = Depends(get_db)):
    try:
        news_item = db.query(News).filter(News.id == news_id).first()
        if not news_item:
            return {"error": "News item not found"}
        return news_item
    except Exception as e:
        return {"error": str(e)}

# Simple AI mock endpoints for now
@app.get("/api/ai/trending")
def get_trending_news(db: Session = Depends(get_db)):
    """Mock trending endpoint - returns recent news"""
    try:
        trending = db.query(News).order_by(News.published_at.desc()).limit(10).all()
        return {
            "status": "success",
            "trending_news": [
                {
                    "id": news.id,
                    "title": news.title,
                    "url": news.url,
                    "excerpt": news.excerpt,
                    "source": news.source,
                    "published_at": str(news.published_at),
                    "trend_score": "Mock score - install AI dependencies for real analysis"
                } for news in trending
            ],
            "ai_note": "Install AI dependencies for advanced trending analysis"
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/ai/summary")
def summarize_text(text: dict):
    """Mock summary endpoint"""
    return {
        "summary": f"Mock summary of: {text.get('text', '')[:100]}... [Install AI dependencies for real summarization]",
        "ai_note": "Install transformers and torch for real AI summarization"
    }

@app.post("/api/ai/sentiment")
def analyze_sentiment(text: dict):
    """Mock sentiment endpoint"""
    return {
        "sentiment": "neutral",
        "confidence": 0.5,
        "ai_note": "Install AI dependencies for real sentiment analysis"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
