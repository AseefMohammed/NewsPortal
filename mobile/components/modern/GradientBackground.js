import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { theme } from '../../styles/theme';

const { width, height } = Dimensions.get('window');

const GradientBackground = ({ 
  children, 
  variant = 'primary',
  animated = false,
  style 
}) => {
  const getGradientStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.gradientSecondary;
      case 'dark':
        return styles.gradientDark;
      case 'card':
        return styles.gradientCard;
      default:
        return styles.gradientPrimary;
    }
  };

  return (
    <View style={[styles.container, getGradientStyle(), style]}>
      {/* Subtle background accents */}
      <View style={styles.backgroundEffects} pointerEvents="none">
        <View style={[styles.accentBlock, styles.accent1]} />
        <View style={[styles.accentBlock, styles.accent2]} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  
  content: {
    flex: 1,
    zIndex: 1,
  },
  
  backgroundEffects: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  accentBlock: {
    position: 'absolute',
    borderRadius: 12,
    opacity: 0.6,
  },
  accent1: {
    width: 220,
    height: 120,
    backgroundColor: theme.colors.surface,
    top: 20,
    right: 20,
    transform: [{ rotate: '12deg' }],
  },
  accent2: {
    width: 160,
    height: 90,
    backgroundColor: theme.colors.card,
    bottom: 30,
    left: 10,
    transform: [{ rotate: '-8deg' }],
  },
  
  // Gradient variants
  gradientPrimary: {
    backgroundColor: theme.colors.background,
  },
  
  gradientSecondary: {
    backgroundColor: theme.colors.surface,
  },
  
  gradientDark: {
  backgroundColor: theme.colors.primaryDark || '#000000',
  },
  
  gradientCard: {
    backgroundColor: theme.colors.card,
  },
});

export default GradientBackground;