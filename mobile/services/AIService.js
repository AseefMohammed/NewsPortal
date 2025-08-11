
/**
 * Enhanced AI Service for NewsPortal Mobile App
 * Connects to the AI-powered backend with advanced features
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Backend API configuration
const isReactNative = typeof window === 'undefined' || window.navigator?.product === 'ReactNative';
const isWeb = !isReactNative;
const isDev = __DEV__ || process.env.NODE_ENV === 'development';

console.log('🌐 Platform detection:', { 
  isWeb, 
  isReactNative, 
  isDev, 
  product: typeof window !== 'undefined' ? window.navigator?.product : 'Node',
  windowExists: typeof window !== 'undefined',
  navigatorProduct: typeof window !== 'undefined' && window.navigator ? window.navigator.product : 'undefined'
});

// Production URL - Your Vercel deployment
const PRODUCTION_URL = 'https://news-portal-nu-eight.vercel.app';

// Development URL for local testing
const DEVELOPMENT_URL = Platform.OS === 'web' 
  ? 'http://localhost:8002'  // Web development (proxy server)
  : 'http://10.0.2.2:8002';  // Android Emulator (proxy server)

// Determine which URL to use
// Force production URL for now since we have a working deployment
const API_BASE_URL = PRODUCTION_URL;

console.log('🔗 Final API_BASE_URL:', API_BASE_URL);
console.log('🔗 Decision logic - isDev:', isDev, 'isWeb:', isWeb, 'Selected URL:', API_BASE_URL);

// Simple backend uses no prefix - endpoints are at root level
const API_BASE = API_BASE_URL;

class AIService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.apiBase = API_BASE;
    this.cache = new Map();
    this.authToken = null;
  }

  /**
   * Initialize service with user authentication
   */
  async initialize(authToken = null) {
    this.authToken = authToken;
    if (authToken) {
      await AsyncStorage.setItem('auth_token', authToken);
    } else {
      this.authToken = await AsyncStorage.getItem('auth_token');
    }
  }

  /**
   * Get request headers with authentication
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }
    
    return headers;
  }

  /**
   * Generic API request wrapper with error handling
   */
  async apiRequest(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.apiBase}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: this.getHeaders(),
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  /**
   * Get latest news with AI enhancements
   */
  async getLatestNews(options = {}) {
    const { limit = 10, category = null, userInteraction = null } = options;

    try {
      const cacheKey = `latest_news_${limit}_${category || 'all'}`;
      const cached = await this.getCache(cacheKey);

      if (cached && !this.shouldRefresh(cached.timestamp)) {
        return cached.data;
      }

      // Use simple /news endpoint
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (category) params.append('category', category);

      const response = await this.apiRequest(`/news?${params}`);
      const data = response || [];
      
      // Cache the response
      await this.setCache(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('Error fetching latest news:', error);
      
      // Return fallback sample data when backend is unavailable
      return [
        {
          id: 'sample1',
          title: 'Backend Connection Issue',
          excerpt: 'Cannot connect to news backend service. Please check if the server is running.',
          source: 'System',
          published_at: new Date().toISOString(),
          category: 'system'
        },
        {
          id: 'sample2',
          title: 'Running in Offline Mode',
          excerpt: 'The app is currently running without backend connectivity. Some features may be limited.',
          source: 'System',
          published_at: new Date().toISOString(),
          category: 'system'
        }
      ];
    }
  }

  /**
   * Get trending news with AI analysis
   */
  async getTrendingNews(options = {}) {
    const { limit = 10, time_window = '24h' } = options;

    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());

      // Use simple news endpoint and return the latest
      const response = await this.apiRequest(`/news?${params.toString()}`);
      return response || [];
    } catch (error) {
      console.error('Failed to get trending news:', error);
      return [];
    }
  }

  /**
   * Search news with AI-powered filtering
   */
  async searchNews(query, options = {}) {
    const {
      limit = 20,
      category = null,
      sentiment = null,
    } = options;

    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (category) params.append('category', category);

      // Use simple news endpoint
      const response = await this.apiRequest(`/news?${params}`);
      const allNews = response || [];
      
      // Client-side filtering for search
      if (query && query.trim()) {
        const searchTerm = query.toLowerCase().trim();
        return allNews.filter(article => 
          article.title?.toLowerCase().includes(searchTerm) ||
          article.excerpt?.toLowerCase().includes(searchTerm)
        );
      }
      
      return allNews;
    } catch (error) {
      console.error('Failed to search news:', error);
      return [];
    }
  }

  /**
   * Get personalized news recommendations
   */
  async getPersonalizedNews(userId, options = {}) {
    const { limit = 20 } = options;

    try {
      // For simple backend, return regular news (no personalization yet)
      return await this.getLatestNews({ limit });
    } catch (error) {
      console.error('Failed to get personalized news:', error);
      return [];
    }
  }

  /**
   * Get news categories with analytics
   */
  async getNewsCategories() {
    try {
      const cacheKey = 'news_categories';
      
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < 600000) { // 10 minutes cache
          return cached.data;
        }
      }

      // For simple backend, return static categories that match our NEWS_GROUPS
      const data = [
        { name: 'general', count: 0, color: '#007AFF' },
        { name: 'business', count: 0, color: '#34C759' },
        { name: 'technology', count: 0, color: '#5856D6' },
        { name: 'politics', count: 0, color: '#FF9500' },
        { name: 'entertainment', count: 0, color: '#9C88FF' },
        { name: 'sports', count: 0, color: '#FF6B6B' },
        { name: 'health', count: 0, color: '#4ECDC4' }
      ];
      
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('Failed to get categories:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive news analytics
   */
  async getNewsAnalytics(options = {}) {
    const { time_range = '7d' } = options;

    try {
      // For simple backend, return mock analytics data
      return {
        total_articles: 25,
        categories: {
          'AI': 8,
          'Other': 17
        },
        sentiment_distribution: {
          'positive': 12,
          'neutral': 10, 
          'negative': 3
        },
        time_range: time_range
      };
    } catch (error) {
      console.error('Failed to get analytics:', error);
      return null;
    }
  }

  /**
   * Record user interaction with article
   */
  async recordInteraction(userId, articleId, interactionType, data = {}) {
    try {
      // For simple backend, just log the interaction locally
      const interaction = {
        user_id: userId,
        article_id: articleId,
        interaction_type: interactionType,
        interaction_data: data,
        timestamp: new Date().toISOString()
      };
      
      // Store interaction locally for now (could be sent to backend later)
      const key = `interaction_${Date.now()}`;
      await AsyncStorage.setItem(key, JSON.stringify(interaction));
      
      return { success: true, stored_locally: true };
    } catch (error) {
      console.error('Failed to record interaction:', error);
      // Don't throw error for analytics - it shouldn't break the app
    }
  }

  /**
   * Refresh news content manually
   */
  async refreshNews() {
    try {
      // Clear cache
      this.cache.clear();
      
      // For simple backend, just fetch fresh news
      return await this.getLatestNews({ limit: 20 });
    } catch (error) {
      console.error('Failed to refresh news:', error);
      return [];
    }
  }

  /**
   * Get system health status
   */
  async getHealthStatus() {
    try {
      // Test with simple news endpoint
      const response = await fetch(`${API_BASE_URL}/news?limit=1`);
      return { 
        status: response.ok ? 'healthy' : 'error', 
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get health status:', error);
      return { status: 'error', error: error.message };
    }
  }

  /**
   * Simple test connection method for debugging
   */
  async testConnection() {
    console.log('=== Testing Connection ===');
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('isDev:', isDev);
    console.log('isWeb:', isWeb);
    console.log('__DEV__:', __DEV__);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    try {
      const testUrl = `${API_BASE_URL}/test`;
      console.log('Attempting fetch to:', testUrl);
      
      const response = await fetch(testUrl);
      console.log('Response received:', response);
      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);
      
      if (response.ok) {
        const data = await response.text();
        console.log('Response data:', data);
        return { success: true, data };
      } else {
        console.log('Response not ok:', response.status, response.statusText);
        return { success: false, error: `${response.status}: ${response.statusText}` };
      }
    } catch (error) {
      console.error('Fetch error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get API server info
   */
  async getServerInfo() {
    try {
      console.log('Attempting to connect to:', API_BASE_URL);
      
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
      );
      
      // Test connection with the simple /test endpoint first (lighter)
      const fetchPromise = fetch(`${API_BASE_URL}/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Server response:', data);
        return {
          status: 'connected',
          message: 'NewsPortal API Connected',
          endpoint: API_BASE_URL,
          serverResponse: data
        };
      } else {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to get server info:', error);
      console.error('API_BASE_URL:', API_BASE_URL);
      throw error;
    }
  }

  /**
   * Legacy method compatibility - Get enhanced news feed
   */
  async getEnhancedNews(options = {}) {
    return this.getLatestNews(options);
  }

  /**
   * Legacy method compatibility - Get personalized feed
   */
  async getPersonalizedFeed(userId, preferences = {}) {
    return this.getPersonalizedNews(userId, preferences);
  }

  /**
   * Legacy method compatibility - Semantic search
   */
  async semanticSearch(query, options = {}) {
    return this.searchNews(query, options);
  }

  /**
   * Get trending topics
   */
  async getTrendingTopics() {
    try {
      const data = await this.getTrendingNews({ limit: 10 });
      return data.data || [];
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      return [];
    }
  }

  /**
   * Get sentiment analysis overview
   */
  async getSentimentAnalysis() {
    try {
      const data = await this.getNewsAnalytics({ time_range: '24h' });
      return data.sentiment_distribution || [];
    } catch (error) {
      console.error('Error fetching sentiment analysis:', error);
      return [];
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cached data
   */
  async getCache(key) {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached;
    }
    // Remove expired cache
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  /**
   * Set cache data with expiry
   */
  async setCache(key, data, ttl = 5 * 60 * 1000) { // 5 minutes default TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    });
  }

  /**
   * Check if cache should be refreshed
   */
  shouldRefresh(timestamp, maxAge = 5 * 60 * 1000) { // 5 minutes
    return Date.now() - timestamp > maxAge;
  }

  /**
   * Get cache stats for debugging
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export default new AIService();
