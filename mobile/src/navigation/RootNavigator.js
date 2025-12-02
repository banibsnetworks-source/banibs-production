/**
 * BANIBS Mobile - Root Navigation
 * Phase M5.4 - Deep Linking Config Added
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {useAuth} from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import {theme} from '../theme';

// Phase M5.4 - Deep Linking Configuration
const linking = {
  prefixes: ['banibs://', 'https://banibs.com'],
  config: {
    screens: {
      // Auth screens
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
        },
      },
      // Main app screens
      MainTabs: {
        screens: {
          Home: 'home',
          Social: {
            screens: {
              GroupsList: 'groups',
              GroupDetail: 'groups/:groupId',
              SocialFeed: 'feed',
            },
          },
          Messaging: 'messages',
          Notifications: {
            screens: {
              NotificationsList: 'notifications',
              GroupDetail: 'notifications/groups/:groupId',
            },
          },
          Settings: 'settings',
        },
      },
    },
  },
};

const RootNavigator = () => {
  const {isAuthenticated, loading} = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.gold} />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      {isAuthenticated ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RootNavigator;
