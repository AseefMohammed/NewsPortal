import React, { useEffect, useRef } from 'react';
import { theme } from '../../styles/theme';
import { useTheme } from '../../context/ThemeContext';

const AnimatedCard = ({ 
  children, 
  delay = 0, 
  duration = 600,
  onPress,
  style,
  glowEffect = false,
  hoverEffect = true,
  ...props 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: duration,
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: duration,
        delay: delay,
        useNativeDriver: true,
      }),
    ]).start();

    // Glow effect animation
    if (glowEffect) {
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
  }, [delay, duration, glowEffect]);

  const handlePressIn = () => {
    if (hoverEffect) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (hoverEffect) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.3],
  });

  const cardStyle = [
    styles.card,
    {
      opacity: fadeAnim,
      transform: [
        { translateY: slideAnim },
        { scale: scaleAnim },
      ],
    },
    glowEffect && {
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: glowOpacity,
      shadowRadius: 20,
      elevation: 10,
    },
    style,
  ];

  if (onPress) {
    return (
      <button
        style={{ all: 'unset', cursor: 'pointer' }}
        onClick={onPress}
        onMouseDown={handlePressIn}
        onMouseUp={handlePressOut}
        {...props}
      >
        <div style={cardStyle}>
          {children}
        </div>
      </button>
    );
  }

  return (
    <div style={cardStyle} {...props}>
      {children}
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
    transition: 'transform 0.6s, opacity 0.6s',
  },
};

export default AnimatedCard;