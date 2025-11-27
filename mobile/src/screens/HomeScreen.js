/**
 * BANIBS Mobile - Home Screen
 * Phase M1 - Mobile Shell
 */

import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import Container from '../components/Container';
import {useAuth} from '../contexts/AuthContext';
import {theme} from '../theme';

const HomeScreen = ({navigation}) => {
  const {user} = useAuth();

  const quickLinks = [
    {title: 'Social Feed', icon: '📱', screen: 'Social'},
    {title: 'Messages', icon: '💬', screen: 'Messaging'},
    {title: 'Marketplace', icon: '🛒', screen: 'Home'},
    {title: 'Business', icon: '🏢', screen: 'Home'},
  ];

  return (
    <Container>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>
            {user?.first_name || 'User'}!
          </Text>
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickLinksGrid}>
            {quickLinks.map((link, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickLinkCard}
                onPress={() => navigation.navigate(link.screen)}>
                <Text style={styles.quickLinkIcon}>{link.icon}</Text>
                <Text style={styles.quickLinkTitle}>{link.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Platform Info */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>BANIBS Platform</Text>
            <Text style={styles.infoDescription}>
              Your gateway to the Black Global Diaspora ecosystem. Connect,
              engage, and thrive with your community.
            </Text>
            <View style={styles.infoStats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>Phase M1</Text>
                <Text style={styles.statLabel}>Mobile Shell</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>v1.0.0</Text>
                <Text style={styles.statLabel}>Version</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  greeting: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
  },
  userName: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  quickLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
  },
  quickLinkCard: {
    width: '48%',
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    margin: theme.spacing.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  quickLinkIcon: {
    fontSize: 40,
    marginBottom: theme.spacing.sm,
  },
  quickLinkTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.gold,
  },
  infoTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary.gold,
    marginBottom: theme.spacing.sm,
  },
  infoDescription: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.relaxed,
    marginBottom: theme.spacing.lg,
  },
  infoStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
});

export default HomeScreen;
