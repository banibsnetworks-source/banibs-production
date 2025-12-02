/**
 * BANIBS Mobile - Bottom Tab Navigation
 * Phase M2 - Social Feed Navigation
 */

import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {Text, View} from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import SocialFeedScreen from '../screens/SocialFeedScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import CommentsScreen from '../screens/CommentsScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import MessagingScreen from '../screens/MessagingScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';
// Phase M5.3 - Groups Module
import GroupsListScreen from '../screens/GroupsListScreen';
import GroupDetailScreen from '../screens/GroupDetailScreen';
import NotificationBadge from '../components/NotificationBadge';
import {useNotifications} from '../contexts/NotificationContext';
import {theme} from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabIcon = ({icon, focused}) => (
  <Text style={{fontSize: 24, opacity: focused ? 1 : 0.6}}>{icon}</Text>
);

// Social Stack Navigator (includes feed, create post, comments, profiles, groups)
const SocialStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="SocialFeed" component={SocialFeedScreen} />
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen name="Comments" component={CommentsScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      {/* Phase M5.3 - Groups Module */}
      <Stack.Screen name="GroupsList" component={GroupsListScreen} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
    </Stack.Navigator>
  );
};

// Notifications Stack Navigator (includes notifications list and group detail for deep linking)
const NotificationsStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="NotificationsList" component={NotificationsScreen} />
      {/* Phase M5.4 - Deep linking to groups from notifications */}
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
    </Stack.Navigator>
  );
};

const TabIconWithBadge = ({icon, focused, badge}) => (
  <View>
    <Text style={{fontSize: 24, opacity: focused ? 1 : 0.6}}>{icon}</Text>
    {badge > 0 && (
      <NotificationBadge 
        count={badge} 
        size="small" 
        style={{position: 'absolute', top: -4, right: -8}} 
      />
    )}
  </View>
);

const MainTabNavigator = () => {
  const {unreadCount} = useNotifications();
  
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
        component={SocialStack}
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
        name="Notifications"
        component={NotificationsStack}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIconWithBadge icon="🔔" focused={focused} badge={unreadCount} />
          ),
          tabBarLabel: 'Alerts',
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
