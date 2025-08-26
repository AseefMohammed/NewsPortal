
/**
 * Enhanced AI Service for NewsPortal Mobile App
 * Connects to the AI-powered backend with advanced features
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

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

// Production URL: read from environment in production; do not hard-code deployment host here
const PRODUCTION_URL = (typeof process !== 'undefined' && process.env && (process.env.PRODUCTION_URL || process.env.API_BASE_URL)) || '';

// Helper: normalize a base URL so it always has a protocol and no trailing slash
function normalizeBaseUrl(rawUrl, preferHttp = false) {
  if (!rawUrl) return '';
  let url = String(rawUrl).trim();

  // If URL looks like host:port (no protocol), add a sensible default
  if (!/^https?:\/\//i.test(url)) {
    url = (preferHttp ? 'http://' : 'https://') + url;
  }

  // remove trailing slash
  if (url.endsWith('/')) url = url.slice(0, -1);
  return url;
}

// Local backend defaults (used in development)
const LOCAL_BACKEND_PORT = 8000; // backend listens on this port locally
const LOCAL_HOST_WEB = `http://localhost:${LOCAL_BACKEND_PORT}`;
const LOCAL_HOST_IOS = `http://localhost:${LOCAL_BACKEND_PORT}`; // iOS simulator uses localhost
const LOCAL_HOST_ANDROID = `http://10.0.2.2:${LOCAL_BACKEND_PORT}`; // Android emulator

// Allow an explicit override via environment variable when needed
const OVERRIDE_URL = (typeof process !== 'undefined' && process.env && process.env.API_BASE_URL) || null;

// Determine which URL to use
let API_BASE_URL;
// Try to detect the packager host from Expo Constants (gives host:port when running Metro)
const debuggerHost = (Constants && (Constants.manifest?.debuggerHost || Constants.manifest2?.debuggerHost)) || null;
const detectedHost = debuggerHost ? debuggerHost.split(':')[0] : null;

if (OVERRIDE_URL) {
  API_BASE_URL = OVERRIDE_URL;
} else if (isDev) {
  if (isWeb) {
    API_BASE_URL = LOCAL_HOST_WEB;
  } else if (detectedHost) {
    // Use detected host from Expo packager so a physical device scanning the QR targets the dev machine
    API_BASE_URL = `http://${detectedHost}:${LOCAL_BACKEND_PORT}`;
  } else if (Platform.OS === 'android') {
    API_BASE_URL = LOCAL_HOST_ANDROID;
  } else {
    API_BASE_URL = LOCAL_HOST_IOS;
  }
} else {
  API_BASE_URL = PRODUCTION_URL;
}

// Normalize final base URL and prefer http in dev for convenience
API_BASE_URL = normalizeBaseUrl(API_BASE_URL, !!isDev);

if (isDev) {
  console.log('🔗 Final API_BASE_URL:', API_BASE_URL);
  console.log('🔗 Decision logic - isDev:', isDev, 'isWeb:', isWeb, 'Platform.OS:', Platform.OS, 'Selected URL:', API_BASE_URL);
}

// Simple backend uses no prefix - endpoints are at root level
const API_BASE = API_BASE_URL;

class AIService {
  /**
   * Stub for recordInteraction to prevent frontend errors
   */
  async recordInteraction() {
    // No-op for now. Implement if needed.
    return;
  }
  /**
   * Initialize the service (e.g., set auth token)
   */
  initialize(token) {
    this.authToken = token;
  }
  /**
   * Core API request method for all endpoints
   * @param {string} endpoint - API endpoint (relative to API_BASE_URL)
   * @param {object} options - fetch options (method, headers, body, etc.)
   */
  async apiRequest(endpoint, options = {}) {
  const base = this.baseURL || API_BASE_URL || '';
  const url = `${base}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const fetchOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}),
        ...(options.headers || {})
      },
      ...options
    };
    try {
      const response = await fetch(url, fetchOptions);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error, url);
      throw error;
    }
  }
  // Get latest news with AI enhancements from enhanced API
  async getLatestNews(options = {}) {
    const { limit = 20, category = null } = options;
    try {
      const cacheKey = `latest_news_${limit}_${category || 'all'}`;
      const cached = await this.getCache(cacheKey);
      if (cached && !this.shouldRefresh(cached.timestamp)) {
        return cached.data;
      }
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (category) params.append('category', category);
      const response = await this.apiRequest(`/api/v2/news/latest?${params}`);
      console.log('getLatestNews response:', response);
      const data = response?.data || [];
      await this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching latest news:', error);
      return [];
    }
  }

  // Get trending news from enhanced API
  async getTrendingNews(options = {}) {
    const { limit = 20 } = options;
    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      const response = await this.apiRequest(`/api/v2/news/trending?${params}`);
      console.log('getTrendingNews response:', response);
      return response?.data || [];
    } catch (error) {
      console.error('Failed to get trending news:', error);
      return [];
    }
  }

  // Search news with AI-powered filtering from enhanced API
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
      if (sentiment) params.append('sentiment', sentiment);
      if (query) params.append('q', query);
      const response = await this.apiRequest(`/api/v2/news/search?${params}`);
      console.log('searchNews response:', response);
      return response?.data || [];
    } catch (error) {
      console.error('Failed to search news:', error);
      return [];
    }
  }

  // Get news categories with analytics from enhanced API
  async getNewsCategories() {
    try {
      const cacheKey = 'news_categories';
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < 600000) {
          return cached.data;
        }
      }
      const response = await this.apiRequest('/api/v2/news/categories');
      console.log('getNewsCategories response:', response);
      const data = response?.data || [];
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

  // Get comprehensive news analytics from enhanced API
  async getNewsAnalytics(options = {}) {
    const { time_range = '7d' } = options;
    try {
      const params = new URLSearchParams();
      if (time_range) params.append('time_range', time_range);
      const response = await this.apiRequest(`/api/v2/news/analytics?${params}`);
      console.log('getNewsAnalytics response:', response);
      return response?.data || null;
    } catch (error) {
      console.error('Failed to get analytics:', error);
      return null;
    }
  }
  constructor() {
    this.baseURL = API_BASE_URL;
    this.apiBase = API_BASE;
    this.cache = new Map();
    this.authToken = null;
  }

// ...existing code...

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
// ...existing code...

  /**
   * Get API server info
   */
  async getServerInfo() {
    try {
  const base = this.baseURL || API_BASE_URL || '';
  if (isDev) console.log('Attempting to connect to:', base);
      
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
      );
      
      // Test connection with the simple /test endpoint first (lighter)
  const fetchPromise = fetch(`${base}/test`, {
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
