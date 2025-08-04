#!/usr/bin/env python3
"""
Script to enhance all news items in the database that are missing AI summaries.
Run this from the backend directory with the virtual environment activated.
"""

import asyncio
from backend.database import SessionLocal
from backend.models import News
from backend.ai_summarizer import AINewsSummarizer

async def enhance_missing_news():
    db = SessionLocal()
    summarizer = AINewsSummarizer()
    news_items = db.query(News).filter((News.ai_summary == None) | (News.ai_summary == "")).all()
    print(f"Found {len(news_items)} news items to enhance.")
    for news in news_items:
        print(f"Enhancing news id={news.id} title={news.title[:60]}")
        # Use excerpt or fallback to title
        article_text = news.excerpt or news.title
        result = await summarizer.summarize_article(article_text)
        news.ai_summary = result.get('summary')
        news.key_points = ', '.join(result.get('key_points', []))
        news.sentiment = result.get('sentiment')
        news.topics = ', '.join(result.get('topics', []))
        news.ai_confidence = str(result.get('confidence'))
        db.commit()
    db.close()
    print("Enhancement complete.")

if __name__ == "__main__":
    asyncio.run(enhance_missing_news())
