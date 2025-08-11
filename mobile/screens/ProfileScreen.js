import React from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

const user = {
  name: 'Aseef Mohammed',
  email: 'aseef@example.com',
};

const profileOptions = [
  { icon: 'person', label: 'Account' },
  { icon: 'lock', label: 'Privacy' },
  { icon: 'notifications', label: 'Notifications' },
  { icon: 'help', label: 'Help & Support' },
];

const ProfileScreen = () => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }}>
      <View style={{
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        backgroundColor: theme.colors.background, // Flat, merged look
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
          <MaterialIcons name="person" size={48} color={theme.colors.primary} style={{ marginRight: theme.spacing.md }} />
          <View>
            <Text style={{ fontFamily: 'Roboto-Bold', fontSize: 20, color: theme.colors.text, marginBottom: theme.spacing.sm }}>{user.name}</Text>
            <Text style={{ fontFamily: 'Roboto-Medium', fontSize: 16, color: theme.colors.textSecondary }}>{user.email}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontFamily: 'Roboto-Regular', fontSize: 16, color: theme.colors.text }}>Dark Mode</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            thumbColor={isDark ? theme.colors.primary : theme.colors.surfaceLight}
            trackColor={{ true: theme.colors.primaryGlow, false: theme.colors.surfaceLight }}
          />
        </View>
      </View>
      <View style={{ marginBottom: theme.spacing.xl }}>
        {profileOptions.map((opt) => (
          <TouchableOpacity
            key={opt.label}
            style={{
              borderRadius: theme.borderRadius.lg,
              backgroundColor: theme.colors.background, // Flat, merged look
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: theme.spacing.sm,
              padding: theme.spacing.lg,
            }}
          >
            <MaterialIcons name={opt.icon} size={24} color={theme.colors.primary} style={{ marginRight: theme.spacing.md }} />
            <Text style={{ fontFamily: 'Roboto-Regular', fontSize: 16, color: theme.colors.text }}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default ProfileScreen; 