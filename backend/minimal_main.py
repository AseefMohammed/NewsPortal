from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="NewsPortal API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ultra-minimal mock data with proper structure
NEWS = [
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

# Root endpoint
@app.get("/")
def root(): 
    return {"message": "NewsPortal API", "status": "online", "endpoints": ["/api/test", "/api/news", "/api/ai/trending"]}

# API test endpoints
@app.get("/api/test")
def api_test(): 
    return {"message": "NewsPortal API Online!", "status": "success", "deployment": "ultra-fast", "news_count": len(NEWS)}

@app.get("/test")  # Mobile app also calls this endpoint
def simple_test(): 
    return {"message": "NewsPortal API Working!", "deployment": "instant", "status": "success"}

# News endpoints
@app.get("/api/news")
def get_news(): 
    return NEWS

@app.get("/news")  # Mobile app calls this endpoint
def get_news_mobile(limit: int = None):
    if limit:
        return NEWS[:limit]
    return NEWS

@app.get("/api/news/{news_id}")
def get_news_by_id(news_id: int):
    for news_item in NEWS:
        if news_item["id"] == news_id:
            return news_item
    return {"error": "News item not found"}

# AI endpoints  
@app.get("/api/ai/trending")
def get_trending(): 
    return {
        "trending_news": NEWS[:3], 
        "status": "success", 
        "deployment": "instant",
        "message": "Mock trending data - production ready!"
    }

@app.post("/api/ai/summary")
def summarize_text(data: dict):
    text = data.get("text", "")
    return {
        "summary": f"Quick AI summary: {text[:100]}{'...' if len(text) > 100 else ''}",
        "method": "mock",
        "deployment": "ultra-fast"
    }

@app.post("/api/ai/sentiment")
def analyze_sentiment(data: dict):
    return {
        "sentiment": "positive",
        "confidence": 0.85,
        "deployment": "ultra-fast",
        "method": "mock"
    }

# Debug endpoint
@app.get("/debug")
def debug(): 
    return {
        "status": "Live and working!", 
        "news_count": len(NEWS), 
        "deployment": "ultra-fast",
        "api_endpoints": [
            "/api/test",
            "/api/news", 
            "/api/news/{id}",
            "/api/ai/trending",
            "/api/ai/summary",
            "/api/ai/sentiment"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
