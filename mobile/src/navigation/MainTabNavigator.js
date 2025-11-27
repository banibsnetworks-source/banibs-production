/**
 * BANIBS Mobile - Bottom Tab Navigation
 * Phase M1 - Mobile Shell
 */

import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text} from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import SocialScreen from '../screens/SocialScreen';
import MessagingScreen from '../screens/MessagingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import {theme} from '../theme';

const Tab = createBottomTabNavigator();

const TabIcon = ({icon, focused}) => (
  <Text style={{fontSize: 24, opacity: focused ? 1 : 0.6}}>{icon}</Text>
);

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background.secondary,
          borderTopColor: theme.colors.border.default,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarActiveTintColor: theme.colors.primary.gold,
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        tabBarLabelStyle: {
          fontSize: theme.typography.fontSize.xs,
          fontWeight: theme.typography.fontWeight.medium,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({focused}) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Social"
        component={SocialScreen}
        options={{
          tabBarIcon: ({focused}) => <TabIcon icon="📱" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Messaging"
        component={MessagingScreen}
        options={{
          tabBarIcon: ({focused}) => <TabIcon icon="💬" focused={focused} />,
          tabBarLabel: 'Messages',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({focused}) => <TabIcon icon="⚙️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
