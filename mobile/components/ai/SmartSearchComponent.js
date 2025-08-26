
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

const SmartSearchComponent = ({ onSearchResults, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchMode, setSearchMode] = useState('semantic'); // 'semantic' or 'keyword'

  useEffect(() => {
    if (searchQuery.length > 2) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const fetchSuggestions = async () => {
    try {
      // This would call your AI-powered search suggestions endpoint
      const response = await fetch(`http://localhost:9100/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const performSearch = async (query = searchQuery) => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const endpoint = searchMode === 'semantic' 
        ? `/search/semantic?q=${encodeURIComponent(query)}`
        : `/search/keyword?q=${encodeURIComponent(query)}`;
      
      const response = await fetch(`http://localhost:9100${endpoint}`);
      const results = await response.json();
      
      // Add to recent searches
      setRecentSearches(prev => {
        const updated = [query, ...prev.filter(item => item !== query)].slice(0, 5);
        return updated;
      });
      
      onSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity 
      style={styles.suggestionItem}
      onPress={() => {
        setSearchQuery(item.text);
        performSearch(item.text);
      }}
    >
      <MaterialIcons name="search" size={16} color="#6B7280" />
      <Text style={styles.suggestionText}>{item.text}</Text>
      {item.type && (
        <View style={styles.suggestionType}>
          <Text style={styles.suggestionTypeText}>{item.type}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderRecentSearch = ({ item }) => (
    <TouchableOpacity 
      style={styles.recentItem}
      onPress={() => {
        setSearchQuery(item);
        performSearch(item);
      }}
    >
      <MaterialIcons name="history" size={16} color="#6B7280" />
      <Text style={styles.recentText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Smart Search</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialIcons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search news with AI..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => performSearch()}
            autoFocus
          />
          {isLoading && <ActivityIndicator size="small" color={theme.colors.primary} />}
        </View>

        {/* Search Mode Toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeButton, searchMode === 'semantic' && styles.modeButtonActive]}
            onPress={() => setSearchMode('semantic')}
          >
            <MaterialIcons name="psychology" size={16} color={searchMode === 'semantic' ? '#FFFFFF' : '#6B7280'} />
            <Text style={[styles.modeText, searchMode === 'semantic' && styles.modeTextActive]}>
              AI Search
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.modeButton, searchMode === 'keyword' && styles.modeButtonActive]}
            onPress={() => setSearchMode('keyword')}
          >
            <MaterialIcons name="text-fields" size={16} color={searchMode === 'keyword' ? '#FFFFFF' : '#6B7280'} />
            <Text style={[styles.modeText, searchMode === 'keyword' && styles.modeTextActive]}>
              Keyword
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {suggestions.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>Suggestions</Text>
            <FlatList
              data={suggestions}
              renderItem={renderSuggestion}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
            />
          </View>
        ) : recentSearches.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <FlatList
              data={recentSearches}
              renderItem={renderRecentSearch}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
            />
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="search" size={48} color={theme.colors.border || '#D1D5DB'} />
            <Text style={styles.emptyStateText}>
              {searchMode === 'semantic' 
                ? 'Try natural language queries like "positive tech news" or "healthcare breakthroughs"'
                : 'Search for specific keywords or phrases'
              }
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface || '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  borderBottomColor: theme.colors.border || '#E5E7EB',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  placeholder: {
    width: 32,
  },
  searchContainer: {
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  backgroundColor: theme.colors.surfaceUltraLight || '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  color: theme.colors.text,
    marginLeft: 8,
  },
  modeToggle: {
    flexDirection: 'row',
  backgroundColor: theme.colors.surfaceUltraLight || '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  modeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  modeText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  modeTextActive: {
    color: theme.colors.surfaceUltraLight || '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  borderBottomColor: theme.colors.surfaceUltraLight || '#F3F4F6',
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
  color: theme.colors.textSecondary,
    marginLeft: 12,
  },
  suggestionType: {
  backgroundColor: theme.colors.surfaceUltraLight || '#EEF2FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  suggestionTypeText: {
    fontSize: 12,
  color: theme.colors.primary,
    fontWeight: '500',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  borderBottomColor: theme.colors.surfaceUltraLight || '#F3F4F6',
  },
  recentText: {
    fontSize: 15,
  color: theme.colors.textSecondary,
    marginLeft: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
});

export default SmartSearchComponent;
