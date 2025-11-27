/**
 * BANIBS Mobile - Container Component
 * Phase M1 - Mobile Shell
 */

import React from 'react';
import {SafeAreaView, ScrollView, View, StyleSheet} from 'react-native';
import {theme} from '../theme';

const Container = ({
  children,
  scrollable = false,
  safe = true,
  style,
  contentContainerStyle,
}) => {
  const Wrapper = safe ? SafeAreaView : View;
  const Content = scrollable ? ScrollView : View;

  return (
    <Wrapper style={[styles.container, style]}>
      <Content
        style={styles.content}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}>
        {children}
      </Content>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    flex: 1,
  },
});

export default Container;
