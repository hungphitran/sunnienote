import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, Animated, Dimensions } from 'react-native';
import { COLORS, FONTS, SHADOWS, SPACING } from '../config/theme';
import { BouncyPressable } from '../components/BouncyPressable';
import { MaterialIcons } from '@expo/vector-icons';

interface WelcomeScreenProps {
  onStart: () => void;
  onLogin: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onLogin }) => {
  // Animations for elements bouncing/fading in
  const bounceAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Floating animations for sun card and badges
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.spring(bounceAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 40,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating loop animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -15,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [bounceAnim, opacityAnim, floatAnim]);

  return (
    <View style={styles.container}>
      {/* Background Decorative Blur Blobs */}
      <View style={[styles.blob, styles.blobGreen, { top: -50, left: -50 }]} />
      <View style={[styles.blob, styles.blobPink, { top: '40%', right: -100 }]} />
      <View style={[styles.blob, styles.blobPurple, { bottom: -100, left: '20%' }]} />

      {/* Header Branding */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sunnie</Text>
      </View>

      {/* Illustration Area */}
      <Animated.View
        style={[
          styles.illustrationContainer,
          {
            opacity: opacityAnim,
            transform: [{ scale: bounceAnim }, { translateY: floatAnim }],
          },
        ]}
      >
        <View style={styles.characterCard}>
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzjAA1D6u_W4s6yOnz7Nv5kBaQOsdfRB7kJD6NeFe5flkOiWsrGNOO9jDbbJhLX0H8__tnPDB5i5Q0qhULMEiMQT79HiPqvS5egD6aJbZiCSn3AfRU4HI3fShBw_XZhE1_R22EgznE4A5fnrhIJtk7v34Dxv-p1PNa7oqZMsVQbOgQgQXEYrv9CZbUlhbjue8JsEB7ZkpW8eu1Srd1QzzggQRdKEGqPpua0UjZLLpyzm0k-wNaXx-S2w',
            }}
            style={styles.characterImage}
            resizeMode="contain"
          />
        </View>

        {/* Floating Check Badge */}
        <View style={[styles.floatingBadge, styles.badgeCheck, { top: 10, right: 10 }]}>
          <MaterialIcons name="check-circle" size={24} color={COLORS.secondary} />
        </View>

        {/* Floating Heart Badge */}
        <View style={[styles.floatingBadge, styles.badgeHeart, { bottom: 20, left: 10 }]}>
          <MaterialIcons name="favorite" size={20} color={COLORS.primary} />
        </View>
      </Animated.View>

      {/* Text Content */}
      <Animated.View style={[styles.textBlock, { opacity: opacityAnim }]}>
        <Text style={styles.title}>
          Chào mừng bạn đến với <Text style={styles.highlightText}>Sunnie!</Text>
        </Text>
        <Text style={styles.subtitle}>
          Nơi ghi lại từng khoảnh khắc ngọt ngào và quản lý ngày mới thật hiệu quả.
        </Text>
      </Animated.View>

      {/* Call to Action */}
      <Animated.View style={[styles.ctaBlock, { opacity: opacityAnim }]}>
        <BouncyPressable onPress={onStart} style={styles.startButton}>
          <View style={styles.startButtonContent}>
            <Text style={styles.startButtonText}>Bắt đầu ngay</Text>
            <MaterialIcons name="arrow-forward" size={18} color={COLORS.onPrimaryContainer} />
          </View>
        </BouncyPressable>

        <BouncyPressable onPress={onLogin} style={styles.loginLinkButton}>
          <Text style={styles.loginLinkText}>Tôi đã có tài khoản</Text>
        </BouncyPressable>
      </Animated.View>

      {/* Page Indicators */}
      <View style={styles.indicatorContainer}>
        <View style={[styles.indicatorDot, styles.activeIndicator]} />
        <View style={styles.indicatorDot} />
        <View style={styles.indicatorDot} />
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.marginMobile,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 9999,
    opacity: 0.15,
  },
  blobGreen: {
    backgroundColor: COLORS.secondaryContainer,
  },
  blobPink: {
    backgroundColor: COLORS.primaryContainer,
  },
  blobPurple: {
    backgroundColor: COLORS.tertiaryContainer,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  headerTitle: {
    ...FONTS.headlineLarge,
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  illustrationContainer: {
    width: width * 0.75,
    aspectRatio: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    zIndex: 10,
  },
  characterCard: {
    width: '85%',
    aspectRatio: 1,
    backgroundColor: '#ffffff',
    borderRadius: SPACING.sm,
    ...SHADOWS.ambient,
    borderBottomWidth: 6,
    borderBottomColor: COLORS.secondaryContainer,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterImage: {
    width: '100%',
    height: '100%',
    margin: 15,
  },
  floatingBadge: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
  },
  badgeCheck: {
    backgroundColor: COLORS.secondaryContainer,
  },
  badgeHeart: {
    backgroundColor: COLORS.primaryContainer,
  },
  textBlock: {
    alignItems: 'center',
    width: '100%',
    marginBottom: SPACING.lg,
    paddingHorizontal: 10,
  },
  title: {
    ...FONTS.headlineLarge,
    fontSize: 26,
    textAlign: 'center',
    color: COLORS.onSurface,
    lineHeight: 34,
  },
  highlightText: {
    color: COLORS.primary,
  },
  subtitle: {
    ...FONTS.bodyLarge,
    textAlign: 'center',
    color: COLORS.onSurfaceVariant,
    marginTop: SPACING.sm,
    opacity: 0.9,
    lineHeight: 24,
  },
  ctaBlock: {
    width: '100%',
    alignItems: 'center',
    maxWidth: 300,
  },
  startButton: {
    width: '100%',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  startButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryContainer,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 9999,
    ...SHADOWS.soft,
  },
  startButtonText: {
    ...FONTS.labelLarge,
    color: COLORS.onPrimaryContainer,
    marginRight: 8,
  },
  loginLinkButton: {
    marginTop: SPACING.sm,
    paddingVertical: 8,
  },
  loginLinkText: {
    ...FONTS.labelMedium,
    color: COLORS.onSurfaceVariant,
    textDecorationLine: 'underline',
  },
  indicatorContainer: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    gap: 8,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.outlineVariant,
  },
  activeIndicator: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
});
