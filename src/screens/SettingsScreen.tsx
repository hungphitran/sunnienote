import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, Switch, Alert, TextInput, Platform } from 'react-native';
import { COLORS, FONTS, SHADOWS, SPACING } from '../config/theme';
import { BouncyPressable } from '../components/BouncyPressable';
import { Ionicons } from '@expo/vector-icons';
import { useAppDb } from '../context/AppDbContext';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

interface SettingsScreenProps {
  onLogout?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  const {
    db,
    updateUserSettings,
    getDbSize,
    pruneOldData,
    exportDatabase,
    importDatabase,
    factoryReset,
  } = useAppDb();

  const [themeMode, setThemeMode] = useState<boolean>(db.settings.theme === 'dark');

  const handleThemeChange = (value: boolean) => {
    setThemeMode(value);
    updateUserSettings({ theme: value ? 'dark' : 'light' });
  };

  const handlePruning = () => {
    pruneOldData();
    Alert.alert('Thành công', 'Đã tự động dọn dẹp các công việc hoàn thành và nhật ký cũ hơn 30 ngày để tối ưu hóa bộ nhớ! 🧹');
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const fileUri = result.assets[0].uri;
      let fileContent = '';

      if (Platform.OS === 'web') {
        const response = await fetch(fileUri);
        fileContent = await response.text();
      } else {
        fileContent = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      }

      const success = await importDatabase(fileContent);
      if (success) {
        Alert.alert('Thành công', 'Khôi phục dữ liệu từ tệp sao lưu thành công! ✨');
      } else {
        Alert.alert('Lỗi', 'Tệp sao lưu không hợp lệ hoặc sai định dạng cấu trúc Sunnie JSON.');
      }
    } catch (e) {
      console.error('Import failed', e);
      Alert.alert('Lỗi', 'Không thể đọc tệp sao lưu.');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Khôi phục cài đặt gốc',
      'Hành động này sẽ xóa vĩnh viễn toàn bộ dữ liệu ghi chú, công việc và lịch họp hiện tại của bạn. Bạn có muốn tiếp tục?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Khôi phục',
          style: 'destructive',
          onPress: async () => {
            await factoryReset();
            Alert.alert('Đã khôi phục', 'Ứng dụng đã trở về trạng thái ban đầu.');
          },
        },
      ]
    );
  };



  // Convert bytes size to user-friendly string
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.headerTitle}>Sunnie</Text>
        </View>
        <BouncyPressable style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
        </BouncyPressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card - Username settings only, no avatar or badge */}
        <View style={styles.profileSection}>
          <Text style={styles.inputLabel}>Tên người dùng của bạn</Text>
          <TextInput
            style={styles.usernameInput}
            value={db.settings.currentUser?.name || 'Sunshine'}
            onChangeText={(newName) => {
              updateUserSettings({
                currentUser: {
                  name: newName,
                  email: db.settings.currentUser?.email || 'sunshine.hello@example.com',
                }
              });
            }}
            placeholder="Nhập tên của bạn..."
            placeholderTextColor={COLORS.outline}
          />
          <Text style={styles.userEmail}>{db.settings.currentUser?.email || 'sunshine.hello@example.com'}</Text>
        </View>

        {/* Settings Groups */}
        <View style={styles.settingsGroups}>
          {/* Notifications Group */}
          <View style={styles.groupCard}>
            <Text style={styles.groupTitle}>Thông báo nhắc nhở</Text>
            
            {/* Water Toggle */}
            <View style={styles.rowItem}>
              <View style={styles.rowLabelGroup}>
                <Ionicons name="water-outline" size={20} color={COLORS.tertiary} style={styles.rowIcon} />
                <Text style={styles.rowText}>Uống nước hàng ngày</Text>
              </View>
              <Switch
                value={db.settings.waterReminder}
                onValueChange={(val) => updateUserSettings({ waterReminder: val })}
                trackColor={{ false: COLORS.outlineVariant, true: COLORS.secondaryContainer }}
                thumbColor={db.settings.waterReminder ? COLORS.secondary : COLORS.surfaceDim}
              />
            </View>

            {/* Meeting Toggle */}
            <View style={styles.rowItem}>
              <View style={styles.rowLabelGroup}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.tertiary} style={styles.rowIcon} />
                <Text style={styles.rowText}>Lịch họp & Sự kiện</Text>
              </View>
              <Switch
                value={db.settings.meetingsReminder}
                onValueChange={(val) => updateUserSettings({ meetingsReminder: val })}
                trackColor={{ false: COLORS.outlineVariant, true: COLORS.secondaryContainer }}
                thumbColor={db.settings.meetingsReminder ? COLORS.secondary : COLORS.surfaceDim}
              />
            </View>
          </View>

          {/* Account Settings */}
          <View style={styles.groupCard}>
            <Text style={styles.groupTitle}>Tài khoản & Cá nhân</Text>

            <BouncyPressable style={styles.rowItemBtn}>
              <View style={styles.rowLabelGroup}>
                <Ionicons name="color-palette-outline" size={20} color={COLORS.primary} style={styles.rowIcon} />
                <Text style={styles.rowText}>Giao diện & Màu sắc</Text>
              </View>
              <View style={styles.rowRightSide}>
                <Text style={styles.rowDetailText}>{db.settings.theme === 'dark' ? 'Tối' : 'Sáng'}</Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.outline} />
              </View>
            </BouncyPressable>

            <BouncyPressable style={styles.rowItemBtn}>
              <View style={styles.rowLabelGroup}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} style={styles.rowIcon} />
                <Text style={styles.rowText}>Đổi mật khẩu</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.outline} />
            </BouncyPressable>

            <BouncyPressable style={styles.rowItemBtn}>
              <View style={styles.rowLabelGroup}>
                <Ionicons name="help-circle-outline" size={20} color={COLORS.primary} style={styles.rowIcon} />
                <Text style={styles.rowText}>Trợ giúp</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.outline} />
            </BouncyPressable>
          </View>

          {/* Memory Management Settings */}
          <View style={styles.groupCard}>
            <Text style={styles.groupTitle}>Quản lý bộ nhớ (Local-First)</Text>

            <View style={styles.rowItem}>
              <View style={styles.rowLabelGroup}>
                <Ionicons name="server-outline" size={20} color={COLORS.secondary} style={styles.rowIcon} />
                <Text style={styles.rowText}>Dung lượng đã tiêu thụ</Text>
              </View>
              <Text style={styles.memorySizeText}>{formatSize(getDbSize())}</Text>
            </View>

            <BouncyPressable onPress={handlePruning} style={styles.rowItemBtn}>
              <View style={styles.rowLabelGroup}>
                <Ionicons name="brush-outline" size={20} color={COLORS.secondary} style={styles.rowIcon} />
                <Text style={styles.rowText}>Tự động dọn dẹp nhật ký</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.outline} />
            </BouncyPressable>

            <BouncyPressable onPress={exportDatabase} style={styles.rowItemBtn}>
              <View style={styles.rowLabelGroup}>
                <Ionicons name="download-outline" size={20} color={COLORS.secondary} style={styles.rowIcon} />
                <Text style={styles.rowText}>Xuất tệp tin cục bộ (Backup JSON)</Text>
              </View>
              <Ionicons name="share-social-outline" size={18} color={COLORS.outline} />
            </BouncyPressable>

            <BouncyPressable onPress={handleImport} style={styles.rowItemBtn}>
              <View style={styles.rowLabelGroup}>
                <Ionicons name="cloud-upload-outline" size={20} color={COLORS.secondary} style={styles.rowIcon} />
                <Text style={styles.rowText}>Khôi phục dữ liệu (Import JSON)</Text>
              </View>
              <Ionicons name="document-attach-outline" size={18} color={COLORS.outline} />
            </BouncyPressable>

            <BouncyPressable onPress={handleReset} style={styles.rowItemBtn}>
              <View style={styles.rowLabelGroup}>
                <Ionicons name="refresh-circle-outline" size={20} color={COLORS.error} style={styles.rowIcon} />
                <Text style={[styles.rowText, { color: COLORS.error }]}>Khôi phục cài đặt gốc</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.outline} />
            </BouncyPressable>
          </View>


        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: 60,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainer,
  },
  headerTitle: {
    ...FONTS.headlineLarge,
    color: COLORS.primary,
    fontSize: 24,
  },
  userInfo: {
    flex: 1,
  },
  notificationButton: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.md,
    paddingBottom: 120,
    gap: SPACING.lg,
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  avatarContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarBorder: {
    width: 120,
    height: 120,
    borderRadius: SPACING.sm,
    ...SHADOWS.ambient,
    borderWidth: 4,
    borderColor: '#ffffff',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  memberBadge: {
    position: 'absolute',
    bottom: -10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    ...SHADOWS.soft,
    gap: 4,
  },
  memberText: {
    fontSize: 10,
    fontFamily: 'Quicksand-Bold',
    color: COLORS.onSecondaryContainer,
  },
  username: {
    ...FONTS.headlineMedium,
    color: COLORS.onSurface,
  },
  userEmail: {
    ...FONTS.bodySmall,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  settingsGroups: {
    gap: SPACING.md,
  },
  groupCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: SPACING.sm,
    padding: SPACING.md,
    ...SHADOWS.ambient,
  },
  groupTitle: {
    ...FONTS.labelLarge,
    color: COLORS.primary,
    marginBottom: SPACING.md,
    paddingHorizontal: 4,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  rowItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  rowLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    marginRight: SPACING.sm,
    width: 24,
    textAlign: 'center',
  },
  rowText: {
    ...FONTS.bodyMedium,
    color: COLORS.onSurface,
    fontWeight: '500',
  },
  rowRightSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowDetailText: {
    ...FONTS.bodySmall,
    color: COLORS.outline,
  },
  memorySizeText: {
    ...FONTS.labelLarge,
    color: COLORS.secondary,
  },
  usernameInput: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: SPACING.xs,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'Quicksand-Bold',
    color: COLORS.onSurface,
    width: '100%',
    textAlign: 'center',
    marginTop: 8,
    ...SHADOWS.soft,
  },
  inputLabel: {
    ...FONTS.labelMedium,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
