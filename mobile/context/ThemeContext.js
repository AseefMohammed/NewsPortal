import React, { createContext, useContext, useState, useEffect } from 'react';
import { theme } from '../styles/theme';
import { themeLight } from '../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('themeMode');
      if (stored === 'light') {
        setIsDark(false);
        setCurrentTheme(themeLight);
      }
      setLoading(false);
    })();
  }, []);

  const toggleTheme = async () => {
    if (isDark) {
      setIsDark(false);
      setCurrentTheme(themeLight);
      await AsyncStorage.setItem('themeMode', 'light');
    } else {
      setIsDark(true);
      setCurrentTheme(theme);
      await AsyncStorage.setItem('themeMode', 'dark');
    }
  };

  if (loading) return null; // Or a loading spinner if you prefer

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 