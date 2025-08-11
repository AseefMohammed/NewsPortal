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

# Import AI routes
try:
    from ai_routes import router as ai_router
    AI_AVAILABLE = True
except ImportError:
    AI_AVAILABLE = False
    print("⚠️  AI features not available. Install dependencies: pip install -r requirements_ai.txt")

app = FastAPI(title="NewsPortal API", description="AI-Powered News Portal API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include AI routes if available
if AI_AVAILABLE:
    app.include_router(ai_router, prefix="", tags=["AI Features"])
    print("🤖 AI features enabled!")
else:
    print("📰 Running in basic mode without AI features")

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
        "ai_enabled": AI_AVAILABLE,
        "endpoints": {
            "news": "/api/news",
            "ai_summary": "/api/ai/summary" if AI_AVAILABLE else "Not available",
            "ai_sentiment": "/api/ai/sentiment" if AI_AVAILABLE else "Not available",
            "ai_trending": "/api/ai/trending" if AI_AVAILABLE else "Not available"
        }
    }

@app.get("/test")
def test_endpoint():
    return {"message": "Backend is working!"}

@app.get("/debug")
def debug_database(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
        tables = [row[0] for row in result.fetchall()]
        news_count = db.query(News).count()
        first_news = db.query(News).limit(3).all()
        news_data = []
        for item in first_news:
            news_data.append({
                "id": item.id,
                "title": item.title[:50] + "..." if len(item.title) > 50 else item.title,
                "source": item.source
            })
        return {
            "tables": tables,
            "news_count": news_count,
            "first_news": news_data,
            "database_path": "backend/news.db"
        }
    except Exception as e:
        import traceback
        return {"error": str(e), "traceback": traceback.format_exc()}

@app.get("/news")
def get_news(db: Session = Depends(get_db)):
    try:
        news = db.query(News).order_by(News.published_at.desc()).all()
        # Trusted UAE and Middle East news domains and names
        UAE_DOMAINS = [
            'gulfnews.com', 'khaleejtimes.com', 'thenationalnews.com', 'wam.ae', 'arabianbusiness.com'
        ]
        UAE_NAMES = [
            'gulf news', 'khaleej times', 'the national', 'emirates news agency', 'arabian business'
        ]
        ME_DOMAINS = [
            'aljazeera.com', 'arabnews.com', 'aawsat.com', 'alarabiya.net', 'middleeasteye.net'
        ]
        ME_NAMES = [
            'al jazeera', 'arab news', 'asharq al-awsat', 'al arabiya', 'middle east eye'
        ]
        def get_domain(source):
            import re
            if not source:
                return ''
            # Try to extract domain from source string
            match = re.search(r"([\w.-]+\.[a-z]{2,})", source.lower())
            return match.group(1) if match else source.lower()
        def is_uae(item):
            domain = get_domain(item.source or item.url)
            source_str = (item.source or '').lower()
            return any(d in domain for d in UAE_DOMAINS) or any(n in source_str for n in UAE_NAMES)
        def is_me(item):
            domain = get_domain(item.source or item.url)
            source_str = (item.source or '').lower()
            return any(d in domain for d in ME_DOMAINS) or any(n in source_str for n in ME_NAMES)
        uae_news = []
        me_news = []
        other_news = []
        for item in news:
            if is_uae(item):
                uae_news.append(item)
            elif is_me(item):
                me_news.append(item)
            else:
                other_news.append(item)
        # Sort each group by recency (already sorted from DB)
        prioritized_news = uae_news + me_news + other_news
        news_list = []
        for item in prioritized_news:
            news_list.append({
                "id": item.id,
                "title": item.title,
                "excerpt": item.excerpt,
                "image": item.image,
                "published_at": str(item.published_at),
                "source": item.source,
                "category": getattr(item, 'category', None),
            })
        return news_list
    except Exception as e:
        import traceback
        print(f"Error fetching news: {e}")
        traceback.print_exc()
        return []

@app.post("/fetch")
def fetch_news(db: Session = Depends(get_db)):
    try:
        fetch_and_store_news(db)
        return {"status": "fetched"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/seed")
def seed_sample_news(db: Session = Depends(get_db)):
    from datetime import datetime, timedelta
    sample_news = [
        {
            "title": "Emirates NBD Reports Strong Q4 Performance",
            "url": "https://example.com/emirates-nbd-q4",
            "excerpt": "Emirates NBD has announced impressive Q4 results with 15% growth in digital transactions.",
            "image": "https://via.placeholder.com/300x200",
            "published_at": datetime.utcnow() - timedelta(hours=2),
            "source": "Gulf News"
        },
        {
            "title": "FAB Launches New Digital Banking Platform",
            "url": "https://example.com/fab-digital-platform",
            "excerpt": "First Abu Dhabi Bank introduces innovative digital banking solutions for SMEs.",
            "image": "https://via.placeholder.com/300x200",
            "published_at": datetime.utcnow() - timedelta(hours=4),
            "source": "The National"
        },
        {
            "title": "Dubai Islamic Bank Expands Crypto Services",
            "url": "https://example.com/dib-crypto",
            "excerpt": "DIB announces expansion of cryptocurrency trading services for retail customers.",
            "image": "https://via.placeholder.com/300x200",
            "published_at": datetime.utcnow() - timedelta(hours=6),
            "source": "Khaleej Times"
        }
    ]
    for news_data in sample_news:
        if not db.query(News).filter_by(url=news_data["url"]).first():
            news = News(**news_data)
            db.add(news)
    db.commit()
    return {"status": "seeded", "count": len(sample_news)} 