"""
Enhanced API Routes with AI-Powered Features
Modern news aggregation, AI summarization, and intelligent categorization
"""

from fastapi import APIRouter, HTTPException, Depends, Query, BackgroundTasks
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import asyncio
import logging

from database import get_db
from .enhanced_models import NewsArticle, UserInteraction, TrendingTopic, NewsSource
from modern_news_aggregator import ModernNewsAggregator
import openai

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize router
router = APIRouter(prefix="/api/v2", tags=["Enhanced News API"])

# Initialize news aggregator
news_aggregator = ModernNewsAggregator(openai_api_key="YOUR_OPENAI_KEY")  # Replace with actual key

# Mobile health check endpoint (router version)
@router.get("/test")
async def test_router_endpoint():
    """Mobile health check endpoint (router version)"""
    return {"message": "Backend is working! (router)", "status": "success"}

@router.get("/news/latest")
async def get_latest_news(
    db: Session = Depends(get_db),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    source: Optional[str] = None,
    sentiment: Optional[str] = Query(None, regex="^(positive|negative|neutral)$"),
    trending_only: bool = False
):
    """
    Get latest news with advanced filtering options
    """
    try:
        # Build query
        query = db.query(NewsArticle)
        
        # Apply filters
        if category and category != "all":
            query = query.filter(NewsArticle.category == category)
            
        if source:
            query = query.filter(NewsArticle.source_name.ilike(f"%{source}%"))
            
        if sentiment:
            if sentiment == "positive":
                query = query.filter(NewsArticle.sentiment_score > 0.1)
            elif sentiment == "negative":
                query = query.filter(NewsArticle.sentiment_score < -0.1)
            else:  # neutral
                query = query.filter(and_(
                    NewsArticle.sentiment_score >= -0.1,
                    NewsArticle.sentiment_score <= 0.1
                ))
                
        if trending_only:
            query = query.filter(NewsArticle.is_trending == True)
            
        # Order by published date
        articles = query.order_by(desc(NewsArticle.published_at)).limit(limit).all()
        
        # Format response
        formatted_articles = []
        for article in articles:
            formatted_articles.append({
                "id": article.id,
                "title": article.title,
                "description": article.description,
                "ai_summary": article.ai_summary,
                "url": article.url,
                "image_url": article.image_url,
                "published_at": article.published_at.isoformat() if article.published_at else None,
                "source_name": article.source_name,
                "author": article.author,
                "category": article.category,
                "sentiment_score": article.sentiment_score,
                "is_trending": article.is_trending,
                "created_at": article.created_at.isoformat()
            })
            
        return {
            "status": "success",
            "data": formatted_articles,
            "count": len(formatted_articles),
            "filters_applied": {
                "category": category,
                "source": source,
                "sentiment": sentiment,
                "trending_only": trending_only
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching latest news: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/news/categories")
async def get_news_categories(db: Session = Depends(get_db)):
    """
    Get available news categories with article counts
    """
    try:
        categories = db.query(
            NewsArticle.category,
            func.count(NewsArticle.id).label('count')
        ).group_by(NewsArticle.category).all()
        
        category_data = [
            {
                "name": cat.category,
                "count": cat.count,
                "display_name": cat.category.replace("_", " ").title()
            }
            for cat in categories
        ]
        
        return {
            "status": "success",
            "data": category_data
        }
        
    except Exception as e:
        logger.error(f"Error fetching categories: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/news/trending")
async def get_trending_news(
    db: Session = Depends(get_db),
    limit: int = Query(10, ge=1, le=50),
    hours: int = Query(24, ge=1, le=168)  # Last 1-168 hours
):
    """
    Get trending news from the specified time period
    """
    try:
        # Calculate time threshold
        time_threshold = datetime.now() - timedelta(hours=hours)
        
        # Get trending articles
        articles = db.query(NewsArticle).filter(
            and_(
                NewsArticle.is_trending == True,
                NewsArticle.published_at >= time_threshold
            )
        ).order_by(desc(NewsArticle.sentiment_score)).limit(limit).all()
        
        formatted_articles = []
        for article in articles:
            formatted_articles.append({
                "id": article.id,
                "title": article.title,
                "ai_summary": article.ai_summary,
                "url": article.url,
                "image_url": article.image_url,
                "published_at": article.published_at.isoformat() if article.published_at else None,
                "source_name": article.source_name,
                "category": article.category,
                "sentiment_score": article.sentiment_score
            })
            
        return {
            "status": "success",
            "data": formatted_articles,
            "count": len(formatted_articles),
            "time_range_hours": hours
        }
        
    except Exception as e:
        logger.error(f"Error fetching trending news: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/news/search")
async def search_news(
    q: str = Query(..., min_length=2),
    db: Session = Depends(get_db),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = None
):
    """
    Search news articles with intelligent matching
    """
    try:
        # Build search query
        query = db.query(NewsArticle)
        
        # Search in title, description, and content
        search_filter = or_(
            NewsArticle.title.ilike(f"%{q}%"),
            NewsArticle.description.ilike(f"%{q}%"),
            NewsArticle.ai_summary.ilike(f"%{q}%")
        )
        
        query = query.filter(search_filter)
        
        if category:
            query = query.filter(NewsArticle.category == category)
            
        # Order by relevance (simple implementation)
        articles = query.order_by(desc(NewsArticle.published_at)).limit(limit).all()
        
        formatted_articles = []
        for article in articles:
            # Calculate relevance score (simple implementation)
            relevance_score = 0
            title_lower = article.title.lower()
            q_lower = q.lower()
            
            if q_lower in title_lower:
                relevance_score += 10
            if q_lower in article.description.lower():
                relevance_score += 5
            if article.ai_summary and q_lower in article.ai_summary.lower():
                relevance_score += 3
                
            formatted_articles.append({
                "id": article.id,
                "title": article.title,
                "description": article.description,
                "ai_summary": article.ai_summary,
                "url": article.url,
                "image_url": article.image_url,
                "published_at": article.published_at.isoformat() if article.published_at else None,
                "source_name": article.source_name,
                "author": article.author,
                "category": article.category,
                "sentiment_score": article.sentiment_score,
                "relevance_score": relevance_score
            })
            
        # Sort by relevance score
        formatted_articles.sort(key=lambda x: x["relevance_score"], reverse=True)
        
        return {
            "status": "success",
            "data": formatted_articles,
            "count": len(formatted_articles),
            "query": q
        }
        
    except Exception as e:
        logger.error(f"Error searching news: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/news/refresh")
async def refresh_news(
    background_tasks: BackgroundTasks,
    category: Optional[str] = None,
    limit: int = Query(100, ge=10, le=500)
):
    """
    Trigger news refresh from all sources
    """
    try:
        # Add background task to fetch news
        background_tasks.add_task(fetch_news_background, category, limit)
        
        return {
            "status": "success",
            "message": "News refresh initiated in background",
            "estimated_completion": "2-5 minutes"
        }
        
    except Exception as e:
        logger.error(f"Error initiating news refresh: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def fetch_news_background(category: Optional[str] = None, limit: int = 100):
    """
    Background task to fetch news
    """
    try:
        db = next(get_db())
        
        # Fetch articles
        articles = await news_aggregator.fetch_news_from_all_sources(
            category=category,
            limit=limit
        )
        
        # Save to database with AI processing
        await news_aggregator.save_articles_to_db(articles, db)
        
        logger.info(f"Background news refresh completed. Processed {len(articles)} articles.")
        
    except Exception as e:
        logger.error(f"Error in background news fetch: {e}")
    finally:
        db.close()

@router.get("/news/analytics")
async def get_news_analytics(db: Session = Depends(get_db)):
    """
    Get news analytics and insights
    """
    try:
        # Basic statistics
        total_articles = db.query(func.count(NewsArticle.id)).scalar()
        
        # Articles by category
        category_stats = db.query(
            NewsArticle.category,
            func.count(NewsArticle.id).label('count')
        ).group_by(NewsArticle.category).all()
        
        # Sentiment distribution
        sentiment_stats = db.query(
            func.avg(NewsArticle.sentiment_score).label('avg_sentiment'),
            func.count(func.case([(NewsArticle.sentiment_score > 0.1, 1)])).label('positive_count'),
            func.count(func.case([(NewsArticle.sentiment_score < -0.1, 1)])).label('negative_count'),
            func.count(func.case([
                (and_(NewsArticle.sentiment_score >= -0.1, NewsArticle.sentiment_score <= 0.1), 1)
            ])).label('neutral_count')
        ).first()
        
        # Source distribution
        source_stats = db.query(
            NewsArticle.source_name,
            func.count(NewsArticle.id).label('count')
        ).group_by(NewsArticle.source_name).order_by(desc('count')).limit(10).all()
        
        # Recent activity (last 24 hours)
        yesterday = datetime.now() - timedelta(days=1)
        recent_articles = db.query(func.count(NewsArticle.id)).filter(
            NewsArticle.created_at >= yesterday
        ).scalar()
        
        return {
            "status": "success",
            "data": {
                "overview": {
                    "total_articles": total_articles,
                    "articles_last_24h": recent_articles,
                    "average_sentiment": float(sentiment_stats.avg_sentiment or 0)
                },
                "category_distribution": [
                    {"category": stat.category, "count": stat.count}
                    for stat in category_stats
                ],
                "sentiment_distribution": {
                    "positive": sentiment_stats.positive_count,
                    "negative": sentiment_stats.negative_count,
                    "neutral": sentiment_stats.neutral_count
                },
                "top_sources": [
                    {"source": stat.source_name, "count": stat.count}
                    for stat in source_stats
                ]
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching analytics: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/news/ai-summary/{article_id}")
async def regenerate_ai_summary(
    article_id: int,
    db: Session = Depends(get_db)
):
    """
    Regenerate AI summary for a specific article
    """
    try:
        # Get article
        article = db.query(NewsArticle).filter(NewsArticle.id == article_id).first()
        
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")
            
        # Generate new AI summary
        article_data = {
            "title": article.title,
            "description": article.description,
            "content": article.content
        }
        
        new_summary = await news_aggregator.generate_ai_summary(article_data)
        
        if new_summary:
            article.ai_summary = new_summary
            db.commit()
            
            return {
                "status": "success",
                "data": {
                    "article_id": article_id,
                    "new_summary": new_summary
                }
            }
        else:
            return {
                "status": "error",
                "message": "Could not generate AI summary"
            }
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error regenerating AI summary: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/news/personalized")
async def get_personalized_news(
    user_interests: str = Query(..., description="Comma-separated interests"),
    db: Session = Depends(get_db),
    limit: int = Query(20, ge=1, le=50)
):
    """
    Get personalized news based on user interests
    """
    try:
        interests = [interest.strip().lower() for interest in user_interests.split(",")]
        
        # Build query for personalized content
        query = db.query(NewsArticle)
        
        # Create conditions for each interest
        conditions = []
        for interest in interests:
            condition = or_(
                NewsArticle.title.ilike(f"%{interest}%"),
                NewsArticle.description.ilike(f"%{interest}%"),
                NewsArticle.category == interest.replace(" ", "_")
            )
            conditions.append(condition)
            
        if conditions:
            query = query.filter(or_(*conditions))
            
        # Order by published date and sentiment (prefer positive news)
        articles = query.order_by(
            desc(NewsArticle.sentiment_score),
            desc(NewsArticle.published_at)
        ).limit(limit).all()
        
        formatted_articles = []
        for article in articles:
            # Calculate personalization score
            personalization_score = 0
            for interest in interests:
                if interest in article.title.lower():
                    personalization_score += 10
                if interest in article.description.lower():
                    personalization_score += 5
                if article.category.replace("_", " ") == interest:
                    personalization_score += 15
                    
            formatted_articles.append({
                "id": article.id,
                "title": article.title,
                "description": article.description,
                "ai_summary": article.ai_summary,
                "url": article.url,
                "image_url": article.image_url,
                "published_at": article.published_at.isoformat() if article.published_at else None,
                "source_name": article.source_name,
                "category": article.category,
                "sentiment_score": article.sentiment_score,
                "personalization_score": personalization_score
            })
            
        # Sort by personalization score
        formatted_articles.sort(key=lambda x: x["personalization_score"], reverse=True)
        
        return {
            "status": "success",
            "data": formatted_articles,
            "count": len(formatted_articles),
            "user_interests": interests
        }
        
    except Exception as e:
        logger.error(f"Error fetching personalized news: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/news/health")
async def health_check():
    """
    API health check endpoint
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0",
        "features": [
            "AI-powered summarization",
            "Multi-source aggregation",
            "Sentiment analysis",
            "Real-time categorization",
            "Personalized recommendations"
        ]
    }
