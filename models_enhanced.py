
from sqlalchemy import Column, Integer, String, DateTime, Text, Float, JSON
from backend.database import Base
import datetime

class News(Base):
    __tablename__ = 'news'
    
    # Original fields
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    url = Column(String, nullable=False, unique=True)
    excerpt = Column(String)
    image = Column(String)
    published_at = Column(DateTime, default=datetime.datetime.utcnow)
    source = Column(String)
    
    # AI-enhanced fields
    ai_summary = Column(Text)  # AI-generated summary
    key_points = Column(JSON)  # List of key points
    sentiment = Column(String)  # positive/negative/neutral
    topics = Column(JSON)  # List of topics/categories
    ai_confidence = Column(Float)  # Confidence score
    content_extracted = Column(Text)  # Full extracted article text
    
    # Engagement metrics
    view_count = Column(Integer, default=0)
    save_count = Column(Integer, default=0)
    share_count = Column(Integer, default=0)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
