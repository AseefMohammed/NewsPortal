import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

const GlowButton = ({ 
  title, 
  onPress, 
  icon, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  ...props 
}) => {
  const glowAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    if (!disabled) {
      const glowLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      glowLoop.start();
      return () => glowLoop.stop();
    }
  }, [disabled]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];
    
    switch (variant) {
      case 'secondary':
        return [...baseStyle, styles.buttonSecondary];
      case 'outline':
        return [...baseStyle, styles.buttonOutline];
      case 'ghost':
        return [...baseStyle, styles.buttonGhost];
      default:
        return [...baseStyle, styles.buttonPrimary];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.textSecondary;
      case 'outline':
        return styles.textOutline;
      case 'ghost':
        return styles.textGhost;
      default:
        return styles.textPrimary;
    }
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
        variant === 'primary' && !disabled && {
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: glowOpacity,
          shadowRadius: 20,
          elevation: 10,
        },
        style,
      ]}
    >
      <TouchableOpacity
        style={[
          ...getButtonStyle(),
          disabled && styles.buttonDisabled,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        {...props}
      >
        {loading ? (
          <Animated.View style={styles.loadingContainer}>
            <Animated.View style={styles.loadingDot} />
            <Animated.View style={[styles.loadingDot, { marginLeft: 4 }]} />
            <Animated.View style={[styles.loadingDot, { marginLeft: 4 }]} />
          </Animated.View>
        ) : (
          <>
            {icon && (
              <MaterialIcons 
                name={icon} 
                size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
                color={getTextStyle().color}
                style={{ marginRight: title ? 8 : 0 }}
              />
            )}
            {title && (
              <Text style={[styles.text, styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}`], getTextStyle()]}>
                {title}
              </Text>
            )}
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  
  // Sizes
  small: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 36,
  },
  
  medium: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 48,
  },
  
  large: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    minHeight: 56,
  },
  
  // Variants
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  
  buttonSecondary: {
    backgroundColor: theme.colors.secondary,
  },
  
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  
  buttonDisabled: {
    backgroundColor: theme.colors.surfaceLight,
    opacity: 0.5,
  },
  
  // Text styles
  text: {
    fontWeight: theme.typography.fontWeight.bold,
  },
  
  textSmall: {
    fontSize: theme.typography.fontSize.sm,
  },
  
  textMedium: {
    fontSize: theme.typography.fontSize.base,
  },
  
  textLarge: {
    fontSize: theme.typography.fontSize.lg,
  },
  
  textPrimary: {
    color: theme.colors.textInverse,
  },
  
  textSecondary: {
    color: theme.colors.text,
  },
  
  textOutline: {
    color: theme.colors.primary,
  },
  
  textGhost: {
    color: theme.colors.primary,
  },
  
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.textInverse,
  },
});

export default GlowButton;