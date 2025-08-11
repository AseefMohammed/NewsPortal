import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from './DashboardScreen';
import SavesScreen from './SavesScreen';
import ProfileScreen from './ProfileScreen';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

export default function MainTabs({ route }) {
  const { theme } = useTheme();
  const userData = route?.params?.userData;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surfaceUltraLight,
          borderTopColor: 'transparent',
          borderTopWidth: 0,
          shadowColor: theme.colors.surfaceLight,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 8,
          height: 68,
          paddingBottom: 14,
          paddingTop: 8,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = 'dashboard';
          else if (route.name === 'Saves') iconName = 'bookmark';
          else if (route.name === 'Profile') iconName = 'person';
          return <MaterialIcons name={iconName} size={size + 4} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        initialParams={{ userData }}
      />
      <Tab.Screen 
        name="Saves" 
        component={SavesScreen} 
        initialParams={{ userData }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        initialParams={{ userData }}
      />
    </Tab.Navigator>
  );
} 