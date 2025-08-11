import React from 'react';
import { View, Text, StyleSheet, Linking, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { globalStyles } from '../styles/globalStyles';

const NewsDetailScreen = ({ route }) => {
  const { title, ai_summary, key_points, content, url } = route.params;
  const { theme } = useTheme();

  // Debug logging
  console.log('NewsDetailScreen received params:', {
    title: title || 'NO_TITLE',
    content: content || 'NO_CONTENT', 
    url: url || 'NO_URL',
    paramsKeys: Object.keys(route.params || {})
  });

  return (
    <ScrollView style={[globalStyles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={[styles.card, { backgroundColor: theme.colors.card, shadowColor: theme.colors.surfaceLight }]}> 
        <Text style={[globalStyles.title, { color: theme.colors.text }]}>{title}</Text>
        {ai_summary ? (
          <View style={globalStyles.section}>
            <Text style={[globalStyles.subtitle, { color: theme.colors.primary }]}>AI Enhanced Summary</Text>
            <Text style={[globalStyles.text, styles.content, { color: theme.colors.text }]}>{ai_summary}</Text>
          </View>
        ) : null}
        {key_points && key_points.length > 0 ? (
          <View style={globalStyles.section}>
            <Text style={[globalStyles.subtitle, { color: theme.colors.primary }]}>Key Points</Text>
            {key_points.map((point, idx) => (
              <Text key={idx} style={[styles.keyPoint, { color: theme.colors.textSecondary }]}>{`• ${point}`}</Text>
            ))}
          </View>
        ) : null}
        <View style={globalStyles.section}>
          <Text style={[globalStyles.subtitle, { color: theme.colors.primary }]}>Full Article</Text>
          <Text style={[globalStyles.text, styles.content, { color: theme.colors.text }]}>
            {content || 'Content is missing or undefined'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => Linking.openURL(url)} style={[globalStyles.button, { backgroundColor: theme.colors.primary }]}> 
          <Text style={[globalStyles.buttonText, { color: theme.colors.textInverse }]}>Read more</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  content: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
  },
  keyPoint: {
    fontSize: 15,
    marginLeft: 10,
    marginBottom: 2,
    lineHeight: 22,
  },
});

export default NewsDetailScreen;
