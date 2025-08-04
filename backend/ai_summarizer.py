

import os
from typing import Optional, Dict, List
import requests
from bs4 import BeautifulSoup
import re
import json

class AINewsSummarizer:
    def __init__(self):
        # No API key needed for local Ollama
        self.ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
        self.model = os.getenv("OLLAMA_MODEL", "phi3:latest")

    async def summarize_article(self, article_text: str, max_length: int = 150) -> Dict[str, str]:
        """
        Summarize a news article using local Ollama
        """
        try:
            prompt = f"""
            Please analyze this news article and provide:
            1. A concise summary (max {max_length} words)
            2. 3-5 key points
            3. Overall sentiment (positive/negative/neutral)
            4. Main topics/categories

            Article text:
            {article_text[:4000]}

            Please format your response as JSON:
            {{
                "summary": "Brief summary here",
                "key_points": ["point 1", "point 2", "point 3"],
                "sentiment": "positive/negative/neutral",
                "topics": ["topic1", "topic2"],
                "confidence": 0.95
            }}
            """
            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": False
            }
            response = requests.post(self.ollama_url, json=payload, timeout=60)
            response.raise_for_status()
            data = response.json()
            # Ollama returns the result in 'response' key
            content = data.get("response", "")
            # Try to extract JSON from the response
            try:
                result = json.loads(content)
            except Exception:
                # Fallback: try to extract JSON substring
                import re
                match = re.search(r'\{.*\}', content, re.DOTALL)
                if match:
                    result = json.loads(match.group(0))
                else:
                    raise ValueError("No JSON found in Ollama response")
            return result
            
        except Exception as e:
            print(f"Ollama Summarization error: {e}")
            return {
                "summary": "Summary unavailable",
                "key_points": [],
                "sentiment": "neutral",
                "topics": [],
                "confidence": 0.0
            }
    
    def extract_article_text(self, url: str) -> Optional[str]:
        """
        Extract main article text from URL
        """
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(url, headers=headers, timeout=10)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()
            
            # Try to find main content
            content_selectors = [
                'article', '.article-content', '.post-content', 
                '.entry-content', '.content', 'main'
            ]
            
            article_text = ""
            for selector in content_selectors:
                content = soup.select_one(selector)
                if content:
                    article_text = content.get_text()
                    break
            
            if not article_text:
                # Fallback to body text
                article_text = soup.get_text()
            
            # Clean up text
            article_text = re.sub(r'\s+', ' ', article_text).strip()
            return article_text  # No length limit
            
        except Exception as e:
            print(f"Text extraction error: {e}")
            return None
    
    async def enhance_news_item(self, news_item: Dict) -> Dict:
        """
        Enhance a news item with AI-generated content
        """
        # Extract article text if not provided
        article_text = news_item.get('content')
        if not article_text and news_item.get('url'):
            article_text = self.extract_article_text(news_item['url'])
        
        if not article_text:
            return news_item
        
        # Generate AI enhancements
        ai_analysis = await self.summarize_article(article_text)
        
        # Add AI-generated fields to news item
        enhanced_item = news_item.copy()
        enhanced_item.update({
            'ai_summary': ai_analysis.get('summary'),
            'key_points': ai_analysis.get('key_points', []),
            'sentiment': ai_analysis.get('sentiment'),
            'topics': ai_analysis.get('topics', []),
            'ai_confidence': ai_analysis.get('confidence', 0.0)
        })
        
        return enhanced_item

# Usage example:
# summarizer = AINewsSummarizer()
# enhanced_news = await summarizer.enhance_news_item(news_item)
