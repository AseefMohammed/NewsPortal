from sqlalchemy import Column, Integer, String, DateTime
from database import Base
import datetime

class News(Base):
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
    key_points = Column(String)  # Store as JSON string or comma-separated
    sentiment = Column(String)
    topics = Column(String)      # Store as JSON string or comma-separated
    ai_confidence = Column(String)