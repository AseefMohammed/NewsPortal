"""
Enhanced News Aggregator with AI-Powered Features
Supports multiple news sources and AI-powered summarization
"""

import asyncio
import aiohttp
import hashlib
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from urllib.parse import urlparse
import re

import requests
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from database import get_db
from enhanced_models import NewsArticle
import openai
from transformers import pipeline
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModernNewsAggregator:
    """
    Advanced news aggregator with AI capabilities
    """
    
    def __init__(self, openai_api_key: Optional[str] = None):
        self.openai_api_key = openai_api_key
        if openai_api_key:
            openai.api_key = openai_api_key
            
        # Initialize sentiment analyzer
        try:
            nltk.download('vader_lexicon', quiet=True)
            self.sentiment_analyzer = SentimentIntensityAnalyzer()
        except:
            self.sentiment_analyzer = None
            
        # Initialize summarization pipeline
        try:
            self.summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
        except Exception as e:
            logger.warning(f"Could not initialize local summarizer: {e}")
            self.summarizer = None
            
        # News source configurations
        self.news_sources = {
            "newsapi": {
                "base_url": "https://newsapi.org/v2",
                "endpoints": {
                    "top_headlines": "/top-headlines",
                    "everything": "/everything",
                    "sources": "/sources"
                },
                "api_key_param": "apiKey"
            },
            "guardian": {
                "base_url": "https://content.guardianapis.com",
                "endpoints": {
                    "search": "/search",
                    "sections": "/sections"
                },
                "api_key_param": "api-key"
            },
            "nytimes": {
                "base_url": "https://api.nytimes.com/svc",
                "endpoints": {
                    "top_stories": "/topstories/v2",
                    "most_popular": "/mostpopular/v2",
                    "article_search": "/search/v2/articlesearch.json"
                },
                "api_key_param": "api-key"
            },
            "reddit": {
                "base_url": "https://www.reddit.com/r",
                "endpoints": {
                    "worldnews": "/worldnews",
                    "news": "/news",
                    "technology": "/technology"
                }
            }
        }
        
        # Categories and their keywords
        self.categories = {
            "technology": ["tech", "technology", "AI", "artificial intelligence", "software", "hardware", "startup", "innovation"],
            "business": ["business", "economy", "finance", "market", "stock", "investment", "trade", "corporate"],
            "politics": ["politics", "government", "election", "policy", "congress", "senate", "president", "minister"],
            "health": ["health", "medical", "medicine", "healthcare", "disease", "treatment", "vaccine", "wellness"],
            "science": ["science", "research", "study", "discovery", "experiment", "climate", "environment", "space"],
            "sports": ["sports", "football", "basketball", "soccer", "tennis", "olympics", "championship", "match"],
            "entertainment": ["entertainment", "movie", "music", "celebrity", "hollywood", "film", "television", "gaming"]
        }

    async def fetch_news_from_all_sources(self, 
                                        query: Optional[str] = None,
                                        category: Optional[str] = None,
                                        limit: int = 100) -> List[Dict[str, Any]]:
        """
        Fetch news from all configured sources
        """
        all_articles = []
        
        # Fetch from different sources concurrently
        tasks = [
            self.fetch_from_newsapi(query, category, limit//4),
            self.fetch_from_guardian(query, category, limit//4),
            self.fetch_from_reddit(category or "worldnews", limit//4),
            self.fetch_rss_feeds(limit//4)
        ]
        
        try:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for result in results:
                if isinstance(result, list):
                    all_articles.extend(result)
                elif isinstance(result, Exception):
                    logger.warning(f"Error fetching from source: {result}")
                    
        except Exception as e:
            logger.error(f"Error in concurrent news fetching: {e}")
            
        # Remove duplicates and sort by relevance
        unique_articles = self._remove_duplicates(all_articles)
        categorized_articles = self._categorize_articles(unique_articles)
        
        return categorized_articles[:limit]

    async def fetch_from_newsapi(self, query: Optional[str], category: Optional[str], limit: int) -> List[Dict]:
        """
        Fetch news from NewsAPI
        """
        articles = []
        api_key = "YOUR_NEWSAPI_KEY"  # Replace with actual API key
        
        if not api_key or api_key == "YOUR_NEWSAPI_KEY":
            return []
            
        try:
            async with aiohttp.ClientSession() as session:
                # Top headlines
                url = f"{self.news_sources['newsapi']['base_url']}/top-headlines"
                params = {
                    "apiKey": api_key,
                    "pageSize": limit,
                    "language": "en"
                }
                
                if category:
                    params["category"] = category
                if query:
                    params["q"] = query
                    
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        articles.extend(self._process_newsapi_articles(data.get("articles", [])))
                        
        except Exception as e:
            logger.error(f"Error fetching from NewsAPI: {e}")
            
        return articles

    async def fetch_from_guardian(self, query: Optional[str], category: Optional[str], limit: int) -> List[Dict]:
        """
        Fetch news from The Guardian API
        """
        articles = []
        api_key = "YOUR_GUARDIAN_API_KEY"  # Replace with actual API key
        
        if not api_key or api_key == "YOUR_GUARDIAN_API_KEY":
            return []
            
        try:
            async with aiohttp.ClientSession() as session:
                url = f"{self.news_sources['guardian']['base_url']}/search"
                params = {
                    "api-key": api_key,
                    "page-size": limit,
                    "show-fields": "headline,byline,thumbnail,short-url,bodyText",
                    "order-by": "newest"
                }
                
                if query:
                    params["q"] = query
                if category:
                    params["section"] = category
                    
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        articles.extend(self._process_guardian_articles(data.get("response", {}).get("results", [])))
                        
        except Exception as e:
            logger.error(f"Error fetching from Guardian: {e}")
            
        return articles

    async def fetch_from_reddit(self, subreddit: str, limit: int) -> List[Dict]:
        """
        Fetch news from Reddit
        """
        articles = []
        
        try:
            async with aiohttp.ClientSession() as session:
                url = f"{self.news_sources['reddit']['base_url']}/{subreddit}/hot.json"
                params = {"limit": limit}
                headers = {"User-Agent": "NewsPortal/1.0"}
                
                async with session.get(url, params=params, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        articles.extend(self._process_reddit_posts(data.get("data", {}).get("children", [])))
                        
        except Exception as e:
            logger.error(f"Error fetching from Reddit: {e}")
            
        return articles

    async def fetch_rss_feeds(self, limit: int) -> List[Dict]:
        """
        Fetch from various RSS feeds
        """
        rss_feeds = [
            "https://rss.cnn.com/rss/edition.rss",
            "https://feeds.bbci.co.uk/news/rss.xml",
            "https://www.reuters.com/rssFeed/topNews",
            "https://feeds.npr.org/1001/rss.xml"
        ]
        
        articles = []
        
        try:
            for feed_url in rss_feeds:
                try:
                    async with aiohttp.ClientSession() as session:
                        async with session.get(feed_url) as response:
                            if response.status == 200:
                                content = await response.text()
                                articles.extend(self._process_rss_feed(content, feed_url)[:limit//len(rss_feeds)])
                except Exception as e:
                    logger.warning(f"Error fetching RSS from {feed_url}: {e}")
                    
        except Exception as e:
            logger.error(f"Error in RSS fetching: {e}")
            
        return articles

    def _process_newsapi_articles(self, articles: List[Dict]) -> List[Dict]:
        """Process NewsAPI articles into standard format"""
        processed = []
        
        for article in articles:
            if not article.get("title") or article.get("title") == "[Removed]":
                continue
                
            processed.append({
                "title": article.get("title", ""),
                "description": article.get("description", ""),
                "content": article.get("content", ""),
                "url": article.get("url", ""),
                "image_url": article.get("urlToImage", ""),
                "published_at": article.get("publishedAt", ""),
                "source_name": article.get("source", {}).get("name", "NewsAPI"),
                "author": article.get("author", ""),
                "source_type": "newsapi"
            })
            
        return processed

    def _process_guardian_articles(self, articles: List[Dict]) -> List[Dict]:
        """Process Guardian articles into standard format"""
        processed = []
        
        for article in articles:
            fields = article.get("fields", {})
            processed.append({
                "title": article.get("webTitle", ""),
                "description": fields.get("headline", ""),
                "content": fields.get("bodyText", ""),
                "url": fields.get("short-url", article.get("webUrl", "")),
                "image_url": fields.get("thumbnail", ""),
                "published_at": article.get("webPublicationDate", ""),
                "source_name": "The Guardian",
                "author": fields.get("byline", ""),
                "source_type": "guardian"
            })
            
        return processed

    def _process_reddit_posts(self, posts: List[Dict]) -> List[Dict]:
        """Process Reddit posts into standard format"""
        processed = []
        
        for post in posts:
            post_data = post.get("data", {})
            
            # Only include posts with external URLs (news articles)
            if not post_data.get("url") or "reddit.com" in post_data.get("url", ""):
                continue
                
            processed.append({
                "title": post_data.get("title", ""),
                "description": post_data.get("selftext", "")[:500],
                "content": post_data.get("selftext", ""),
                "url": post_data.get("url", ""),
                "image_url": post_data.get("thumbnail", ""),
                "published_at": datetime.fromtimestamp(post_data.get("created_utc", 0)).isoformat(),
                "source_name": f"r/{post_data.get('subreddit', 'reddit')}",
                "author": post_data.get("author", ""),
                "source_type": "reddit",
                "upvotes": post_data.get("ups", 0),
                "comments": post_data.get("num_comments", 0)
            })
            
        return processed

    def _process_rss_feed(self, content: str, feed_url: str) -> List[Dict]:
        """Process RSS feed content"""
        processed = []
        
        try:
            soup = BeautifulSoup(content, 'xml')
            items = soup.find_all('item')
            
            source_name = urlparse(feed_url).netloc
            
            for item in items:
                title = item.find('title')
                description = item.find('description')
                link = item.find('link')
                pub_date = item.find('pubDate')
                
                processed.append({
                    "title": title.text if title else "",
                    "description": BeautifulSoup(description.text if description else "", 'html.parser').get_text()[:500],
                    "content": "",
                    "url": link.text if link else "",
                    "image_url": "",
                    "published_at": pub_date.text if pub_date else "",
                    "source_name": source_name,
                    "author": "",
                    "source_type": "rss"
                })
                
        except Exception as e:
            logger.error(f"Error processing RSS feed: {e}")
            
        return processed

    def _remove_duplicates(self, articles: List[Dict]) -> List[Dict]:
        """Remove duplicate articles based on title similarity"""
        unique_articles = []
        seen_titles = set()
        
        for article in articles:
            title = article.get("title", "").lower().strip()
            
            # Create a hash of the title for comparison
            title_hash = hashlib.md5(title.encode()).hexdigest()
            
            # Check for similar titles
            is_duplicate = False
            for seen_hash in seen_titles:
                # Simple similarity check - you could use more sophisticated methods
                if title_hash == seen_hash:
                    is_duplicate = True
                    break
                    
            if not is_duplicate and title:
                unique_articles.append(article)
                seen_titles.add(title_hash)
                
        return unique_articles

    def _categorize_articles(self, articles: List[Dict]) -> List[Dict]:
        """Categorize articles based on content"""
        for article in articles:
            category = self._determine_category(article)
            article["category"] = category
            
            # Add sentiment analysis
            if self.sentiment_analyzer:
                sentiment = self._analyze_sentiment(article)
                article["sentiment"] = sentiment
                
        return articles

    def _determine_category(self, article: Dict) -> str:
        """Determine article category based on keywords"""
        text = f"{article.get('title', '')} {article.get('description', '')}".lower()
        
        category_scores = {}
        
        for category, keywords in self.categories.items():
            score = sum(1 for keyword in keywords if keyword.lower() in text)
            if score > 0:
                category_scores[category] = score
                
        if category_scores:
            return max(category_scores, key=category_scores.get)
        
        return "general"

    def _analyze_sentiment(self, article: Dict) -> Dict[str, float]:
        """Analyze sentiment of article"""
        text = f"{article.get('title', '')} {article.get('description', '')}"
        
        try:
            scores = self.sentiment_analyzer.polarity_scores(text)
            return {
                "positive": scores["pos"],
                "negative": scores["neg"],
                "neutral": scores["neu"],
                "compound": scores["compound"]
            }
        except Exception as e:
            logger.error(f"Error in sentiment analysis: {e}")
            return {"positive": 0, "negative": 0, "neutral": 1, "compound": 0}

    async def generate_ai_summary(self, article: Dict) -> Optional[str]:
        """Generate AI-powered summary using multiple methods"""
        content = f"{article.get('title', '')}. {article.get('description', '')} {article.get('content', '')}"
        
        if len(content.strip()) < 100:
            return None
            
        # Try OpenAI first (if available)
        if self.openai_api_key:
            try:
                summary = await self._openai_summarize(content)
                if summary:
                    return summary
            except Exception as e:
                logger.warning(f"OpenAI summarization failed: {e}")
                
        # Fallback to local transformer
        if self.summarizer:
            try:
                # Truncate content to fit model limits
                max_length = min(1024, len(content.split()))
                truncated_content = " ".join(content.split()[:max_length])
                
                summary = self.summarizer(truncated_content, max_length=150, min_length=50, do_sample=False)
                return summary[0]["summary_text"] if summary else None
            except Exception as e:
                logger.warning(f"Local summarization failed: {e}")
                
        # Simple extractive summary as final fallback
        return self._extractive_summary(content)

    async def _openai_summarize(self, content: str) -> Optional[str]:
        """Summarize using OpenAI GPT"""
        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a news summarization expert. Provide concise, informative summaries."},
                    {"role": "user", "content": f"Summarize this news article in 2-3 sentences: {content[:2000]}"}
                ],
                max_tokens=150,
                temperature=0.3
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            return None

    def _extractive_summary(self, content: str, max_sentences: int = 3) -> str:
        """Simple extractive summary"""
        sentences = re.split(r'[.!?]+', content)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
        
        # Return first few sentences as summary
        summary_sentences = sentences[:max_sentences]
        return ". ".join(summary_sentences) + "."

    async def save_articles_to_db(self, articles: List[Dict], db: Session):
        """Save articles to database"""
        saved_count = 0
        
        for article_data in articles:
            try:
                # Check if article already exists
                existing = db.query(NewsArticle).filter(
                    NewsArticle.url == article_data.get("url")
                ).first()
                
                if existing:
                    continue
                    
                # Generate AI summary
                ai_summary = await self.generate_ai_summary(article_data)
                
                # Create new article
                article = NewsArticle(
                    title=article_data.get("title", "")[:500],
                    description=article_data.get("description", "")[:1000],
                    content=article_data.get("content", ""),
                    url=article_data.get("url", ""),
                    image_url=article_data.get("image_url", ""),
                    published_at=self._parse_date(article_data.get("published_at")),
                    source_name=article_data.get("source_name", ""),
                    author=article_data.get("author", ""),
                    category=article_data.get("category", "general"),
                    ai_summary=ai_summary,
                    sentiment_score=article_data.get("sentiment", {}).get("compound", 0),
                    is_trending=self._is_trending(article_data)
                )
                
                db.add(article)
                saved_count += 1
                
            except Exception as e:
                logger.error(f"Error saving article: {e}")
                continue
                
        try:
            db.commit()
            logger.info(f"Saved {saved_count} new articles to database")
        except Exception as e:
            db.rollback()
            logger.error(f"Database commit error: {e}")

    def _parse_date(self, date_string: str) -> Optional[datetime]:
        """Parse various date formats"""
        if not date_string:
            return datetime.now()
            
        # Handle ISO format
        try:
            return datetime.fromisoformat(date_string.replace('Z', '+00:00'))
        except:
            pass
            
        # Handle other common formats
        formats = [
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%d %H:%M:%S",
            "%a, %d %b %Y %H:%M:%S %Z",
            "%a, %d %b %Y %H:%M:%S %z"
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(date_string, fmt)
            except:
                continue
                
        return datetime.now()

    def _is_trending(self, article: Dict) -> bool:
        """Determine if article is trending based on various factors"""
        # Simple trending logic - can be enhanced
        trending_keywords = ["breaking", "urgent", "exclusive", "developing", "alert"]
        text = f"{article.get('title', '')} {article.get('description', '')}".lower()
        
        has_trending_keywords = any(keyword in text for keyword in trending_keywords)
        
        # Reddit-specific metrics
        if article.get("source_type") == "reddit":
            upvotes = article.get("upvotes", 0)
            comments = article.get("comments", 0)
            return upvotes > 100 or comments > 50
            
        return has_trending_keywords


# Usage example and API endpoint integration
async def fetch_and_update_news():
    """Main function to fetch and update news"""
    aggregator = ModernNewsAggregator(openai_api_key="YOUR_OPENAI_KEY")  # Replace with actual key
    
    db = next(get_db())
    
    try:
        # Fetch latest news
        articles = await aggregator.fetch_news_from_all_sources(limit=200)
        
        # Save to database with AI processing
        await aggregator.save_articles_to_db(articles, db)
        
        logger.info(f"News aggregation completed. Processed {len(articles)} articles.")
        
    except Exception as e:
        logger.error(f"Error in news aggregation: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    # Run the news aggregation
    asyncio.run(fetch_and_update_news())
