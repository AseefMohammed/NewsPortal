
"""
News Fetcher Script
-------------------
Fetches news articles from a comprehensive list of RSS feeds and stores them in the database.
All resources are included in the RSS_FEEDS list for future segregation.
"""

import requests
import feedparser
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from backend.models import News
from datetime import datetime
import email.utils
from urllib.parse import urlparse, urlunparse, parse_qs, urlencode

# All news channels/resources (for future segregation)
RSS_FEEDS = [
    # UAE & Middle East
    'https://www.khaleejtimes.com/rss',
    'https://gulfnews.com/rss',
    'https://www.thenationalnews.com/rss',
    'https://www.arabianbusiness.com/feed',
    'https://www.aljazeera.com/xml/rss/all.xml',
    'https://www.arabnews.com/rss.xml',
    'https://english.aawsat.com/home/rss.xml',
    'https://www.reuters.com/rssfeed/worldnews',
    'https://www.reuters.com/rssfeed/businessNews',
    'https://www.reuters.com/rssfeed/technologyNews',
    # Global Tech & Finance
    'https://feeds.feedburner.com/TechCrunch/',
    'https://www.wired.com/feed/rss',
    'https://www.theverge.com/rss/index.xml',
    'https://www.engadget.com/rss.xml',
    'https://feeds.feedburner.com/venturebeat/SZYF',
    'https://www.bloomberg.com/feed/podcast/etf-report.xml',
    'https://feeds.feedburner.com/entrepreneur/latest',
    # Financial News
    'https://www.ft.com/rss/home',
    'https://feeds.feedburner.com/FinancialTimes',
    'https://www.economist.com/finance-and-economics/rss.xml',
    'https://www.marketwatch.com/rss/topstories',
    'https://feeds.feedburner.com/CoinDesk',
    'https://cointelegraph.com/rss',
    'https://decrypt.co/feed',
    # AI & Tech
    'https://www.artificialintelligence-news.com/feed/',
    'https://www.techrepublic.com/rssfeeds/articles/',
    'https://www.zdnet.com/news/rss.xml',
    'https://www.techradar.com/rss',
    'https://www.digitaltrends.com/feed/',
    # Major World News
    'http://feeds.bbci.co.uk/news/rss.xml',
    'https://rss.cnn.com/rss/edition.rss',
    'https://www.npr.org/rss/rss.php?id=1001',
    'https://www.nytimes.com/services/xml/rss/nyt/HomePage.xml',
    'https://www.theguardian.com/world/rss',
    'https://www.hindustantimes.com/feeds/rss/world-news/rssfeed.xml',
    'https://www.scmp.com/rss/91/feed',
    # Business & Economy
    'https://www.forbes.com/business/feed/',
    'https://www.cnbc.com/id/10001147/device/rss/rss.html',
    'https://www.businesstimes.com.sg/rss',
    'https://www.business-standard.com/rss/latest.rss',
    'https://www.economist.com/business/rss.xml',
    # Niche/Regional/Other
    'https://www.finextra.com/rss/news',
    'https://www.pymnts.com/feed/',
    'https://www.bankingtech.com/feed/',
    'https://www.fintechfutures.com/feed/',
    'https://www.americanbanker.com/feed',
    'https://www.asiabankingandfinance.net/rss.xml',
    'https://www.africanews.com/feed/rss',
    'https://www.japantimes.co.jp/feed/',
    'https://www.smh.com.au/rss/feed.xml',
    'https://www.abc.net.au/news/feed/51120/rss.xml',
    'https://www.moneycontrol.com/rss/markets.xml',
    'https://www.moneycontrol.com/rss/fintech.xml',
    'https://www.fintechnews.sg/feed/',
    'https://www.fintechnews.ch/feed/',
    'https://www.fintechnews.my/feed/',
    'https://www.fintechnews.hk/feed/',
    'https://www.fintechnews.ph/feed/',
    'https://www.fintechnews.africa/feed/',
    'https://www.finextra.com/rss/blogs',
    'https://www.finextra.com/rss/events',
]

def normalize_url(url):
    if not url:
        return url
    url = url.strip().lower()
    if url.endswith('/'):
        url = url[:-1]
    parsed = urlparse(url)
    qs = parse_qs(parsed.query)
    filtered_qs = {k: v for k, v in qs.items() if not k.startswith('utm_')}
    new_query = urlencode(filtered_qs, doseq=True)
    normalized = urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, new_query, parsed.fragment))
    return normalized

def fetch_and_store_news(db: Session):
    for feed_url in RSS_FEEDS:
        try:
            resp = requests.get(feed_url, timeout=10)
            d = feedparser.parse(resp.content)
        except Exception as e:
            print(f"Error fetching {feed_url}: {e}")
            continue
        for entry in d.entries:
            title = entry.get('title', '')
            url = normalize_url(entry.get('link', ''))
            excerpt = entry.get('summary', '')
            published = entry.get('published', '')
            source = d.feed.get('title', '')
            image = None
            # Try to extract image from entry or fallback to scraping
            if 'media_content' in entry and entry['media_content']:
                image = entry['media_content'][0].get('url')
            elif 'media_thumbnail' in entry and entry['media_thumbnail']:
                image = entry['media_thumbnail'][0].get('url')
            else:
                # Fallback: scrape Open Graph image
                try:
                    resp_img = requests.get(url, timeout=5)
                    soup = BeautifulSoup(resp_img.text, 'html.parser')
                    og_img = soup.find('meta', property='og:image')
                    if og_img:
                        image = og_img.get('content')
                except Exception:
                    pass
            # Parse published date
            published_at = None
            try:
                if hasattr(entry, 'published_parsed') and entry.published_parsed:
                    published_at = datetime(*entry.published_parsed[:6])
                elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
                    published_at = datetime(*entry.updated_parsed[:6])
                elif published:
                    try:
                        parsed_date = email.utils.parsedate_tz(published)
                        if parsed_date:
                            published_at = datetime(*parsed_date[:6])
                    except:
                        pass
                if not published_at:
                    published_at = datetime.utcnow()
            except Exception as e:
                print(f"Date parsing error for {url}: {e}")
                published_at = datetime.utcnow()
            # Avoid duplicates by URL
            if not db.query(News).filter_by(url=url).first():
                news = News(
                    title=title,
                    url=url,
                    excerpt=excerpt,
                    image=image,
                    published_at=published_at,
                    source=source,
                    category=None  # Category can be set later during segregation
                )
                db.add(news)
    db.commit()

if __name__ == "__main__":
    from backend.database import SessionLocal
    db = SessionLocal()
    try:
        fetch_and_store_news(db)
        print("News fetching complete.")
    finally:
        db.close()