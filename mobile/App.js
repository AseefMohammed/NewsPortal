import React from 'react';
import { SavedArticlesProvider } from './context/SavedArticlesContext';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider } from './context/ThemeContext';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import SavesScreen from './screens/SavesScreen';
import ProfileScreen from './screens/ProfileScreen';
import MainTabs from './screens/MainTabs';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <SavedArticlesProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Saves" component={SavesScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
            <Stack.Screen name="NewsDetail" component={require('./screens/NewsDetailScreen').default} options={{ title: 'Article' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </SavedArticlesProvider>
    </ThemeProvider>
  );
}