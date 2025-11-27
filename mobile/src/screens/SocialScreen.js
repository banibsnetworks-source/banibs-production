/**
 * BANIBS Mobile - Social Screen
 * Phase M1 - Mobile Shell
 */

import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import Container from '../components/Container';
import {theme} from '../theme';

const SocialScreen = () => {
  return (
    <Container>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Social Feed</Text>
          <Text style={styles.subtitle}>Coming Soon</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardIcon}>📱</Text>
            <Text style={styles.cardTitle}>Social Container</Text>
            <Text style={styles.cardDescription}>
              Your social feed will appear here. Connect with your community,
              share updates, and stay engaged with the BANIBS ecosystem.
            </Text>
          </View>

          <View style={styles.featuresList}>
            <Text style={styles.featuresTitle}>Coming Features:</Text>
            <Text style={styles.featureItem}>• Personal feed</Text>
            <Text style={styles.featureItem}>• Create posts</Text>
            <Text style={styles.featureItem}>• Follow users</Text>
            <Text style={styles.featureItem}>• Like and comment</Text>
            <Text style={styles.featureItem}>• Share content</Text>
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
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  content: {
    padding: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.gold,
    marginBottom: theme.spacing.lg,
  },
  cardIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary.gold,
    marginBottom: theme.spacing.sm,
  },
  cardDescription: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.relaxed,
  },
  featuresList: {
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  featuresTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  featureItem: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.normal,
  },
});

export default SocialScreen;
