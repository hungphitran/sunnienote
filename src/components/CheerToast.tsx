import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Dimensions } from 'react-native';
import { COLORS, FONTS, SHADOWS, SPACING } from '../config/theme';

interface CheerToastProps {
  visible: boolean;
  message?: string;
  subtitle?: string;
  badge?: string;
  onHide: () => void;
  duration?: number;
}

export const CheerToast: React.FC<CheerToastProps> = ({
  visible,
  message = 'Bạn thật tuyệt vời! 🌟',
  subtitle = 'Another step toward your goals.',
  badge = '🌟',
  onHide,
  duration = 3000,
}) => {
  const slideAnim = useRef(new Animated.Value(100)).current; // Start offscreen (below)
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate entry: slide up and fade in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          friction: 6,
          tension: 40,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Set timeout to auto-hide
      const timer = setTimeout(() => {
        // Animate exit: slide down and fade out
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 100,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onHide();
        });
      }, duration);

      return () => clearTimeout(timer);
    } else {
      slideAnim.setValue(100);
      opacityAnim.setValue(0);
    }
  }, [visible, slideAnim, opacityAnim, duration, onHide]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.badgeContainer}>
          <Text style={styles.badge}>{badge}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{message}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100, // Float just above the bottom nav bar
    left: SPACING.marginMobile,
    right: SPACING.marginMobile,
    backgroundColor: COLORS.secondaryContainer,
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    ...SHADOWS.ambient,
    borderLeftWidth: 8,
    borderLeftColor: COLORS.secondary,
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeContainer: {
    marginRight: SPACING.sm,
  },
  badge: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...FONTS.headlineSmall,
    color: COLORS.onSecondaryContainer,
    fontSize: 16,
    lineHeight: 20,
  },
  subtitle: {
    ...FONTS.bodySmall,
    color: COLORS.onSecondaryFixedVariant,
    marginTop: 2,
  },
});
