import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Alert, Dimensions, ScrollView } from 'react-native';
import { COLORS, FONTS, SHADOWS, SPACING } from '../config/theme';
import { BouncyPressable } from '../components/BouncyPressable';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useAppDb } from '../context/AppDbContext';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onBack }) => {
  const { updateUserSettings } = useAppDb();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }

    // Local authentication simulation
    // We update settings with the default profile info
    updateUserSettings({
      currentUser: {
        name: 'Sunshine',
        email: email.trim(),
      },
    });

    onLoginSuccess();
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      {/* Background Decorative Circles */}
      <View style={[styles.bubble, { backgroundColor: COLORS.primaryContainer, width: 200, height: 200, top: -50, left: -50 }]} />
      <View style={[styles.bubble, { backgroundColor: COLORS.secondaryContainer, width: 220, height: 220, bottom: -50, right: -50 }]} />
      <View style={[styles.bubble, { backgroundColor: COLORS.tertiaryContainer, width: 150, height: 150, top: '20%', right: -40 }]} />

      <View style={styles.loginCard}>
        {/* Back Button */}
        <BouncyPressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </BouncyPressable>

        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="heart" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Chào quay trở lại!</Text>
          <Text style={styles.subtitle}>Hãy đăng nhập để tiếp tục hành trình cùng Sunnie nhé.</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          {/* Email */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Email</Text>
            <View
              style={[
                styles.inputWrapper,
                emailFocused && styles.inputWrapperFocused,
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={emailFocused ? COLORS.primary : COLORS.outline}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                placeholderTextColor={COLORS.outline + '80'}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldContainer}>
            <View style={styles.passwordHeader}>
              <Text style={styles.fieldLabel}>Mật khẩu</Text>
              <BouncyPressable onPress={() => {}}>
                <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
              </BouncyPressable>
            </View>
            <View
              style={[
                styles.inputWrapper,
                passwordFocused && styles.inputWrapperFocused,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={passwordFocused ? COLORS.primary : COLORS.outline}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={COLORS.outline + '80'}
                secureTextEntry={!isPasswordVisible}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <BouncyPressable
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                style={styles.visibilityToggle}
              >
                <Ionicons
                  name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={COLORS.outline}
                />
              </BouncyPressable>
            </View>
          </View>

          {/* Submit Button */}
          <BouncyPressable onPress={handleLogin} style={styles.loginButton}>
            <View style={styles.loginButtonContent}>
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.onPrimaryContainer} />
            </View>
          </BouncyPressable>
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Hoặc đăng nhập bằng</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Buttons */}
        <View style={styles.socialGrid}>
          <BouncyPressable style={[styles.socialButton, styles.googleButton]}>
            <View style={styles.socialButtonContent}>
              <FontAwesome name="google" size={18} color="#EA4335" />
              <Text style={styles.socialButtonText}>Google</Text>
            </View>
          </BouncyPressable>

          <BouncyPressable style={[styles.socialButton, styles.fbButton]}>
            <View style={styles.socialButtonContent}>
              <FontAwesome name="facebook" size={18} color="#1877F2" />
              <Text style={styles.socialButtonText}>Facebook</Text>
            </View>
          </BouncyPressable>
        </View>

        {/* Footer Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Bạn chưa có tài khoản?</Text>
          <BouncyPressable onPress={() => {}}>
            <Text style={styles.registerLink}>Đăng ký tài khoản mới</Text>
          </BouncyPressable>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.lg,
  },
  bubble: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.15,
  },
  loginCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: SPACING.sm,
    padding: SPACING.md,
    ...SHADOWS.tonalPrimary,
    position: 'relative',
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  backButton: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    padding: 8,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceContainerLow,
    zIndex: 100,
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    ...FONTS.headlineLarge,
    fontSize: 24,
    textAlign: 'center',
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  subtitle: {
    ...FONTS.bodyMedium,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },
  form: {
    width: '100%',
    gap: SPACING.md,
  },
  fieldContainer: {
    width: '100%',
    gap: 4,
  },
  fieldLabel: {
    ...FONTS.labelLarge,
    color: COLORS.onSurfaceVariant,
    marginLeft: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F5',
    borderRadius: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    height: 56,
  },
  inputWrapperFocused: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 2,
    borderColor: COLORS.primaryContainer,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    ...FONTS.bodyMedium,
    color: COLORS.onSurface,
    height: '100%',
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotPasswordText: {
    ...FONTS.labelMedium,
    color: COLORS.primary,
  },
  visibilityToggle: {
    padding: 8,
  },
  loginButton: {
    width: '100%',
    borderRadius: 9999,
    overflow: 'hidden',
    marginTop: SPACING.sm,
  },
  loginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryContainer,
    paddingVertical: 14,
    borderRadius: 9999,
    ...SHADOWS.soft,
  },
  loginButtonText: {
    ...FONTS.labelLarge,
    color: COLORS.onPrimaryContainer,
    marginRight: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.surfaceContainerHighest,
  },
  dividerText: {
    ...FONTS.labelMedium,
    color: COLORS.outline,
    paddingHorizontal: SPACING.sm,
  },
  socialGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  socialButton: {
    flex: 1,
    borderRadius: 9999,
    borderWidth: 2,
    paddingVertical: 12,
  },
  googleButton: {
    borderColor: COLORS.primaryContainer + '60',
  },
  fbButton: {
    borderColor: COLORS.tertiaryContainer + '60',
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  socialButtonText: {
    ...FONTS.labelLarge,
    color: COLORS.onSurfaceVariant,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: SPACING.md,
  },
  footerText: {
    ...FONTS.bodySmall,
    color: COLORS.onSurfaceVariant,
  },
  registerLink: {
    ...FONTS.labelLarge,
    color: COLORS.primary,
    marginLeft: 4,
  },
});
