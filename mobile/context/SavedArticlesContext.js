import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SavedArticlesContext = createContext();

export const SavedArticlesProvider = ({ children }) => {
  const [savedArticles, setSavedArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load saved articles from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('savedArticles');
        if (saved) {
          setSavedArticles(JSON.parse(saved));
        }
      } catch (e) {
        setSavedArticles([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Save to AsyncStorage whenever savedArticles changes
  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem('savedArticles', JSON.stringify(savedArticles));
    }
  }, [savedArticles, loading]);

  const isArticleSaved = useCallback(
    (article) => savedArticles.some(a => a.url === article.url),
    [savedArticles]
  );

  const toggleSaveArticle = useCallback(
    (article) => {
      setSavedArticles(prev => {
        if (prev.some(a => a.url === article.url)) {
          return prev.filter(a => a.url !== article.url);
        } else {
          return [article, ...prev];
        }
      });
    },
    []
  );

  const removeSavedArticle = useCallback(
    (article) => {
      setSavedArticles(prev => prev.filter(a => a.url !== article.url));
    },
    []
  );

  const removeSelectedArticles = useCallback(
    (urls) => {
      setSavedArticles(prev => prev.filter(a => !urls.includes(a.url)));
    },
    []
  );

  return (
    <SavedArticlesContext.Provider value={{ savedArticles, loading, isArticleSaved, toggleSaveArticle, removeSavedArticle, removeSelectedArticles }}>
      {children}
    </SavedArticlesContext.Provider>
  );
};

export const useSavedArticles = () => useContext(SavedArticlesContext);
