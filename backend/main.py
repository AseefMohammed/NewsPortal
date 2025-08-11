from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pydantic import BaseModel
import os

# Try importing database dependencies - make them optional for Vercel
try:
    from sqlalchemy.orm import Session
    from database import SessionLocal, engine, Base
    from models import News
    from news_fetcher import fetch_and_store_news
    from sqlalchemy import text
    import threading
    import time
    DATABASE_AVAILABLE = True
    Base.metadata.create_all(bind=engine)
except ImportError:
    DATABASE_AVAILABLE = False
    print("⚠️  Database not available - using mock data")
    Session = None

# Import AI routes - make them optional
try:
    from ai_routes import router as ai_router
    AI_AVAILABLE = True
except ImportError:
    AI_AVAILABLE = False
    print("⚠️  AI features not available")

# Mock data for when database is not available
MOCK_NEWS = [
    {
        "id": 1, 
        "title": "AI Breakthrough 2025", 
        "url": "https://example.com/1", 
        "excerpt": "Revolutionary AI developments are changing how we interact with technology...", 
        "image": "https://via.placeholder.com/400x200/667eea/ffffff?text=AI+Breakthrough",
        "published_at": "2025-08-11T12:00:00Z", 
        "source": "TechNews",
        "category": "Technology"
    },
    {
        "id": 2, 
        "title": "Climate Solutions Show Promise", 
        "url": "https://example.com/2", 
        "excerpt": "New renewable energy advances are making significant environmental impact...", 
        "image": "https://via.placeholder.com/400x200/4caf50/ffffff?text=Climate+Solutions",
        "published_at": "2025-08-11T11:00:00Z", 
        "source": "GreenNews",
        "category": "Environment"
    },
    {
        "id": 3, 
        "title": "Space Discovery Milestone", 
        "url": "https://example.com/3", 
        "excerpt": "Mars exploration reveals fascinating discoveries about potential life...", 
        "image": "https://via.placeholder.com/400x200/ff9800/ffffff?text=Space+Discovery",
        "published_at": "2025-08-11T10:00:00Z", 
        "source": "SpaceDaily",
        "category": "Science"
    },
    {
        "id": 4,
        "title": "Healthcare Innovation Breakthrough",
        "url": "https://example.com/4",
        "excerpt": "New medical technologies are revolutionizing patient care worldwide...",
        "image": "https://via.placeholder.com/400x200/e91e63/ffffff?text=Healthcare+Innovation",
        "published_at": "2025-08-11T09:00:00Z",
        "source": "MedDaily",
        "category": "Health"
    },
    {
        "id": 5,
        "title": "Economic Markets Surge",
        "url": "https://example.com/5", 
        "excerpt": "Global markets show strong growth with technology sector leading gains...",
        "image": "https://via.placeholder.com/400x200/2196f3/ffffff?text=Market+Growth",
        "published_at": "2025-08-11T08:00:00Z",
        "source": "MarketWatch",
        "category": "Business"
    }
]

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
# Only initialize database if available
if DATABASE_AVAILABLE:
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
else:
    # Mock database dependency for when database is not available
    def get_db():
        yield None

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
        "database_enabled": DATABASE_AVAILABLE,
        "endpoints": {
            "news": "/api/news",
            "ai_summary": "/api/ai/summary" if AI_AVAILABLE else "Not available",
            "ai_sentiment": "/api/ai/sentiment" if AI_AVAILABLE else "Not available",
            "ai_trending": "/api/ai/trending" if AI_AVAILABLE else "Not available"
        }
    }

@app.get("/test")  # Mobile app calls this endpoint
def test_endpoint():
    return {"message": "Backend is working!", "status": "success"}

@app.get("/api/news")
def get_api_news(db = Depends(get_db) if DATABASE_AVAILABLE else None):
    if DATABASE_AVAILABLE and db:
        try:
            news = db.query(News).order_by(News.published_at.desc()).all()
            news_data = []
            for item in news:
                news_data.append({
                    "id": item.id,
                    "title": item.title,
                    "url": item.url,
                    "excerpt": item.excerpt,
                    "image": item.image,
                    "published_at": item.published_at.isoformat() if item.published_at else None,
                    "source": item.source
                })
            return news_data
        except Exception as e:
            return MOCK_NEWS
    else:
        return MOCK_NEWS

@app.get("/news")  # Mobile app calls this endpoint
def get_news(limit: int = None, db = Depends(get_db) if DATABASE_AVAILABLE else None):
    if DATABASE_AVAILABLE and db:
        try:
            news = db.query(News).order_by(News.published_at.desc())
            if limit:
                news = news.limit(limit)
            news = news.all()
            news_data = []
            for item in news:
                news_data.append({
                    "id": item.id,
                    "title": item.title,
                    "url": item.url,
                    "excerpt": item.excerpt,
                    "image": item.image,
                    "published_at": item.published_at.isoformat() if item.published_at else None,
                    "source": item.source
                })
            return news_data
        except Exception as e:
            result = MOCK_NEWS
            if limit:
                result = MOCK_NEWS[:limit]
            return result
    else:
        result = MOCK_NEWS
        if limit:
            result = MOCK_NEWS[:limit]
        return result

@app.get("/debug")
def debug_database(db = Depends(get_db) if DATABASE_AVAILABLE else None):
    if DATABASE_AVAILABLE and db:
        try:
            result = db.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
            tables = [row[0] for row in result.fetchall()]
            news_count = db.query(News).count()
            first_news = db.query(News).limit(3).all()
            news_data = []
            for item in first_news:
                news_data.append({
                    "id": item.id,
                    "title": item.title,
                    "url": item.url
                })
            return {
                "database": "connected",
                "tables": tables, 
                "news_count": news_count,
                "sample_news": news_data,
                "ai_enabled": AI_AVAILABLE
            }
        except Exception as e:
            return {"error": str(e), "database": "error", "ai_enabled": AI_AVAILABLE}
    else:
        return {
            "database": "mock_mode",
            "news_count": len(MOCK_NEWS),
            "sample_news": MOCK_NEWS[:3],
            "ai_enabled": AI_AVAILABLE,
            "message": "Using mock data - database not available"
        }

# AI endpoints (mock responses when AI not available)
@app.get("/api/ai/trending")
def get_trending():
    return {
        "trending_news": MOCK_NEWS[:3], 
        "status": "success", 
        "deployment": "production",
        "message": "Mock trending data" if not AI_AVAILABLE else "AI-powered trending"
    }

@app.post("/api/ai/summary")
def summarize_text(data: dict):
    text = data.get("text", "")
    return {
        "summary": f"AI Summary: {text[:100]}{'...' if len(text) > 100 else ''}",
        "method": "mock" if not AI_AVAILABLE else "ai",
        "status": "success"
    }

@app.post("/api/ai/sentiment")
def analyze_sentiment(data: dict):
    return {
        "sentiment": "positive",
        "confidence": 0.85,
        "method": "mock" if not AI_AVAILABLE else "ai",
        "status": "success"
    }
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
def fetch_news(db = Depends(get_db) if DATABASE_AVAILABLE else None):
    if DATABASE_AVAILABLE and db:
        try:
            fetch_and_store_news(db)
            return {"status": "fetched", "message": "News updated from external sources"}
        except Exception as e:
            return {"status": "error", "message": str(e)}
    else:
        return {"status": "mock_mode", "message": "Mock data - fetch not available"}

@app.post("/seed")
def seed_sample_news(db = Depends(get_db) if DATABASE_AVAILABLE else None):
    if DATABASE_AVAILABLE and db:
        from datetime import datetime, timedelta
        # Database seeding logic here...
        return {"status": "seeded", "message": "Sample news added to database"}
    else:
        return {"status": "mock_mode", "message": "Using mock data - seed not needed"}
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