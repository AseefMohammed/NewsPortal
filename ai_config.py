
"""
AI Configuration for NewsPortal
"""

import os
from typing import Dict, Any

class AIConfig:
    # Summarization Settings
    MAX_SUMMARY_LENGTH = int(os.getenv("MAX_SUMMARY_LENGTH", "150"))
    MIN_ARTICLE_LENGTH = 100

    # Sentiment Analysis
    SENTIMENT_THRESHOLD = float(os.getenv("SENTIMENT_THRESHOLD", "0.7"))

    # Topic Classification
    MIN_TOPIC_CONFIDENCE = 0.6
    MAX_TOPICS_PER_ARTICLE = 5

    # Caching
    CACHE_TTL = 3600  # 1 hour

    # Rate Limiting
    AI_REQUESTS_PER_MINUTE = 60
