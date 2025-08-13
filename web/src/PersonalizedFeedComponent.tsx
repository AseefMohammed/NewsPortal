
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const PersonalizedFeedComponent = ({ userId, onNewsItemPress }) => {
  const [feedData, setFeedData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [feedType, setFeedType] = useState('recommended'); // 'recommended', 'trending', 'recent'

  useEffect(() => {
    loadFeed();
  }, [feedType]);

  const loadFeed = async () => {
    setIsLoading(true);
    try {
      const endpoint = getFeedEndpoint();
      const response = await fetch(`http://localhost:9100${endpoint}`);
      const data = await response.json();
      setFeedData(data);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFeedEndpoint = () => {
    switch (feedType) {
      case 'recommended':
        return `/feed/personalized?user_id=${userId}`;
      case 'trending':
        return '/feed/trending';
      case 'recent':
        return '/news/enhanced?limit=50';
      default:
        return '/news/enhanced?limit=50';
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  const renderFeedTypeButton = (type, label, icon) => (
    <TouchableOpacity
      style={[styles.feedTypeButton, feedType === type && styles.feedTypeButtonActive]}
      onPress={() => setFeedType(type)}
    >
      <MaterialIcons 
        name={icon} 
        size={16} 
        color={feedType === type ? '#FFFFFF' : '#6B7280'} 
      />
      <Text style={[styles.feedTypeText, feedType === type && styles.feedTypeTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderNewsItem = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.newsItem}
      onPress={() => onNewsItemPress(item)}
    >
      <View style={styles.newsHeader}>
        <Text style={styles.newsTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {item.ai_confidence && (
          <View style={styles.aiIndicator}>
            <MaterialIcons name="auto-awesome" size={12} color="#4F46E5" />
          </View>
        )}
      </View>

      {item.ai_summary && (
        <Text style={styles.aiSummary} numberOfLines={2}>
          {item.ai_summary}
        </Text>
      )}

      <View style={styles.newsFooter}>
        <View style={styles.newsMetadata}>
          <Text style={styles.newsSource}>{item.source}</Text>
          <Text style={styles.newsDot}>•</Text>
          <Text style={styles.newsTime}>
            {new Date(item.published_at).toLocaleDateString()}
          </Text>
        </View>

        {item.sentiment && (
          <View style={[styles.sentimentBadge, { backgroundColor: getSentimentColor(item.sentiment) }]}>
            <Text style={styles.sentimentText}>
              {item.sentiment.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {item.topics && item.topics.length > 0 && (
        <View style={styles.topicsContainer}>
          {item.topics.slice(0, 3).map((topic, topicIndex) => (
            <View key={topicIndex} style={styles.topicTag}>
              <Text style={styles.topicText}>{topic}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Personalization Score */}
      {item.personalization_score && (
        <View style={styles.personalizationScore}>
          <MaterialIcons name="person" size={12} color="#10B981" />
          <Text style={styles.scoreText}>
            {Math.round(item.personalization_score * 100)}% match
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return '#10B981';
      case 'negative': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      {/* Feed Type Selector */}
      <View style={styles.feedTypeSelector}>
        {renderFeedTypeButton('recommended', 'For You', 'person')}
        {renderFeedTypeButton('trending', 'Trending', 'trending-up')}
        {renderFeedTypeButton('recent', 'Recent', 'schedule')}
      </View>

      {/* Feed List */}
      <FlatList
        data={feedData}
        renderItem={renderNewsItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  feedTypeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  feedTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  feedTypeButtonActive: {
    backgroundColor: '#4F46E5',
  },
  feedTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 4,
  },
  feedTypeTextActive: {
    color: '#FFFFFF',
  },
  feedList: {
    paddingVertical: 8,
  },
  newsItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  newsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  newsTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 22,
  },
  aiIndicator: {
    marginLeft: 8,
    marginTop: 2,
  },
  aiSummary: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  newsMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  newsSource: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  newsDot: {
    fontSize: 12,
    color: '#D1D5DB',
    marginHorizontal: 6,
  },
  newsTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  sentimentBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sentimentText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  topicTag: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 4,
  },
  topicText: {
    fontSize: 10,
    color: '#4F46E5',
    fontWeight: '500',
  },
  personalizationScore: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  scoreText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '500',
    marginLeft: 2,
  },
});

export default PersonalizedFeedComponent;
