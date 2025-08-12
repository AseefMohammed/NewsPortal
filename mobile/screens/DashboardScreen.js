import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  RefreshControl, 
  ActivityIndicator, 
  ScrollView,
  Animated,
  Dimensions,
  Alert
} from 'react-native';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSavedArticles } from '../context/SavedArticlesContext';
import { useTheme } from '../context/ThemeContext';
import { globalStyles } from '../styles/globalStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GestureRecognizer from 'react-native-swipe-gestures';
import AIService from '../services/AIService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Define available news categories/groups
const NEWS_GROUPS = [
  'general',
  'business', 
  'technology',
  'politics',
  'entertainment',
  'sports',
  'health'
];

const DashboardScreen = ({ navigation, route }) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const { savedArticles, isArticleSaved, toggleSaveArticle } = useSavedArticles();
  const [headerAnimation] = useState(new Animated.Value(0));
  const [isConnected, setIsConnected] = useState(false);
  const [userId, setUserId] = useState(null);

  // Initialize AI Service with user data
  useEffect(() => {
    const initializeService = async () => {
      try {
        // Get user data from route params (from login)
        const userData = route?.params?.userData || { id: 'demo_user' };
        setUserId(userData.id);
        
        // Initialize AI Service
        await AIService.initialize(userData.authToken);
        
        // Try to connect to the backend
        try {
          const serverInfo = await AIService.getServerInfo();
          setIsConnected(true);
          console.log('Connected to NewsPortal Backend:', serverInfo.message);
        } catch (serverError) {
          console.warn('Could not connect to backend, continuing in offline mode:', serverError.message);
          setIsConnected(false);
          // Continue without backend connection
        }
        
        // Load initial data (will use fallbacks if backend is unavailable)
        await Promise.all([
          loadCategories(),
          loadLatestNews()
        ]);
        
      } catch (error) {
        console.error('Failed to initialize AI service:', error);
        setIsConnected(false);
        
        // Don't block the app - continue with offline mode
        console.log('Continuing in offline mode...');
        
        // Try to load some data anyway
        try {
          await Promise.all([
            loadCategories(),
            loadLatestNews()
          ]);
        } catch (loadError) {
          console.error('Failed to load fallback data:', loadError);
        }
      }
    };

    initializeService();
  }, [route?.params?.userData]);

  // Load categories from AI backend
  const loadCategories = async () => {
    try {
      if (isConnected) {
        const categoryData = await AIService.getNewsCategories();
        setCategories(categoryData);
        // Set default selected categories to top 2
        const topCategories = categoryData
          .sort((a, b) => b.count - a.count)
          .slice(0, 2)
          .map(cat => cat.name);
        setSelectedCategories(topCategories);
      } else {
        // Offline mode - provide default categories
        const defaultCategories = [
          { name: 'general', count: 0, color: '#007AFF' },
          { name: 'technology', count: 0, color: '#5856D6' },
          { name: 'business', count: 0, color: '#34C759' },
          { name: 'politics', count: 0, color: '#FF9500' },
          { name: 'entertainment', count: 0, color: '#9C88FF' },
        ];
        setCategories(defaultCategories);
        setSelectedCategories(['general']);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      // Provide fallback even if connected mode fails
      const fallbackCategories = [
        { name: 'general', count: 0, color: '#007AFF' },
        { name: 'technology', count: 0, color: '#5856D6' },
      ];
      setCategories(fallbackCategories);
      setSelectedCategories(['general']);
    }
  };

  // Fetch AI-enhanced news
  const loadLatestNews = async (options = {}) => {
    setLoading(true);
    try {
      if (isConnected) {
        // Try to load from backend
        const newsOptions = {
          limit: 50,
          category: selectedCategories.length > 0 ? selectedCategories.join(',') : null,
          ...options
        };
        const newsData = await AIService.getLatestNews(newsOptions);
        // Transform data to match expected format
        console.log('🔍 Raw API response sample:', JSON.stringify(newsData[0], null, 2));
        const transformedArticles = newsData.map(article => ({
          id: article.id,
          title: article.title,
          description: article.description || article.ai_summary || article.excerpt,
          content: article.content || article.excerpt || 'No content available.',
          url: article.url,
          image: article.image && article.image !== 'default' ? article.image : null,
          urlToImage: article.image && article.image !== 'default' ? article.image : null,
          publishedAt: article.published_at,
          source: { name: article.source || 'Unknown' },
          author: article.author,
          category: article.category,
          sentiment_score: article.sentiment_score,
          ai_summary: article.ai_summary,
          reading_time_minutes: article.reading_time_minutes,
          is_trending: article.is_trending
        }));
        
        console.log('🔍 Transformed article sample:', JSON.stringify(transformedArticles[0], null, 2));
        
        setArticles(transformedArticles);
        
        // Record user interaction
        if (userId) {
          AIService.recordInteraction(userId, 'feed_view', 'dashboard_load', {
            categories: selectedCategories,
            article_count: transformedArticles.length
          });
        }
      } else {
        // Offline mode - provide sample data
        const sampleArticles = [
          {
            id: 1,
            title: "Welcome to NewsPortal",
            description: "This is a demo article shown when the backend is not available. The app is designed to work with a news aggregation backend.",
            content: "NewsPortal is a modern news aggregation app with AI-powered features including sentiment analysis, smart summaries, and personalized recommendations.",
            url: "https://example.com",
            image: null,
            published_at: new Date().toISOString(),
            source: "NewsPortal",
            author: "NewsPortal Team",
            category: "technology",
            sentiment_score: 0.3,
            ai_summary: "Welcome to NewsPortal - your AI-powered news companion.",
            reading_time_minutes: 2,
            is_trending: true
          },
          {
            id: 2,
            title: "Backend Connection Required",
            description: "To see real news articles, please ensure the backend server is running on localhost:8001",
            content: "Start the backend by running 'python main.py' in the NewsPortal directory.",
            url: "https://example.com",
            image: null,
            published_at: new Date().toISOString(),
            source: "System",
            author: "System",
            category: "general",
            sentiment_score: 0,
            ai_summary: "Instructions for connecting to the news backend service.",
            reading_time_minutes: 1,
            is_trending: false
          }
        ];
        
        setArticles(sampleArticles);
      }
      
    } catch (error) {
      console.error('Failed to load news:', error);
      // Don't show alert in offline mode, just log the error
      if (isConnected) {
        Alert.alert('Error', 'Failed to load latest news. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Search news with AI
  const searchNews = async (query) => {
    if (!query.trim()) return;
    
    try {
      setLoading(true);
      
      if (isConnected) {
        const searchResults = await AIService.searchNews(query, {
          limit: 20,
          category: selectedCategories.length > 0 ? selectedCategories.join(',') : null
        });
        const transformedResults = searchResults.map(article => ({
          id: article.id,
          title: article.title,
          description: article.description || article.ai_summary || article.excerpt,
          content: article.content || article.excerpt || 'No content available.',
          url: article.url,
          image: article.image && article.image !== 'default' ? article.image : null,
          urlToImage: article.image && article.image !== 'default' ? article.image : null,
          publishedAt: article.published_at,
          source: { name: article.source || 'Unknown' },
          author: article.author,
          category: article.category,
          sentiment_score: article.sentiment_score,
          ai_summary: article.ai_summary,
          reading_time_minutes: article.reading_time_minutes,
          is_trending: article.is_trending
        }));
        
        setArticles(transformedResults);
        
        // Record search interaction
        if (userId) {
          AIService.recordInteraction(userId, 'search', 'dashboard_search', {
            query,
            result_count: transformedResults.length
          });
        }
      } else {
        // Offline mode - show message about search not being available
        Alert.alert(
          'Search Offline', 
          'Search functionality requires connection to the news backend. Please ensure the backend server is running on localhost:8001.',
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      console.error('Search failed:', error);
      Alert.alert('Error', 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      AIService.clearCache(); // Clear cache for fresh data
      await Promise.all([
        loadCategories(),
        loadLatestNews()
      ]);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle category selection
  const toggleCategory = (categoryName) => {
    const updatedCategories = selectedCategories.includes(categoryName)
      ? selectedCategories.filter(cat => cat !== categoryName)
      : [...selectedCategories, categoryName];
    
    setSelectedCategories(updatedCategories);
  };

  // Update articles when categories change
  useEffect(() => {
    if (selectedCategories.length > 0) {
      loadLatestNews();
    }
  }, [selectedCategories]);

  // Header animation effect
  useEffect(() => {
    Animated.timing(headerAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Show all articles (backend already filters)
  const filteredArticles = articles;

  const formatTimeAgo = (publishedAt) => {
    if (!publishedAt) return '';
    const date = new Date(publishedAt);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getCategoryColor = (category) => {
    const colors = {
      'general': theme.colors.primary,
      'business': theme.colors.secondary,
      'technology': theme.colors.accent,
      'politics': theme.colors.warning,
      'entertainment': '#9C88FF',
      'sports': '#FF6B6B',
      'health': '#4ECDC4',
    };
    return colors[category] || theme.colors.textMuted;
  };

  const NewsCard = React.memo(({ item, index }) => {
    const [imageError, setImageError] = useState(false);
    const cardAnimation = new Animated.Value(0);
    
    // Validate item to prevent crashes
    if (!item || typeof item !== 'object') {
      return null;
    }
    
    useEffect(() => {
      Animated.timing(cardAnimation, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, []);

    // Normalize category to match NEWS_GROUPS and fallback to 'Other'
    let category = String(item.category || 'Other');
    if (!NEWS_GROUPS.includes(category)) {
      category = 'Other';
    }
    const categoryColor = getCategoryColor(category);

    // Make NewsCard and cardContent backgrounds fully transparent to avoid blocking dashboard features
    const cardBg = 'transparent';
    const contentBg = 'transparent';
    return (
      <Animated.View 
        style={[
          styles.newsCard,
          {
            backgroundColor: cardBg,
            opacity: cardAnimation,
            transform: [{
              translateY: cardAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              })
            }]
          }
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (typeof item.url === 'string' && item.url.startsWith('http')) {
              const navParams = {
                title: item.title || 'No Title',
                ai_summary: item.ai_summary || '',
                key_points: item.key_points || [],
                content: item.content || item.excerpt || 'No content available.',
                url: item.url
              };
              
              // Debug logging
              console.log('Navigating to NewsDetail with params:', {
                title: navParams.title,
                content: navParams.content,
                hasContent: !!item.content,
                hasExcerpt: !!item.excerpt,
                itemKeys: Object.keys(item)
              });
              
              navigation.navigate('NewsDetail', navParams);
            }
          }}
        >
          {/* Category Badge */}
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>{String(category)}</Text>
          </View>

          {/* Article Image */}
          <View style={styles.imageContainer}>
            <Image
              source={!imageError && item.image ? { uri: item.image } : require('../assets/images/icon.png')}
              style={styles.articleImage}
              resizeMode="cover"
              onError={() => setImageError(true)}
              progressiveRenderingEnabled={true}
              blurRadius={imageError ? 2 : 0}
            />
          <View style={[styles.imageOverlay, { backgroundColor: 'rgba(0,0,0,0.04)' }]} />
          </View>

          {/* Article Content */}
          <View style={[styles.cardContent, { backgroundColor: contentBg }]}> 

            <Text style={[styles.articleTitle, { color: theme.colors.text, lineHeight: 24 }]} numberOfLines={2}>
              {String(item.title || 'No Title')}
            </Text>

            {/* AI Summary if available */}
            {item.ai_summary && typeof item.ai_summary === 'string' && (
              <View style={[styles.aiSummaryContainer, { backgroundColor: theme.colors.primary + '08', borderColor: theme.colors.primary + '20', borderWidth: 1 }]}>
                <View style={styles.aiLabel}>
                  <Ionicons name="sparkles" size={14} color={theme.colors.primary} />
                  <Text style={[styles.aiLabelText, { color: theme.colors.primary }]}>AI Summary</Text>
                </View>
                <Text style={[styles.aiSummaryText, { color: theme.colors.text }]} numberOfLines={2}>
                  {item.ai_summary}
                </Text>
              </View>
            )}

            {/* Sentiment and Reading Time */}
            <View style={styles.aiMetrics}>
              {typeof item.sentiment_score === 'number' && (
                <View style={styles.sentimentBadge}>
                  <Ionicons 
                    name={item.sentiment_score > 0.2 ? 'happy' : item.sentiment_score < -0.2 ? 'sad' : 'remove'} 
                    size={12} 
                    color={item.sentiment_score > 0.2 ? '#4CAF50' : item.sentiment_score < -0.2 ? '#F44336' : '#FFC107'} 
                  />
                  <Text style={[styles.sentimentText, { color: theme.colors.textMuted }]}>
                    {item.sentiment_score > 0.2 ? 'Positive' : item.sentiment_score < -0.2 ? 'Negative' : 'Neutral'}
                  </Text>
                </View>
              )}
              
              {item.reading_time_minutes && typeof item.reading_time_minutes === 'number' && (
                <View style={styles.readingTime}>
                  <Ionicons name="time" size={12} color={theme.colors.textMuted} />
                  <Text style={[styles.readingTimeText, { color: theme.colors.textMuted }]}>
                    {item.reading_time_minutes} min read
                  </Text>
                </View>
              )}

              {item.is_trending && (
                <View style={styles.trendingBadge}>
                  <Ionicons name="trending-up" size={12} color="#FF6B35" />
                  <Text style={[styles.trendingText, { color: '#FF6B35' }]}>Trending</Text>
                </View>
              )}
            </View>

            {/* Show content or description */}
            {(() => {
              function stripHtml(html) {
                if (!html || typeof html !== 'string') return '';
                return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
              }
              let content = '';
              if (typeof item.description === 'string') {
                content = stripHtml(item.description);
              } else if (typeof item.content === 'string') {
                content = stripHtml(item.content);
              } else if (typeof item.excerpt === 'string') {
                content = stripHtml(item.excerpt);
              }
              return content ? (
                <Text style={[styles.articleExcerpt, { color: theme.colors.textSecondary, marginBottom: 8 }]} numberOfLines={3}>
                  {content}
                </Text>
              ) : null;
            })()}

            <View style={styles.cardFooter}>
              <View style={styles.metaInfo}>
                <Text style={[styles.sourceText, { color: theme.colors.primary, flexShrink: 1, minWidth: 0 }]} numberOfLines={1} ellipsizeMode="tail">
                  {(() => {
                    if (typeof item.source === 'object' && item.source?.name) {
                      return String(item.source.name);
                    } else if (typeof item.source === 'string') {
                      return item.source;
                    } else {
                      return 'Unknown Source';
                    }
                  })()}
                </Text>
                <View style={styles.dot} />
                <Text style={[styles.timeText, { color: theme.colors.textMuted }]}>{String(formatTimeAgo(item.published_at))}</Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => toggleSaveArticle(item)}>
                  <MaterialIcons name={isArticleSaved(item) ? 'bookmark' : 'bookmark-border'} size={20} color={isArticleSaved(item) ? theme.colors.primary : theme.colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { marginLeft: 8 }]}>
                  <Feather name="share-2" size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { marginLeft: 8 }]}>
                  <Feather name="more-horizontal" size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  });

  const renderNewsCard = ({ item, index }) => <NewsCard item={item} index={index} />;

  // Find the current selected category index
  const currentCategoryIndex = NEWS_GROUPS.findIndex(cat => selectedCategories[0] === cat);

  // Handler for swipe left/right
  const handleSwipeLeft = () => {
    if (currentCategoryIndex < NEWS_GROUPS.length - 1) {
      setSelectedCategories([NEWS_GROUPS[currentCategoryIndex + 1]]);
    }
  };

  const handleSwipeRight = () => {
    if (currentCategoryIndex > 0) {
      setSelectedCategories([NEWS_GROUPS[currentCategoryIndex - 1]]);
    }
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Removed debug Hello World */}
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {/* Search Bar */}
      <View style={[
        globalStyles.card,
        styles.searchContainer,
        {
          marginTop: insets.top,
          marginBottom: 0,
          paddingVertical: theme.spacing.sm,
          alignSelf: 'stretch',
          width: '100%',
          borderRadius: theme.borderRadius.lg,
          backgroundColor: theme.colors.background,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.lg,
        },
      ]}>
        <MaterialIcons name="search" size={20} color={theme.colors.text} />
        <TextInput
          style={[
            styles.searchInput,
            {
              width: '100%',
              color: theme.colors.text,
              fontFamily: 'Roboto-Regular',
              fontSize: 16,
            },
          ]}
          placeholder="Search news, topics..."
          placeholderTextColor={theme.colors.text}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => {
            if (search.trim()) {
              searchNews(search.trim());
            } else {
              loadLatestNews(); // Load default news if search is cleared
            }
          }}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => {
            if (search.trim()) {
              searchNews(search.trim());
            }
          }}
        >
          <MaterialIcons name="search" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      {/* Categories */}
      <View style={[styles.categoriesSection, { paddingVertical: theme.spacing.md, backgroundColor: theme.colors.background, borderWidth: 0, paddingHorizontal: theme.spacing.lg, marginTop: 0 }]}> 
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.categoriesContainer, { backgroundColor: theme.colors.background }]}
        >
          {/* Add "All" category first */}
          <TouchableOpacity
            key="all"
            style={[
              styles.categoryChip,
              selectedCategories.length === 0
                ? { backgroundColor: theme.colors.primary, borderRadius: 20 }
                : { backgroundColor: theme.colors.surfaceUltraLight, borderRadius: 20 },
              { borderWidth: 0, paddingHorizontal: 18, paddingVertical: 7 },
            ]}
            onPress={() => setSelectedCategories([])}
          >
            <Text style={[
              styles.categoryChipText,
              selectedCategories.length === 0
                ? { color: theme.colors.textInverse, fontWeight: '700' }
                : { color: theme.colors.textSecondary },
            ]}>
              All
            </Text>
          </TouchableOpacity>
          
          {/* Dynamic categories from backend */}
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category.name);
            const categoryColor = getCategoryColor(category.name);
            return (
              <TouchableOpacity
                key={category.name}
                style={[
                  styles.categoryChip,
                  isSelected
                    ? { backgroundColor: categoryColor, borderRadius: 20 }
                    : { backgroundColor: theme.colors.surfaceUltraLight, borderRadius: 20 },
                  { borderWidth: 0, paddingHorizontal: 18, paddingVertical: 7 },
                ]}
                onPress={() => toggleCategory(category.name)}
              >
                <Text style={[
                  styles.categoryChipText,
                  isSelected
                    ? { color: theme.colors.textInverse, fontWeight: '700' }
                    : { color: theme.colors.textSecondary },
                ]}>
                  {category.display_name || category.name} ({category.count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      {/* News Feed */}
      {loading && articles.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading latest news...</Text>
        </View>
      ) : (
        <GestureRecognizer
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          style={{ flex: 1 }}
        >
          <FlatList
            data={filteredArticles}
            renderItem={renderNewsCard}
            keyExtractor={(item) => item.id?.toString() || item.url}
            contentContainerStyle={{
              ...styles.newsList,
              paddingBottom: 20,
              paddingTop: 8,
            }}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
            initialNumToRender={5}
            windowSize={10}
            removeClippedSubviews={false}
          />
        </GestureRecognizer>
      )}
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  newsCard: {
    borderRadius: 24, // theme.borderRadius.xl
    marginBottom: 24, // theme.spacing.lg
    marginHorizontal: 16, // Add horizontal margins
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryBadge: {
    position: 'absolute',
    top: 16, // theme.spacing.md
    left: 16, // theme.spacing.md
    paddingHorizontal: 16, // theme.spacing.md
    paddingVertical: 4, // theme.spacing.xs
    borderRadius: 8, // theme.borderRadius.sm
    zIndex: 1,
  },
  categoryText: {
    fontFamily: 'Roboto-Medium',
    fontSize: 12,
  },
  imageContainer: {
    position: 'relative',
    height: 220,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  articleImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  cardContent: {
    padding: 20, // theme.spacing.lg
    backgroundColor: 'transparent',
  },
  articleTitle: {
    fontFamily: 'Roboto-Bold',
    fontSize: 18,
    marginBottom: 8,
    lineHeight: 24,
  },
  articleExcerpt: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  sourceText: {
    fontSize: 12, // theme.typography.fontSize.xs
    fontWeight: '600',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 8, // theme.spacing.sm
    backgroundColor: '#999', // Add explicit background color
  },
  timeText: {
    fontSize: 12, // theme.typography.fontSize.xs
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionButton: {
    padding: 8, // theme.spacing.sm
    borderRadius: 8, // theme.borderRadius.sm
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 64, // theme.spacing['3xl']
  },
  loadingText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 16,
    marginTop: 12,
  },
  // AI-enhanced styles
  aiSummaryContainer: {
    marginVertical: 8,
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: 'currentColor',
  },
  aiLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  aiLabelText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  aiSummaryText: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  aiMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    flexWrap: 'wrap',
  },
  sentimentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  sentimentText: {
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '500',
  },
  readingTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  readingTimeText: {
    fontSize: 11,
    marginLeft: 4,
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B3520',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  trendingText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
});
export default DashboardScreen;