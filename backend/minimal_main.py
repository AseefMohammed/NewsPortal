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

# Ultra-minimal mock data
NEWS = [
    {"id": 1, "title": "AI Breakthrough 2025", "url": "https://example.com/1", "excerpt": "Revolutionary AI developments...", "published_at": "2025-08-11T12:00:00Z", "source": "TechNews"},
    {"id": 2, "title": "Climate Solutions", "url": "https://example.com/2", "excerpt": "New renewable energy advances...", "published_at": "2025-08-11T11:00:00Z", "source": "GreenNews"},
    {"id": 3, "title": "Space Discovery", "url": "https://example.com/3", "excerpt": "Mars exploration reveals...", "published_at": "2025-08-11T10:00:00Z", "source": "SpaceDaily"}
]

@app.get("/api/test")
def test(): return {"message": "NewsPortal API Online!", "status": "success", "deployment": "ultra-fast"}

@app.get("/test")  
def simple_test(): return {"message": "Working!", "deployment": "instant"}

@app.get("/api/news")
def news(): return NEWS

@app.get("/api/ai/trending")
def trending(): return {"trending_news": NEWS, "status": "mock", "deployment": "instant"}

@app.get("/debug")
def debug(): return {"status": "Live", "news_count": len(NEWS), "deployment": "ultra-fast"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
