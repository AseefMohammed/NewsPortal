import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity, 
  Image,
  Animated,
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSavedArticles } from '../context/SavedArticlesContext';
import { useTheme } from '../context/ThemeContext';
import { globalStyles } from '../styles/globalStyles';

const { width } = Dimensions.get('window');

const SavesScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { savedArticles, loading, removeSavedArticle, removeSelectedArticles } = useSavedArticles();
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [headerAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(headerAnimation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Remove selected articles using context
  const handleRemoveSelectedArticles = async () => {
    removeSelectedArticles(selectedItems);
    setSelectedItems([]);
    setIsSelectionMode(false);
  };

  const toggleSelection = (articleUrl) => {
    setSelectedItems(prev => 
      prev.includes(articleUrl) 
        ? prev.filter(url => url !== articleUrl)
        : [...prev, articleUrl]
    );
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedItems([]);
  };

  const confirmRemoveSelected = () => {
    Alert.alert(
      'Remove Articles',
      `Are you sure you want to remove ${selectedItems.length} article(s) from your saved list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: handleRemoveSelectedArticles },
      ]
    );
  };

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

  const SavedArticleCard = React.memo(({ item, index }) => {
    const [imageError, setImageError] = useState(false);
    const cardAnimation = new Animated.Value(0);
    useEffect(() => {
      Animated.timing(cardAnimation, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, []);
    return (
      <Animated.View
        style={[
          styles.newsCard,
          {
            backgroundColor: theme.colors.card,
            opacity: cardAnimation,
            transform: [{
              translateY: cardAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              })
            }],
            shadowColor: theme.colors.surfaceLight,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 2,
          },
        ]}
      >
        <TouchableOpacity activeOpacity={0.8}>
          {/* Article Image */}
          <View style={styles.imageContainer}>
            <Image
              source={!imageError && item.image ? { uri: item.image } : require('../assets/images/icon.png')}
              style={styles.articleImage}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          </View>
          {/* Article Content */}
          <View style={styles.cardContent}>
            <Text style={[styles.articleTitle, { color: theme.colors.text }]} numberOfLines={2}>
              {item.title}
            </Text>
            {item.excerpt && (
              <Text style={[styles.articleExcerpt, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                {item.excerpt}
              </Text>
            )}
            <View style={styles.cardFooter}>
              <View style={styles.metaInfo}>
                <Text style={[styles.sourceText, { color: theme.colors.primary, flexShrink: 1, minWidth: 0 }]} numberOfLines={1} ellipsizeMode="tail">{item.source}</Text>
                <View style={[styles.dot, { backgroundColor: theme.colors.textMuted }]} />
                <Text style={[styles.timeText, { color: theme.colors.textMuted }]}>{formatTimeAgo(item.published_at)}</Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => removeSavedArticle(item)}>
                  <MaterialIcons name="bookmark-remove" size={20} color={theme.colors.secondary} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { marginLeft: 8 }]}>
                  <Feather name="share-2" size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  });

  const renderSavedArticle = ({ item, index }) => <SavedArticleCard item={item} index={index} />;

  const EmptyState = () => (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: theme.spacing.xl, backgroundColor: theme.colors.background }}>
      <View style={{ width: 120, height: 120, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.xl, backgroundColor: theme.colors.surface, borderRadius: 60 }}>
        <MaterialIcons name="bookmark-border" size={80} color={theme.colors.textMuted} />
      </View>
      <Text style={{ fontFamily: 'Roboto-Bold', fontSize: 20, color: theme.colors.text, marginBottom: theme.spacing.md, textAlign: 'center' }}>No Saved Articles</Text>
      <Text style={{ fontFamily: 'Roboto-Regular', fontSize: 16, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.xl, lineHeight: 22 }}>Articles you bookmark will appear here for easy access later</Text>
      <TouchableOpacity style={{ borderRadius: theme.borderRadius.md, paddingVertical: theme.spacing.md, alignItems: 'center', marginVertical: theme.spacing.sm, flexDirection: 'row', gap: theme.spacing.sm, backgroundColor: theme.colors.primary }}>
        <Text style={{ fontFamily: 'Roboto-Bold', fontSize: 16, color: theme.colors.textInverse }}>Explore News</Text>
        <MaterialIcons name="arrow-forward" size={20} color={theme.colors.textInverse} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, paddingTop: theme.spacing.lg }}>
      <StatusBar style="light" />
      {/* Header */}
      <Animated.View
        style={{
          backgroundColor: theme.colors.background,
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.lg,
          paddingBottom: theme.spacing.md,
          opacity: headerAnimation,
          transform: [{
            translateY: headerAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [-50, 0],
            })
          }],
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
          <View>
            <Text style={{ fontFamily: 'Roboto-Bold', fontSize: 20, color: theme.colors.text, marginBottom: 4 }}>Saved Articles</Text>
            <Text style={{ fontFamily: 'Roboto-Medium', fontSize: 18, color: theme.colors.textSecondary }}>{savedArticles.length} article{savedArticles.length !== 1 ? 's' : ''} saved</Text>
          </View>
          {savedArticles.length > 0 && (
            <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
              {isSelectionMode ? (
                <>
                  <TouchableOpacity
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderRadius: theme.borderRadius.lg,
                      paddingHorizontal: theme.spacing.md,
                      paddingVertical: theme.spacing.sm,
                    }}
                    onPress={toggleSelectionMode}
                  >
                    <Text style={{ fontFamily: 'Roboto-Regular', fontSize: 16, color: theme.colors.primary }}>Cancel</Text>
                  </TouchableOpacity>
                  {selectedItems.length > 0 && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: theme.colors.secondary + '20',
                        borderRadius: theme.borderRadius.lg,
                        paddingHorizontal: theme.spacing.md,
                        paddingVertical: theme.spacing.sm,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                      onPress={confirmRemoveSelected}
                    >
                      <MaterialIcons name="delete" size={20} color={theme.colors.secondary} />
                      <Text style={{ fontFamily: 'Roboto-Regular', fontSize: 16, color: theme.colors.secondary }}> {selectedItems.length} </Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <TouchableOpacity
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.borderRadius.lg,
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.sm,
                  }}
                  onPress={toggleSelectionMode}
                >
                  <MaterialIcons name="edit" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </Animated.View>
      {/* Content */}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ fontFamily: 'Roboto-Regular', fontSize: 16, color: theme.colors.primary, marginTop: theme.spacing.md }}>Loading saved articles...</Text>
        </View>
      ) : savedArticles.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={savedArticles}
          renderItem={renderSavedArticle}
          keyExtractor={(item) => item.url}
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.lg,
            paddingBottom: 100,
          }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          windowSize={10}
          removeClippedSubviews={true}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  newsCard: {
    borderRadius: 24,
    marginBottom: 24,
    overflow: 'hidden',
    width: '100%',
    alignSelf: 'stretch',
    marginHorizontal: 0,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  articleImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    padding: 24,
  },
  articleTitle: {
    fontFamily: 'Roboto-Bold',
    fontSize: 18,
    marginBottom: 4,
  },
  articleExcerpt: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    marginBottom: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  sourceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 8,
  },
  timeText: {
    fontSize: 12,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
});

export default SavesScreen;