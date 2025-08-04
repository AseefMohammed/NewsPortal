
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import News
from backend.ai_summarizer import AINewsSummarizer
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()
summarizer = AINewsSummarizer()

class NewsWithAI(BaseModel):
    id: int
    title: str
    url: str
    excerpt: Optional[str]
    image: Optional[str]
    published_at: str
    source: Optional[str]
    ai_summary: Optional[str]
    key_points: Optional[List[str]]
    sentiment: Optional[str]
    topics: Optional[List[str]]
    ai_confidence: Optional[float]

@router.get("/news/enhanced", response_model=List[NewsWithAI])
async def get_enhanced_news(
    limit: int = 50,
    topic: Optional[str] = None,
    sentiment: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get news with AI enhancements"""
    query = db.query(News)
    
    # Filter by topic if specified
    if topic:
        query = query.filter(News.topics.contains([topic]))
    
    # Filter by sentiment if specified
    if sentiment:
        query = query.filter(News.sentiment == sentiment)
    
    news_items = query.order_by(News.published_at.desc()).limit(limit).all()
    return news_items

@router.post("/news/{news_id}/enhance")
async def enhance_news_item(
    news_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Enhance a specific news item with AI"""
    news_item = db.query(News).filter(News.id == news_id).first()
    if not news_item:
        raise HTTPException(status_code=404, detail="News item not found")
    
    # Add background task for AI enhancement
    background_tasks.add_task(enhance_news_background, news_id, db)
    
    return {"status": "enhancement_started", "news_id": news_id}

async def enhance_news_background(news_id: int, db: Session):
    """Background task to enhance news with AI"""
    news_item = db.query(News).filter(News.id == news_id).first()
    if not news_item:
        return
    
    # Convert to dict for processing
    news_dict = {
        "title": news_item.title,
        "url": news_item.url,
        "excerpt": news_item.excerpt,
        "content": news_item.content_extracted
    }
    
    # Enhance with AI
    enhanced = await summarizer.enhance_news_item(news_dict)
    
    # Update database
    news_item.ai_summary = enhanced.get('ai_summary')
    news_item.key_points = enhanced.get('key_points')
    news_item.sentiment = enhanced.get('sentiment')
    news_item.topics = enhanced.get('topics')
    news_item.ai_confidence = enhanced.get('ai_confidence')
    
    db.commit()

@router.get("/news/topics")
async def get_trending_topics(db: Session = Depends(get_db)):
    """Get trending topics from AI analysis"""
    # This would require more complex aggregation
    # For now, return sample topics
    return {
        "trending_topics": [
            {"topic": "Technology", "count": 45},
            {"topic": "Finance", "count": 32},
            {"topic": "Healthcare", "count": 28},
            {"topic": "Politics", "count": 25}
        ]
    }

@router.get("/news/sentiment-analysis")
async def get_sentiment_analysis(db: Session = Depends(get_db)):
    """Get overall sentiment analysis of recent news"""
    from sqlalchemy import func
    
    sentiment_counts = db.query(
        News.sentiment,
        func.count(News.sentiment).label('count')
    ).filter(
        News.sentiment.isnot(None)
    ).group_by(News.sentiment).all()
    
    return {
        "sentiment_distribution": [
            {"sentiment": item.sentiment, "count": item.count}
            for item in sentiment_counts
        ]
    }
