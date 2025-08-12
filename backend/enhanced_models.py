"""
Enhanced Database Models with AI-Powered Features
Comprehensive news article model with AI analysis fields
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, Float, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import datetime

class NewsArticle(Base):
    """
    Enhanced news article model with AI capabilities
    """
    __tablename__ = 'news_articles'
    
    # Basic article information
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False, index=True)
    description = Column(Text)
    content = Column(Text)
    url = Column(String(1000), nullable=False, unique=True, index=True)
    image_url = Column(String(1000))
    
    # Publication information
    published_at = Column(DateTime, index=True)
    source_name = Column(String(200), index=True)
    author = Column(String(200))
    
    # Categorization
    category = Column(String(100), index=True, default='general')
    tags = Column(JSON)  # Store array of tags
    
    # AI-powered features
    ai_summary = Column(Text)  # AI-generated summary
    ai_summary_confidence = Column(Float, default=0.0)  # Confidence score 0-1
    key_points = Column(JSON)  # Extracted key points as array
    entities = Column(JSON)  # Named entities (people, places, organizations)
    keywords = Column(JSON)  # Extracted keywords with relevance scores
    
    # Sentiment analysis
    sentiment_score = Column(Float, default=0.0, index=True)  # -1 to 1
    sentiment_label = Column(String(20))  # positive, negative, neutral
    sentiment_confidence = Column(Float, default=0.0)
    
    # Content analysis
    reading_time_minutes = Column(Integer)  # Estimated reading time
    complexity_score = Column(Float)  # Text complexity score
    language = Column(String(10), default='en')
    
    # Engagement and trending
    is_trending = Column(Boolean, default=False, index=True)
    trending_score = Column(Float, default=0.0)
    engagement_score = Column(Float, default=0.0)
    
    # Quality metrics
    credibility_score = Column(Float, default=0.5)  # Source credibility
    fact_check_status = Column(String(20))  # verified, disputed, unknown
    
    # System fields
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    # Relationships
    interactions = relationship("UserInteraction", back_populates="article")
    bookmarks = relationship("UserBookmark", back_populates="article")

class UserInteraction(Base):
    """
    Track user interactions with articles for personalization
    """
    __tablename__ = 'user_interactions'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)  # Can be session ID or user ID
    article_id = Column(Integer, ForeignKey('news_articles.id'), nullable=False)
    
    # Interaction types
    interaction_type = Column(String(50), nullable=False)  # view, like, share, bookmark, etc.
    duration_seconds = Column(Integer)  # Time spent reading
    scroll_percentage = Column(Float)  # How much of article was scrolled
    
    # Context
    device_type = Column(String(50))  # mobile, desktop, tablet
    source_referrer = Column(String(200))  # How they found the article
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    article = relationship("NewsArticle", back_populates="interactions")

class UserBookmark(Base):
    """
    User bookmarks/saved articles
    """
    __tablename__ = 'user_bookmarks'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    article_id = Column(Integer, ForeignKey('news_articles.id'), nullable=False)
    
    # Bookmark details
    notes = Column(Text)  # User's personal notes
    tags = Column(JSON)  # User's custom tags
    folder = Column(String(100))  # Organization folder
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    article = relationship("NewsArticle", back_populates="bookmarks")

class NewsSource(Base):
    """
    Track news sources and their credibility
    """
    __tablename__ = 'news_sources'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, unique=True)
    domain = Column(String(200), nullable=False)
    
    # Source information
    description = Column(Text)
    country = Column(String(100))
    language = Column(String(10), default='en')
    category = Column(String(100))  # newspaper, magazine, blog, etc.
    
    # Credibility metrics
    credibility_score = Column(Float, default=0.5)  # 0-1 scale
    bias_rating = Column(String(50))  # left, center, right, mixed
    factual_reporting = Column(String(50))  # high, mixed, low
    
    # Activity tracking
    total_articles = Column(Integer, default=0)
    last_article_date = Column(DateTime)
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class TrendingTopic(Base):
    """
    Track trending topics and keywords
    """
    __tablename__ = 'trending_topics'
    
    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String(200), nullable=False, index=True)
    category = Column(String(100), index=True)
    
    # Trending metrics
    mention_count = Column(Integer, default=0)
    growth_rate = Column(Float, default=0.0)  # Percentage growth
    trend_score = Column(Float, default=0.0)
    
    # Geographic data
    region = Column(String(100))
    country_code = Column(String(10))
    
    # Time tracking
    first_seen = Column(DateTime, server_default=func.now())
    last_updated = Column(DateTime, server_default=func.now(), onupdate=func.now())
    peak_date = Column(DateTime)
    
    # Status
    is_active = Column(Boolean, default=True)

class AIAnalysisLog(Base):
    """
    Log AI analysis operations for monitoring and improvement
    """
    __tablename__ = 'ai_analysis_logs'
    
    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, ForeignKey('news_articles.id'))
    
    # Operation details
    operation_type = Column(String(100), nullable=False)  # summarization, sentiment, categorization
    model_used = Column(String(100))  # GPT-4, BART, VADER, etc.
    success = Column(Boolean, nullable=False)
    
    # Performance metrics
    processing_time_ms = Column(Integer)
    confidence_score = Column(Float)
    
    # Input/Output
    input_length = Column(Integer)
    output_length = Column(Integer)
    
    # Error tracking
    error_message = Column(Text)
    error_code = Column(String(50))
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())

class UserPreference(Base):
    """
    Store user preferences for personalization
    """
    __tablename__ = 'user_preferences'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, unique=True, index=True)
    
    # Content preferences
    preferred_categories = Column(JSON)  # Array of preferred categories
    blocked_sources = Column(JSON)  # Array of blocked source names
    preferred_languages = Column(JSON)  # Array of language codes
    
    # Reading preferences
    preferred_article_length = Column(String(20))  # short, medium, long
    show_ai_summaries = Column(Boolean, default=True)
    preferred_sentiment = Column(String(20))  # positive, neutral, all
    
    # Personalization settings
    enable_trending = Column(Boolean, default=True)
    enable_personalization = Column(Boolean, default=True)
    enable_notifications = Column(Boolean, default=False)
    
    # Geographic preferences
    preferred_regions = Column(JSON)  # Array of region/country codes
    timezone = Column(String(50))
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

# Legacy model for backward compatibility
class News(Base):
    """
    Legacy news model for backward compatibility
    """
    __tablename__ = 'news'
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    url = Column(String, nullable=False, unique=True)
    excerpt = Column(String)
    image = Column(String)
    published_at = Column(DateTime, default=datetime.datetime.utcnow)
    source = Column(String)
    category = Column(String)
    ai_summary = Column(String)
    key_points = Column(String)
    sentiment = Column(String)
    topics = Column(String)
    ai_confidence = Column(String)
