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
      {/* Background Effects */}
      <View style={styles.backgroundEffects}>
        <View style={[styles.glowCircle, styles.glowCircle1]} />
        <View style={[styles.glowCircle, styles.glowCircle2]} />
        <View style={[styles.glowCircle, styles.glowCircle3]} />
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
  
  glowCircle: {
    position: 'absolute',
    borderRadius: 200,
    opacity: 0.1,
  },
  
  glowCircle1: {
    width: 300,
    height: 300,
    backgroundColor: theme.colors.primary,
    top: -100,
    right: -100,
  },
  
  glowCircle2: {
    width: 200,
    height: 200,
    backgroundColor: theme.colors.secondary,
    bottom: -50,
    left: -50,
  },
  
  glowCircle3: {
    width: 150,
    height: 150,
    backgroundColor: theme.colors.accent,
    top: height * 0.4,
    left: -75,
  },
  
  // Gradient variants
  gradientPrimary: {
    backgroundColor: theme.colors.background,
  },
  
  gradientSecondary: {
    backgroundColor: theme.colors.surface,
  },
  
  gradientDark: {
    backgroundColor: '#000000',
  },
  
  gradientCard: {
    backgroundColor: theme.colors.card,
  },
});

export default GradientBackground;