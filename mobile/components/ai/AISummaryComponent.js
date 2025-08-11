
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const AISummaryComponent = ({ newsItem, onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);

  useEffect(() => {
    if (newsItem.ai_summary) {
      setAiSummary({
        summary: newsItem.ai_summary,
        key_points: newsItem.key_points || [],
        sentiment: newsItem.sentiment,
        topics: newsItem.topics || [],
        confidence: newsItem.ai_confidence || 0
      });
    }
  }, [newsItem]);

  const fetchAISummary = async () => {
    if (aiSummary) {
      setIsExpanded(!isExpanded);
      return;
    }

    setIsLoading(true);
    try {
      const BACKEND_URL = "http://192.168.120.85:9100"; // Use your Mac's IP address
      const response = await fetch(`${BACKEND_URL}/news/${newsItem.id}/enhance`, {
        method: 'POST'
      });
      
      if (response.ok) {
        // Poll for the enhanced data
        setTimeout(async () => {
          const enhancedResponse = await fetch(`${BACKEND_URL}/news/enhanced?limit=1`);
          const enhancedData = await enhancedResponse.json();
          const enhanced = enhancedData.find(item => item.id === newsItem.id);
          
          if (enhanced && enhanced.ai_summary) {
            setAiSummary({
              summary: enhanced.ai_summary,
              key_points: enhanced.key_points || [],
              sentiment: enhanced.sentiment,
              topics: enhanced.topics || [],
              confidence: enhanced.ai_confidence || 0
            });
            setIsExpanded(true);
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Error fetching AI summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return '#10B981';
      case 'negative': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'sentiment-satisfied';
      case 'negative': return 'sentiment-dissatisfied';
      default: return 'sentiment-neutral';
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header} 
        onPress={fetchAISummary}
        disabled={isLoading}
      >
        <View style={styles.headerLeft}>
          <MaterialIcons name="auto-awesome" size={20} color="#4F46E5" />
          <Text style={styles.headerText}>AI Summary</Text>
          {aiSummary && (
            <View style={[styles.confidenceBadge, { opacity: aiSummary.confidence }]}>
              <Text style={styles.confidenceText}>
                {Math.round(aiSummary.confidence * 100)}%
              </Text>
            </View>
          )}
        </View>
        
        {isLoading ? (
          <ActivityIndicator size="small" color="#4F46E5" />
        ) : (
          <MaterialIcons 
            name={isExpanded ? "expand-less" : "expand-more"} 
            size={24} 
            color="#4F46E5" 
          />
        )}
      </TouchableOpacity>

      {isExpanded && aiSummary && (
        <View style={styles.content}>
          {/* Sentiment Indicator */}
          {aiSummary.sentiment && (
            <View style={styles.sentimentContainer}>
              <MaterialIcons 
                name={getSentimentIcon(aiSummary.sentiment)} 
                size={16} 
                color={getSentimentColor(aiSummary.sentiment)} 
              />
              <Text style={[styles.sentimentText, { color: getSentimentColor(aiSummary.sentiment) }]}>
                {aiSummary.sentiment.charAt(0).toUpperCase() + aiSummary.sentiment.slice(1)}
              </Text>
            </View>
          )}

          {/* AI Summary */}
          <Text style={styles.summaryText}>{aiSummary.summary}</Text>

          {/* Key Points */}
          {aiSummary.key_points.length > 0 && (
            <View style={styles.keyPointsContainer}>
              <Text style={styles.sectionTitle}>Key Points:</Text>
              {aiSummary.key_points.map((point, index) => (
                <View key={index} style={styles.keyPoint}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.keyPointText}>{point}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Topics */}
          {aiSummary.topics.length > 0 && (
            <View style={styles.topicsContainer}>
              <Text style={styles.sectionTitle}>Topics:</Text>
              <View style={styles.topicsRow}>
                {aiSummary.topics.map((topic, index) => (
                  <View key={index} style={styles.topicTag}>
                    <Text style={styles.topicText}>{topic}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginVertical: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  confidenceBadge: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  confidenceText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  sentimentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sentimentText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
    marginBottom: 16,
  },
  keyPointsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  keyPoint: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bullet: {
    color: '#4F46E5',
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  keyPointText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
    lineHeight: 20,
  },
  topicsContainer: {
    marginTop: 8,
  },
  topicsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  topicTag: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  topicText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '500',
  },
});

export default AISummaryComponent;
