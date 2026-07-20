import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, Switch, Alert, TextInput, Platform } from 'react-native';
import { COLORS, FONTS, SHADOWS, SPACING } from '../config/theme';
import { BouncyPressable } from '../components/BouncyPressable';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppDb } from '../context/AppDbContext';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Notifications from 'expo-notifications';

const VAPID_PUBLIC_KEY = process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY || 'BIrUiRolvPe5JpsBnlLnhz_tR7wk95zw_axWnsAm7ddVPJD9njR9Uj0sjVdXzKOlwWXN1ge2aj3rliYz6Z44-MQ';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

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
  const [notificationStatus, setNotificationStatus] = useState<string>('undetermined');

  const checkPermission = async () => {
    const isNotificationSupported = Platform.OS !== 'web' || (typeof window !== 'undefined' && 'Notification' in window);
    if (!isNotificationSupported) {
      setNotificationStatus('unsupported');
      return;
    }
    
    if (Platform.OS === 'web') {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
              setNotificationStatus('granted');
              return;
            }
          }
        } catch (err) {
          console.log('Error checking PWA notification subscription', err);
        }
      }
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setNotificationStatus(Notification.permission);
        return;
      }
    }
    
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationStatus(status);
    } catch (err) {
      console.log('Error checking notification permission', err);
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  const requestNotificationPermission = async () => {
    const isNotificationSupported = Platform.OS !== 'web' || (typeof window !== 'undefined' && 'Notification' in window);
    if (!isNotificationSupported) {
      Alert.alert('Không hỗ trợ', 'Thiết bị hoặc trình duyệt của bạn không hỗ trợ thông báo.');
      return;
    }

    if (Platform.OS === 'web') {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        Alert.alert('Không hỗ trợ', 'Trình duyệt của bạn không hỗ trợ Service Worker hoặc Push Notification.');
        return;
      }

      try {
        const permission = await Notification.requestPermission();
        setNotificationStatus(permission);

        if (permission !== 'granted') {
          Alert.alert(
            'Quyền bị từ chối',
            'Bạn cần cho phép hiển thị thông báo của trình duyệt để nhận nhắc nhở.'
          );
          return;
        }

        let registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
          registration = await navigator.serviceWorker.register('/sw.js');
        }

        await navigator.serviceWorker.ready;

        const subscribeOptions = {
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        };

        const subscription = await registration.pushManager.subscribe(subscribeOptions);
        console.log('PWA Subscribed:', subscription);

        const response = await fetch('/api/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscription),
        });

        if (response.ok) {
          Alert.alert('Thành công', 'Đã đăng ký nhận thông báo hệ thống thành công! 🔔');
          setNotificationStatus('granted');
          updateUserSettings({ pushToken: subscription.endpoint });
        } else {
          Alert.alert('Lưu ý', 'Đăng ký thành công trên trình duyệt nhưng không lưu được trên backend server.');
        }

      } catch (err) {
        console.error('PWA Notification registration failed:', err);
        Alert.alert('Lỗi', 'Không thể cấu hình Web Push Notification. Hãy thử tải lại trang hoặc chạy qua HTTPS.');
      }
      return;
    }

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setNotificationStatus(status);
      if (status === 'granted') {
        Alert.alert('Thành công', 'Đã bật quyền nhận thông báo từ Sunnie! 🔔');
        // Fetch and register Expo Push Token for Native device
        const projectId = '211455b2-e8f6-4c2f-9f59-aeade1898efe';
        const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
        const token = tokenData.data;
        if (token) {
          updateUserSettings({ pushToken: token });
          console.log('Successfully registered push token manually:', token);
        }
      } else {
        Alert.alert(
          'Quyền bị từ chối',
          'Bạn cần cấp quyền thông báo trong cài đặt thiết bị để nhận các nhắc nhở từ ứng dụng.'
        );
      }
    } catch (err) {
      console.log('Error requesting notification permission', err);
      Alert.alert('Lỗi', 'Không thể yêu cầu quyền thông báo.');
    }
  };

  const sendTestNotification = async () => {
    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Chào bạn! 🌸',
          body: 'Đây là thông báo thử nghiệm hoạt động tốt từ Sunnie Note.',
          url: '/'
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        Alert.alert('Thành công', `Đã kích hoạt thông báo thử nghiệm! Đã gửi đến ${data.sentCount} thiết bị đăng ký.`);
      } else {
        Alert.alert('Không hoạt động', 'Không tìm thấy thiết bị đăng ký hoặc lỗi từ server. Vui lòng bật thông báo trước.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Lỗi kết nối', 'Không thể kết nối đến API backend. Vui lòng kiểm tra server đang chạy.');
    }
  };

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
          <MaterialIcons name="notifications-none" size={24} color={COLORS.primary} />
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
                  email: db.settings.currentUser?.email || 'sunshine.hello',
                }
              });
            }}
            placeholder="Nhập tên của bạn..."
            placeholderTextColor={COLORS.outline}
          />
          <Text style={styles.userEmail}>{(db.settings.currentUser?.email || 'sunshine.hello').replace('@example.com', '')}</Text>
        </View>

        {/* Settings Groups */}
        <View style={styles.settingsGroups}>
          {/* Notifications Group */}
          <View style={styles.groupCard}>
            <Text style={styles.groupTitle}>Thông báo nhắc nhở</Text>
            
            {/* Water Toggle */}
            <View style={styles.rowItem}>
              <View style={styles.rowLabelGroup}>
                <MaterialIcons name="opacity" size={20} color={COLORS.tertiary} style={styles.rowIcon} />
                <Text style={styles.rowText}>Uống nước hàng ngày</Text>
              </View>
              <Switch
                value={db.settings.waterReminder}
                onValueChange={async (val) => {
                  updateUserSettings({ waterReminder: val });
                  if (val && notificationStatus !== 'granted') {
                    await requestNotificationPermission();
                  }
                }}
                trackColor={{ false: COLORS.outlineVariant, true: COLORS.secondaryContainer }}
                thumbColor={db.settings.waterReminder ? COLORS.secondary : COLORS.surfaceDim}
              />
            </View>

            {/* Meeting Toggle */}
            <View style={styles.rowItem}>
              <View style={styles.rowLabelGroup}>
                <MaterialIcons name="calendar-month" size={20} color={COLORS.tertiary} style={styles.rowIcon} />
                <Text style={styles.rowText}>Lịch họp & Sự kiện</Text>
              </View>
              <Switch
                value={db.settings.meetingsReminder}
                onValueChange={async (val) => {
                  updateUserSettings({ meetingsReminder: val });
                  if (val && notificationStatus !== 'granted') {
                    await requestNotificationPermission();
                  }
                }}
                trackColor={{ false: COLORS.outlineVariant, true: COLORS.secondaryContainer }}
                thumbColor={db.settings.meetingsReminder ? COLORS.secondary : COLORS.surfaceDim}
              />
            </View>

            {/* Request System Notification Permission */}
            <BouncyPressable onPress={requestNotificationPermission} style={styles.rowItemBtn}>
              <View style={styles.rowLabelGroup}>
                <MaterialIcons name="notifications-active" size={20} color={COLORS.tertiary} style={styles.rowIcon} />
                <Text style={styles.rowText}>Bật thông báo hệ thống</Text>
              </View>
              <View style={styles.rowRightSide}>
                <Text style={[
                  styles.rowDetailText,
                  notificationStatus === 'granted' && { color: COLORS.secondary, fontWeight: 'bold' }
                ]}>
                  {notificationStatus === 'granted' ? 'Đã bật' : notificationStatus === 'denied' ? 'Bị từ chối' : 'Chưa bật'}
                </Text>
                <MaterialIcons name="chevron-right" size={18} color={COLORS.outline} />
              </View>
            </BouncyPressable>

            {/* Send Test Notification (Web only) */}
            {Platform.OS === 'web' && (
              <BouncyPressable onPress={sendTestNotification} style={styles.rowItemBtn}>
                <View style={styles.rowLabelGroup}>
                  <MaterialIcons name="send" size={20} color={COLORS.tertiary} style={styles.rowIcon} />
                  <Text style={styles.rowText}>Gửi thông báo thử nghiệm (Test PWA)</Text>
                </View>
                <MaterialIcons name="chevron-right" size={18} color={COLORS.outline} />
              </BouncyPressable>
            )}
          </View>

          {/* Account Settings */}
          <View style={styles.groupCard}>
            <Text style={styles.groupTitle}>Tài khoản & Cá nhân</Text>

            <BouncyPressable style={styles.rowItemBtn}>
              <View style={styles.rowLabelGroup}>
                <MaterialIcons name="palette" size={20} color={COLORS.primary} style={styles.rowIcon} />
                <Text style={styles.rowText}>Giao diện & Màu sắc</Text>
              </View>
              <View style={styles.rowRightSide}>
                <Text style={styles.rowDetailText}>{db.settings.theme === 'dark' ? 'Tối' : 'Sáng'}</Text>
                <MaterialIcons name="chevron-right" size={18} color={COLORS.outline} />
              </View>
            </BouncyPressable>

            <BouncyPressable style={styles.rowItemBtn}>
              <View style={styles.rowLabelGroup}>
                <MaterialIcons name="lock-outline" size={20} color={COLORS.primary} style={styles.rowIcon} />
                <Text style={styles.rowText}>Đổi mật khẩu</Text>
              </View>
              <MaterialIcons name="chevron-right" size={18} color={COLORS.outline} />
            </BouncyPressable>

            <BouncyPressable style={styles.rowItemBtn}>
              <View style={styles.rowLabelGroup}>
                <MaterialIcons name="help-outline" size={20} color={COLORS.primary} style={styles.rowIcon} />
                <Text style={styles.rowText}>Trợ giúp</Text>
              </View>
              <MaterialIcons name="chevron-right" size={18} color={COLORS.outline} />
            </BouncyPressable>
          </View>

          {/* Memory Management Settings */}
          <View style={styles.groupCard}>
            <Text style={styles.groupTitle}>Quản lý bộ nhớ (Local-First)</Text>

            <View style={styles.rowItem}>
              <View style={styles.rowLabelGroup}>
                <MaterialIcons name="storage" size={20} color={COLORS.secondary} style={styles.rowIcon} />
                <Text style={styles.rowText}>Dung lượng đã tiêu thụ</Text>
              </View>
              <Text style={styles.memorySizeText}>{formatSize(getDbSize())}</Text>
            </View>

            <BouncyPressable onPress={handlePruning} style={styles.rowItemBtn}>
              <View style={styles.rowLabelGroup}>
                <MaterialIcons name="brush" size={20} color={COLORS.secondary} style={styles.rowIcon} />
                <Text style={styles.rowText}>Tự động dọn dẹp nhật ký</Text>
              </View>
              <MaterialIcons name="chevron-right" size={18} color={COLORS.outline} />
            </BouncyPressable>

            <BouncyPressable onPress={exportDatabase} style={styles.rowItemBtn}>
              <View style={styles.rowLabelGroup}>
                <MaterialIcons name="download" size={20} color={COLORS.secondary} style={styles.rowIcon} />
                <Text style={styles.rowText}>Xuất tệp tin cục bộ (Backup JSON)</Text>
              </View>
              <MaterialIcons name="share" size={18} color={COLORS.outline} />
            </BouncyPressable>

            <BouncyPressable onPress={handleImport} style={styles.rowItemBtn}>
              <View style={styles.rowLabelGroup}>
                <MaterialIcons name="file-upload" size={20} color={COLORS.secondary} style={styles.rowIcon} />
                <Text style={styles.rowText}>Khôi phục dữ liệu (Import JSON)</Text>
              </View>
              <MaterialIcons name="attachment" size={18} color={COLORS.outline} />
            </BouncyPressable>

            <BouncyPressable onPress={handleReset} style={styles.rowItemBtn}>
              <View style={styles.rowLabelGroup}>
                <MaterialIcons name="refresh" size={20} color={COLORS.error} style={styles.rowIcon} />
                <Text style={[styles.rowText, { color: COLORS.error }]}>Khôi phục cài đặt gốc</Text>
              </View>
              <MaterialIcons name="chevron-right" size={18} color={COLORS.outline} />
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
    paddingTop: Platform.OS === 'ios' ? 50 : Platform.OS === 'android' ? 40 : 20,
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
