import React from 'react';
import { theme } from '../../styles/theme';

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
    <div style={{ ...styles.container, ...getGradientStyle(), ...style }}>
      {/* Background Effects */}
      <div style={styles.backgroundEffects}>
        <div style={{ ...styles.glowCircle, ...styles.glowCircle1 }} />
        <div style={{ ...styles.glowCircle, ...styles.glowCircle2 }} />
        <div style={{ ...styles.glowCircle, ...styles.glowCircle3 }} />
      </div>
      
      {/* Content */}
      <div style={styles.content}>
        {children}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
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
    borderRadius: '50%',
    opacity: 0.1,
  },
  
  glowCircle1: {
    width: '300px',
    height: '300px',
    backgroundColor: theme.colors.primary,
    top: '-100px',
    right: '-100px',
  },
  
  glowCircle2: {
    width: '200px',
    height: '200px',
    backgroundColor: theme.colors.secondary,
    bottom: '-50px',
    left: '-50px',
  },
  
  glowCircle3: {
    width: '150px',
    height: '150px',
    backgroundColor: theme.colors.accent,
    top: '40%',
    left: '-75px',
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
};

export default GradientBackground;