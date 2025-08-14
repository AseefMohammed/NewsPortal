"""
Advanced AI Service for News Processing
Comprehensive AI capabilities including summarization, sentiment analysis, and content enhancement
"""

import asyncio
import aiohttp
import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
import json
import re

import openai
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from nltk.tag import pos_tag
from nltk.chunk import ne_chunk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
import numpy as np

# Try to import transformers for local AI processing
try:
    from transformers import (
        pipeline, 
        AutoTokenizer, 
        AutoModelForSequenceClassification,
        AutoModelForTokenClassification
    )
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    logging.warning("Transformers not available. Some AI features will be limited.")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AdvancedAIService:
    """
    Advanced AI service for comprehensive news processing
    """
    
    def __init__(self, openai_api_key: Optional[str] = None, anthropic_api_key: Optional[str] = None):
        self.openai_api_key = openai_api_key
        self.anthropic_api_key = anthropic_api_key
        
        if openai_api_key:
            openai.api_key = openai_api_key
            
        # Initialize NLTK components
        self._initialize_nltk()
        
        # Initialize transformer models if available
        self._initialize_transformers()
        
        # Initialize analysis pipelines
        self._initialize_pipelines()

    def _initialize_nltk(self):
        """Initialize NLTK components"""
        try:
            # Download required NLTK data
            nltk_downloads = [
                'vader_lexicon', 'punkt', 'averaged_perceptron_tagger',
                'maxent_ne_chunker', 'words', 'stopwords'
            ]
            
            for item in nltk_downloads:
                try:
                    nltk.download(item, quiet=True)
                except:
                    pass
                    
            # Initialize sentiment analyzer
            self.sentiment_analyzer = SentimentIntensityAnalyzer()
            self.stopwords = set(stopwords.words('english'))
            
        except Exception as e:
            logger.warning(f"NLTK initialization warning: {e}")
            self.sentiment_analyzer = None
            self.stopwords = set()

    def _initialize_transformers(self):
        """Initialize transformer models"""
        self.summarizer = None
        self.classifier = None
        self.ner_model = None
        
        if not TRANSFORMERS_AVAILABLE:
            return
            
        try:
            # Summarization model
            self.summarizer = pipeline(
                "summarization",
                model="facebook/bart-large-cnn",
                device=-1  # Use CPU
            )
            
            # Classification model for content analysis
            self.classifier = pipeline(
                "text-classification",
                model="cardiffnlp/twitter-roberta-base-sentiment-latest",
                device=-1
            )
            
            # Named Entity Recognition
            self.ner_model = pipeline(
                "ner",
                model="dbmdz/bert-large-cased-finetuned-conll03-english",
                aggregation_strategy="simple",
                device=-1
            )
            
            logger.info("Transformer models initialized successfully")
            
        except Exception as e:
            logger.warning(f"Transformer model initialization failed: {e}")

    def _initialize_pipelines(self):
        """Initialize analysis pipelines"""
        # TF-IDF vectorizer for keyword extraction
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=100,
            stop_words='english',
            ngram_range=(1, 2),
            min_df=1,
            max_df=0.95
        )

    async def comprehensive_analysis(self, article_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform comprehensive AI analysis on an article
        """
        text_content = self._extract_text_content(article_data)
        
        if not text_content or len(text_content.strip()) < 50:
            return self._empty_analysis()
            
        # Run all analyses concurrently
        analysis_tasks = [
            self.generate_ai_summary(article_data),
            self.analyze_sentiment(text_content),
            self.extract_key_points(text_content),
            self.extract_entities(text_content),
            self.extract_keywords(text_content),
            self.analyze_readability(text_content),
            self.categorize_content(text_content),
            self.detect_trending_potential(article_data)
        ]
        
        try:
            results = await asyncio.gather(*analysis_tasks, return_exceptions=True)
            
            # Compile results
            analysis_result = {
                "ai_summary": self._safe_result(results[0]),
                "sentiment": self._safe_result(results[1]),
                "key_points": self._safe_result(results[2]),
                "entities": self._safe_result(results[3]),
                "keywords": self._safe_result(results[4]),
                "readability": self._safe_result(results[5]),
                "category": self._safe_result(results[6]),
                "trending_potential": self._safe_result(results[7]),
                "analysis_timestamp": datetime.now().isoformat(),
                "processing_successful": True
            }
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"Comprehensive analysis failed: {e}")
            return self._empty_analysis()

    async def generate_ai_summary(self, article_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate AI-powered summary using multiple approaches
        """
        text_content = self._extract_text_content(article_data)
        
        if not text_content:
            return {"summary": None, "confidence": 0, "method": "none"}
            
        # Try different summarization methods in order of preference
        methods = [
            ("openai_gpt4", self._openai_summarize),
            ("anthropic_claude", self._anthropic_summarize),
            ("local_transformer", self._transformer_summarize),
            ("extractive", self._extractive_summary)
        ]
        
        for method_name, method_func in methods:
            try:
                if method_name == "openai_gpt4" and not self.openai_api_key:
                    continue
                if method_name == "anthropic_claude" and not self.anthropic_api_key:
                    continue
                if method_name == "local_transformer" and not self.summarizer:
                    continue
                    
                summary = await method_func(text_content)
                if summary:
                    return {
                        "summary": summary,
                        "confidence": self._calculate_summary_confidence(summary, text_content),
                        "method": method_name
                    }
                    
            except Exception as e:
                logger.warning(f"Summary method {method_name} failed: {e}")
                continue
                
        # Fallback to simple truncation
        return {
            "summary": text_content[:300] + "..." if len(text_content) > 300 else text_content,
            "confidence": 0.3,
            "method": "truncation"
        }

    async def _openai_summarize(self, text: str) -> Optional[str]:
        """Summarize using OpenAI GPT"""
        try:
            # For openai>=1.0.0, use openai.resources.chat.completions.create
            response = await openai.resources.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert news summarizer. Create concise, informative summaries that capture the key points of news articles in 2-3 sentences."
                    },
                    {
                        "role": "user",
                        "content": f"Summarize this news article: {text[:3000]}"
                    }
                ],
                max_tokens=150,
                temperature=0.3
            )
            # The new API returns response.choices[0].message.content
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"OpenAI summarization error: {e}")
            return None

    async def _anthropic_summarize(self, text: str) -> Optional[str]:
        """Summarize using Anthropic Claude (placeholder - would need actual API)"""
        # This would require the Anthropic Python SDK
        # For now, return None to fall back to other methods
        return None

    async def _transformer_summarize(self, text: str) -> Optional[str]:
        """Summarize using local transformer model"""
        if not self.summarizer:
            return None
            
        try:
            # Truncate text to model limits
            max_length = min(1024, len(text.split()))
            truncated_text = " ".join(text.split()[:max_length])
            
            summary_result = self.summarizer(
                truncated_text,
                max_length=150,
                min_length=50,
                do_sample=False
            )
            
            return summary_result[0]["summary_text"]
            
        except Exception as e:
            logger.error(f"Transformer summarization error: {e}")
            return None

    async def _extractive_summary(self, text: str) -> str:
        """Create extractive summary using sentence ranking"""
        try:
            sentences = sent_tokenize(text)
            if len(sentences) <= 3:
                return text
                
            # Simple sentence scoring based on position and length
            sentence_scores = []
            for i, sentence in enumerate(sentences):
                score = 0
                
                # Position score (earlier sentences get higher scores)
                if i < len(sentences) * 0.3:
                    score += 2
                elif i < len(sentences) * 0.7:
                    score += 1
                    
                # Length score (prefer medium-length sentences)
                word_count = len(sentence.split())
                if 10 <= word_count <= 30:
                    score += 2
                elif 5 <= word_count <= 40:
                    score += 1
                    
                sentence_scores.append((sentence, score))
                
            # Sort by score and take top 2-3 sentences
            top_sentences = sorted(sentence_scores, key=lambda x: x[1], reverse=True)[:3]
            
            # Return sentences in original order
            summary_sentences = []
            for sentence, _ in sorted(top_sentences, key=lambda x: sentences.index(x[0])):
                summary_sentences.append(sentence)
                
            return " ".join(summary_sentences)
            
        except Exception as e:
            logger.error(f"Extractive summary error: {e}")
            return text[:300] + "..."

    async def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """
        Comprehensive sentiment analysis using multiple approaches
        """
        sentiment_results = {"scores": {}, "label": "neutral", "confidence": 0.0}
        
        # VADER sentiment analysis
        if self.sentiment_analyzer:
            try:
                vader_scores = self.sentiment_analyzer.polarity_scores(text)
                sentiment_results["scores"]["vader"] = vader_scores
                
                # Determine label based on compound score
                compound = vader_scores["compound"]
                if compound >= 0.05:
                    sentiment_results["label"] = "positive"
                elif compound <= -0.05:
                    sentiment_results["label"] = "negative"
                else:
                    sentiment_results["label"] = "neutral"
                    
                sentiment_results["confidence"] = abs(compound)
                
            except Exception as e:
                logger.error(f"VADER sentiment analysis error: {e}")
                
        # Transformer-based sentiment analysis
        if self.classifier:
            try:
                transformer_result = self.classifier(text[:500])  # Truncate for model limits
                sentiment_results["scores"]["transformer"] = {
                    "label": transformer_result[0]["label"],
                    "score": transformer_result[0]["score"]
                }
                
                # Update confidence if transformer is more confident
                if transformer_result[0]["score"] > sentiment_results["confidence"]:
                    sentiment_results["confidence"] = transformer_result[0]["score"]
                    # Map transformer labels
                    label_map = {"LABEL_0": "negative", "LABEL_1": "neutral", "LABEL_2": "positive"}
                    sentiment_results["label"] = label_map.get(
                        transformer_result[0]["label"], 
                        transformer_result[0]["label"].lower()
                    )
                    
            except Exception as e:
                logger.error(f"Transformer sentiment analysis error: {e}")
                
        return sentiment_results

    async def extract_key_points(self, text: str) -> List[str]:
        """
        Extract key points from text using sentence ranking
        """
        try:
            sentences = sent_tokenize(text)
            
            if len(sentences) <= 3:
                return sentences
                
            # Score sentences based on multiple factors
            sentence_scores = {}
            
            # Calculate TF-IDF for words in the text
            words = word_tokenize(text.lower())
            words = [word for word in words if word.isalpha() and word not in self.stopwords]
            
            word_freq = {}
            for word in words:
                word_freq[word] = word_freq.get(word, 0) + 1
                
            # Score sentences
            for i, sentence in enumerate(sentences):
                score = 0
                sentence_words = word_tokenize(sentence.lower())
                sentence_words = [word for word in sentence_words if word.isalpha()]
                
                # Word frequency score
                for word in sentence_words:
                    if word in word_freq:
                        score += word_freq[word]
                        
                # Position score
                if i < len(sentences) * 0.3:
                    score *= 1.5
                    
                # Length normalization
                if len(sentence_words) > 0:
                    score = score / len(sentence_words)
                    
                sentence_scores[sentence] = score
                
            # Get top sentences
            top_sentences = sorted(sentence_scores.items(), key=lambda x: x[1], reverse=True)
            key_points = [sentence for sentence, _ in top_sentences[:5]]
            
            return key_points
            
        except Exception as e:
            logger.error(f"Key points extraction error: {e}")
            return []

    async def extract_entities(self, text: str) -> Dict[str, List[str]]:
        """
        Extract named entities from text
        """
        entities = {"persons": [], "organizations": [], "locations": [], "misc": []}
        
        # Try transformer-based NER first
        if self.ner_model:
            try:
                ner_results = self.ner_model(text[:1000])  # Truncate for model limits
                
                for entity in ner_results:
                    entity_text = entity["word"]
                    entity_label = entity["entity_group"]
                    
                    if entity_label == "PER":
                        entities["persons"].append(entity_text)
                    elif entity_label == "ORG":
                        entities["organizations"].append(entity_text)
                    elif entity_label == "LOC":
                        entities["locations"].append(entity_text)
                    else:
                        entities["misc"].append(entity_text)
                        
            except Exception as e:
                logger.error(f"Transformer NER error: {e}")
                
        # Fallback to NLTK NER
        try:
            # Tokenize and tag
            tokens = word_tokenize(text[:1000])
            pos_tags = pos_tag(tokens)
            chunks = ne_chunk(pos_tags)
            
            for chunk in chunks:
                if hasattr(chunk, 'label'):
                    entity_text = " ".join([token for token, pos in chunk.leaves()])
                    
                    if chunk.label() == "PERSON":
                        entities["persons"].append(entity_text)
                    elif chunk.label() == "ORGANIZATION":
                        entities["organizations"].append(entity_text)
                    elif chunk.label() in ["GPE", "LOCATION"]:
                        entities["locations"].append(entity_text)
                    else:
                        entities["misc"].append(entity_text)
                        
        except Exception as e:
            logger.error(f"NLTK NER error: {e}")
            
        # Remove duplicates
        for key in entities:
            entities[key] = list(set(entities[key]))
            
        return entities

    async def extract_keywords(self, text: str, max_keywords: int = 10) -> List[Dict[str, Any]]:
        """
        Extract keywords with relevance scores
        """
        try:
            # Simple keyword extraction using TF-IDF
            words = word_tokenize(text.lower())
            words = [word for word in words if word.isalpha() and word not in self.stopwords and len(word) > 2]
            
            if not words:
                return []
                
            # Calculate word frequency
            word_freq = {}
            for word in words:
                word_freq[word] = word_freq.get(word, 0) + 1
                
            # Get top words by frequency
            sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
            
            keywords = []
            for word, freq in sorted_words[:max_keywords]:
                relevance = min(freq / len(words) * 100, 1.0)  # Normalize to 0-1
                keywords.append({
                    "word": word,
                    "frequency": freq,
                    "relevance": round(relevance, 3)
                })
                
            return keywords
            
        except Exception as e:
            logger.error(f"Keyword extraction error: {e}")
            return []

    async def analyze_readability(self, text: str) -> Dict[str, Any]:
        """
        Analyze text readability and complexity
        """
        try:
            sentences = sent_tokenize(text)
            words = word_tokenize(text)
            words = [word for word in words if word.isalpha()]
            
            if not sentences or not words:
                return {"reading_time": 0, "complexity": "unknown", "word_count": 0}
                
            # Basic metrics
            word_count = len(words)
            sentence_count = len(sentences)
            avg_words_per_sentence = word_count / sentence_count if sentence_count > 0 else 0
            
            # Estimate reading time (average 200 words per minute)
            reading_time_minutes = max(1, word_count // 200)
            
            # Simple complexity scoring
            complexity_score = 0
            if avg_words_per_sentence > 20:
                complexity_score += 0.3
            if avg_words_per_sentence > 15:
                complexity_score += 0.2
                
            # Check for complex words (>6 characters)
            complex_words = [word for word in words if len(word) > 6]
            complex_word_ratio = len(complex_words) / word_count if word_count > 0 else 0
            complexity_score += complex_word_ratio * 0.5
            
            # Determine complexity label
            if complexity_score < 0.3:
                complexity_label = "simple"
            elif complexity_score < 0.6:
                complexity_label = "moderate"
            else:
                complexity_label = "complex"
                
            return {
                "word_count": word_count,
                "sentence_count": sentence_count,
                "avg_words_per_sentence": round(avg_words_per_sentence, 1),
                "reading_time_minutes": reading_time_minutes,
                "complexity_score": round(complexity_score, 2),
                "complexity_label": complexity_label
            }
            
        except Exception as e:
            logger.error(f"Readability analysis error: {e}")
            return {"reading_time": 0, "complexity": "unknown", "word_count": 0}

    async def categorize_content(self, text: str) -> Dict[str, Any]:
        """
        Categorize content based on keywords and patterns
        """
        categories = {
            "technology": ["tech", "ai", "artificial intelligence", "software", "hardware", "digital", "innovation", "startup", "app", "platform"],
            "business": ["business", "finance", "economy", "market", "stock", "investment", "corporate", "company", "revenue", "profit"],
            "politics": ["politics", "government", "election", "congress", "senate", "president", "minister", "policy", "law", "democracy"],
            "health": ["health", "medical", "medicine", "healthcare", "disease", "treatment", "vaccine", "wellness", "hospital", "doctor"],
            "science": ["science", "research", "study", "discovery", "experiment", "climate", "environment", "space", "physics", "chemistry"],
            "sports": ["sports", "football", "basketball", "soccer", "tennis", "olympics", "championship", "team", "player", "game"],
            "entertainment": ["entertainment", "movie", "music", "celebrity", "hollywood", "film", "television", "show", "actor", "artist"]
        }
        
        text_lower = text.lower()
        category_scores = {}
        
        for category, keywords in categories.items():
            score = 0
            matched_keywords = []
            
            for keyword in keywords:
                if keyword in text_lower:
                    score += text_lower.count(keyword)
                    matched_keywords.append(keyword)
                    
            if score > 0:
                category_scores[category] = {
                    "score": score,
                    "matched_keywords": matched_keywords
                }
                
        if category_scores:
            top_category = max(category_scores, key=lambda x: category_scores[x]["score"])
            confidence = min(category_scores[top_category]["score"] / 10, 1.0)  # Normalize
            
            return {
                "primary_category": top_category,
                "confidence": round(confidence, 2),
                "all_scores": category_scores
            }
        else:
            return {
                "primary_category": "general",
                "confidence": 0.5,
                "all_scores": {}
            }

    async def detect_trending_potential(self, article_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze trending potential of an article
        """
        trending_score = 0
        factors = []
        
        text_content = self._extract_text_content(article_data)
        
        # Check for trending keywords
        trending_keywords = ["breaking", "urgent", "exclusive", "developing", "alert", "first", "new", "major", "shocking", "unprecedented"]
        title = article_data.get("title", "").lower()
        description = article_data.get("description", "").lower()
        
        for keyword in trending_keywords:
            if keyword in title:
                trending_score += 3
                factors.append(f"trending_keyword_in_title: {keyword}")
            elif keyword in description:
                trending_score += 1
                factors.append(f"trending_keyword_in_description: {keyword}")
                
        # Check publication recency
        published_at = article_data.get("published_at")
        if published_at:
            try:
                pub_time = datetime.fromisoformat(published_at.replace('Z', '+00:00'))
                time_diff = datetime.now() - pub_time.replace(tzinfo=None)
                
                if time_diff.total_seconds() < 3600:  # Less than 1 hour
                    trending_score += 5
                    factors.append("very_recent_publication")
                elif time_diff.total_seconds() < 21600:  # Less than 6 hours
                    trending_score += 3
                    factors.append("recent_publication")
                    
            except:
                pass
                
        # Check for emotional content
        if hasattr(self, 'sentiment_analyzer') and self.sentiment_analyzer:
            sentiment = self.sentiment_analyzer.polarity_scores(text_content)
            if abs(sentiment['compound']) > 0.5:
                trending_score += 2
                factors.append("high_emotional_content")
                
        # Source credibility boost
        source_name = article_data.get("source_name", "").lower()
        major_sources = ["reuters", "ap", "bbc", "cnn", "guardian", "nytimes"]
        if any(source in source_name for source in major_sources):
            trending_score += 2
            factors.append("major_news_source")
            
        # Normalize score to 0-1 range
        normalized_score = min(trending_score / 20, 1.0)
        
        return {
            "trending_score": round(normalized_score, 2),
            "raw_score": trending_score,
            "factors": factors,
            "is_likely_trending": normalized_score > 0.6
        }

    def _extract_text_content(self, article_data: Dict[str, Any]) -> str:
        """Extract text content from article data"""
        content_parts = []
        
        if article_data.get("title"):
            content_parts.append(article_data["title"])
            
        if article_data.get("description"):
            content_parts.append(article_data["description"])
            
        if article_data.get("content"):
            content_parts.append(article_data["content"])
            
        return " ".join(content_parts)

    def _calculate_summary_confidence(self, summary: str, original_text: str) -> float:
        """Calculate confidence score for generated summary"""
        if not summary or not original_text:
            return 0.0
            
        # Simple heuristics for confidence
        summary_length = len(summary.split())
        original_length = len(original_text.split())
        
        # Ideal summary length ratio
        ideal_ratio = 0.1  # 10% of original
        actual_ratio = summary_length / original_length if original_length > 0 else 0
        
        # Score based on how close to ideal ratio
        ratio_score = 1 - abs(actual_ratio - ideal_ratio) * 5
        ratio_score = max(0, min(1, ratio_score))
        
        # Check for coherence (basic)
        sentences = summary.split('.')
        coherence_score = 0.8 if len(sentences) >= 2 else 0.5
        
        return round((ratio_score + coherence_score) / 2, 2)

    def _safe_result(self, result) -> Any:
        """Safely extract result from async operations"""
        if isinstance(result, Exception):
            logger.error(f"Analysis task failed: {result}")
            return None
        return result

    def _empty_analysis(self) -> Dict[str, Any]:
        """Return empty analysis result"""
        return {
            "ai_summary": {"summary": None, "confidence": 0, "method": "none"},
            "sentiment": {"scores": {}, "label": "neutral", "confidence": 0},
            "key_points": [],
            "entities": {"persons": [], "organizations": [], "locations": [], "misc": []},
            "keywords": [],
            "readability": {"reading_time": 0, "complexity": "unknown", "word_count": 0},
            "category": {"primary_category": "general", "confidence": 0.5, "all_scores": {}},
            "trending_potential": {"trending_score": 0, "raw_score": 0, "factors": [], "is_likely_trending": False},
            "analysis_timestamp": datetime.now().isoformat(),
            "processing_successful": False
        }


# Global AI service instance
ai_service = None

def get_ai_service() -> AdvancedAIService:
    """Get global AI service instance"""
    global ai_service
    if ai_service is None:
        ai_service = AdvancedAIService(
            openai_api_key="YOUR_OPENAI_KEY",  # Replace with actual key
            anthropic_api_key="YOUR_ANTHROPIC_KEY"  # Replace with actual key
        )
    return ai_service
