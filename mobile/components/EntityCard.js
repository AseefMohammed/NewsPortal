import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const EntityCard = ({ entity }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{entity.name}</Text>
      <Text style={styles.info}>Brief info about {entity.name} will appear here.</Text>
      <Text style={styles.news}>Latest news headline will appear here.</Text>
      <TouchableOpacity style={styles.link}>
        <Text style={styles.linkText}>News Channel Link</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.archiveButton}>
        <Text style={styles.archiveText}>Archive</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 6,
  },
  info: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  news: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
  },
  link: {
    marginBottom: 8,
  },
  linkText: {
    color: '#007bff',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  archiveButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#f1c40f',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  archiveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default EntityCard; 