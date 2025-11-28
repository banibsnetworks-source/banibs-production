/**
 * BANIBS Mobile App
 * Phase M1 - Mobile Shell Foundation
 * 
 * Lightweight React Native app with:
 * - Authentication (Login/Register)
 * - Home Screen
 * - Bottom Tab Navigation
 * - Social Container
 * - Messaging Container
 * - Settings Container
 * - BANIBS UI v2.0 Theming
 */

import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AuthProvider} from './contexts/AuthContext';
import {NotificationProvider} from './contexts/NotificationContext';
import RootNavigator from './navigation/RootNavigator';
import {theme} from './theme';

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background.primary}
      />
      <AuthProvider>
        <NotificationProvider>
          <RootNavigator />
        </NotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
