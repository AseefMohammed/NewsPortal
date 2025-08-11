#!/usr/bin/env python3

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import json
from typing import List, Dict, Any
import os

app = FastAPI(title="NewsPortal Backend", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database path
DB_PATH = "/Users/aseefmohammed/NewsPortal/backend/news.db"

@app.get("/")
async def root():
    return {"message": "NewsPortal Backend API"}

@app.get("/test")
async def test():
    return {"message": "Backend is working!"}

@app.get("/news")
async def get_news():
    """Get all news articles from the database"""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row  # This allows us to access columns by name
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, title, excerpt, image, published_at, source, category 
            FROM news 
            ORDER BY published_at DESC 
            LIMIT 100
        """)
        
        news_list = []
        for row in cursor.fetchall():
            news_item = {
                "id": row["id"],
                "title": row["title"],
                "excerpt": row["excerpt"],
                "image": row["image"],
                "published_at": row["published_at"],
                "source": row["source"],
                "category": row["category"]
            }
            news_list.append(news_item)
        
        conn.close()
        return news_list
        
    except Exception as e:
        return {"error": str(e), "message": "Failed to fetch news"}

@app.get("/news/categories")
async def get_categories():
    """Get all unique categories"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("SELECT DISTINCT category FROM news WHERE category IS NOT NULL")
        categories = [row[0] for row in cursor.fetchall()]
        
        conn.close()
        return {"categories": categories}
        
    except Exception as e:
        return {"error": str(e), "message": "Failed to fetch categories"}

@app.get("/news/search")
async def search_news(q: str = ""):
    """Search news articles by query"""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        search_query = f"%{q}%"
        cursor.execute("""
            SELECT id, title, excerpt, image, published_at, source, category 
            FROM news 
            WHERE title LIKE ? OR excerpt LIKE ?
            ORDER BY published_at DESC 
            LIMIT 50
        """, (search_query, search_query))
        
        news_list = []
        for row in cursor.fetchall():
            news_item = {
                "id": row["id"],
                "title": row["title"],
                "excerpt": row["excerpt"],
                "image": row["image"],
                "published_at": row["published_at"],
                "source": row["source"],
                "category": row["category"]
            }
            news_list.append(news_item)
        
        conn.close()
        return news_list
        
    except Exception as e:
        return {"error": str(e), "message": "Failed to search news"}

@app.get("/stats")
async def get_stats():
    """Get database statistics"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) as total FROM news")
        total = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(DISTINCT source) as sources FROM news")
        sources = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(DISTINCT category) as categories FROM news WHERE category IS NOT NULL")
        categories = cursor.fetchone()[0]
        
        conn.close()
        return {
            "total_articles": total,
            "total_sources": sources,
            "total_categories": categories,
            "status": "Database is healthy"
        }
        
    except Exception as e:
        return {"error": str(e), "message": "Failed to get stats"}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting NewsPortal Backend Server...")
    print(f"📊 Database: {DB_PATH}")
    print(f"🌐 Server: http://localhost:8001")
    
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")
