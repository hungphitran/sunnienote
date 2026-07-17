import React, { useState, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { StyleSheet, Text, View, Image, ScrollView, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { COLORS, FONTS, SHADOWS, SPACING } from '../config/theme';
import { BouncyPressable } from '../components/BouncyPressable';
import { Ionicons } from '@expo/vector-icons';
import { useAppDb, Event, getLocalDateString } from '../context/AppDbContext';
import { ConfettiView, ConfettiRef } from '../components/ConfettiView';
import { CheerToast } from '../components/CheerToast';

export const CalendarScreen: React.FC = () => {
  const { db, addEvent, toggleAlarm, deleteEvent } = useAppDb();
  const confettiRef = useRef<ConfettiRef>(null);

  // Toast States
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastSub, setToastSub] = useState('');
  const [toastBadge, setToastBadge] = useState('🌟');

  // Selected calendar day
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0); // 0 = today, -1 = yesterday, etc.
  
  // Schedule Event Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventHour, setEventHour] = useState(9);
  const [eventMinute, setEventMinute] = useState(30);
  const [eventPeriod, setEventPeriod] = useState<'AM' | 'PM'>('AM');

  // Generate 7 days of the week starting from today
  const getDaysOfWeek = () => {
    const days = [];
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Get starting monday of current week or just 7 days from today
    // For visual simplicity, we generate 7 days centered around today
    for (let i = -3; i <= 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      
      // Get standard day labels
      let dayIndex = d.getDay() - 1; // Mon = 0
      if (dayIndex < 0) dayIndex = 6; // Sun = 6
      
      const dayLabel = weekdays[dayIndex];
      const dayNum = d.getDate();
      const dateString = getLocalDateString(d);

      days.push({
        label: dayLabel,
        number: dayNum,
        dateString,
        offset: i,
      });
    }
    return days;
  };

  const days = getDaysOfWeek();
  const activeDay = days.find(d => d.offset === selectedDayOffset) || days[3]; // Fallback

  // Filter events for the selected date
  const filteredEvents = db.events.filter(e => e.date === activeDay.dateString);

  const handleScheduleEvent = async (e: any) => {
    if (!eventTitle.trim()) {
      setToastMsg('Thiếu thông tin mất rồi! ✍️');
      setToastSub('Vui lòng điền tiêu đề sự kiện nhé. 💕');
      setToastBadge('✍️');
      setToastVisible(true);
      return;
    }

    const isNotificationSupported = Platform.OS !== 'web' || (typeof window !== 'undefined' && 'Notification' in window);

    if (isNotificationSupported) {
      // Enforce browser/device notification permission before scheduling
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          setToastMsg('Chưa bật thông báo rồi! 🔔');
          setToastSub('Hãy cấp quyền thông báo trong cài đặt để lên lịch họp nhé! 🌸');
          setToastBadge('🔔');
          setToastVisible(true);
          return;
        }
      } catch (err) {
        console.log('Notification permission check failed:', err);
        setToastMsg('Yêu cầu quyền thông báo! 🔔');
        setToastSub('Vui lòng cấp quyền thông báo trong cài đặt để lên lịch họp.');
        setToastBadge('🔔');
        setToastVisible(true);
        return;
      }
    } else {
      // Chrome iOS warning
      setToastMsg('Chưa bật thông báo rồi! 🔔');
      setToastSub('Chrome iOS không hỗ trợ thông báo đẩy trực tiếp. Vui lòng dùng Safari hoặc thêm ứng dụng ra Màn hình chính nhé! 🌸');
      setToastBadge('🔔');
      setToastVisible(true);
      return;
    }

    const timeString = `${String(eventHour).padStart(2, '0')}:${String(eventMinute).padStart(2, '0')} ${eventPeriod}`;
    
    addEvent({
      title: eventTitle.trim(),
      category: 'Meeting',
      date: activeDay.dateString,
      time: timeString,
      location: eventLocation.trim() || undefined,
      alarmActive: true,
    });

    // Schedule local notification on device
    let finalHour = eventHour;
    if (eventPeriod === 'PM' && eventHour < 12) finalHour += 12;
    if (eventPeriod === 'AM' && eventHour === 12) finalHour = 0;

    const [year, month, day] = activeDay.dateString.split('-').map(Number);
    const scheduledTime = new Date(year, month - 1, day, finalHour, eventMinute, 0);

    if (isNotificationSupported && scheduledTime > new Date()) {
      Notifications.scheduleNotificationAsync({
        content: {
          title: `Nhắc nhở sự kiện: ${eventTitle.trim()}`,
          body: `Lịch hẹn lúc ${timeString}${eventLocation.trim() ? ' tại ' + eventLocation.trim() : ''}`,
          sound: true,
        },
        trigger: {
          type: 'date',
          date: scheduledTime,
        } as any,
      }).catch(err => console.log('Notification scheduling failed', err));
    }

    setEventTitle('');
    setEventLocation('');
    
    const { pageX, pageY } = e?.nativeEvent || {};
    confettiRef.current?.trigger(pageX || 200, pageY || 350, ['📅', '⏰', '🎉', '✨', '🎈']);
    
    setToastMsg('Đặt lịch thành công! 🎉');
    setToastSub('Ứng dụng sẽ nhắc nhở bạn khi đến giờ họp. 💕');
    setToastBadge('📅');
    setToastVisible(true);
  };

  const getMonthYearString = () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const d = new Date();
    d.setDate(d.getDate() + selectedDayOffset);
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.greetingText}>Hi, {db.settings.currentUser?.name || 'Sunshine'}!</Text>
        </View>
        <BouncyPressable style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
        </BouncyPressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Month Selector Title */}
        <View style={styles.monthHeader}>
          <Text style={styles.monthText}>{getMonthYearString()}</Text>
          <BouncyPressable style={styles.monthActionBtn}>
            <Text style={styles.monthActionText}>Full view</Text>
            <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
          </BouncyPressable>
        </View>

        {/* Mini Horizontal Weekly Calendar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.calendarStrip}
        >
          {days.map(day => {
            const isSelected = selectedDayOffset === day.offset;
            return (
              <BouncyPressable
                key={day.dateString}
                onPress={() => setSelectedDayOffset(day.offset)}
                style={[
                  styles.dayCard,
                  isSelected && styles.dayCardSelected,
                ]}
              >
                <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
                  {day.label}
                </Text>
                <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>
                  {day.number}
                </Text>
              </BouncyPressable>
            );
          })}
        </ScrollView>

        {/* Plan Next Meeting Form */}
        <View style={styles.schedulerFormCard}>
          <Text style={styles.formTitle}>Lên kế hoạch cuộc họp tiếp theo</Text>

          <TextInput
            style={styles.formInput}
            placeholder="Tiêu đề cuộc họp..."
            placeholderTextColor={COLORS.outline}
            value={eventTitle}
            onChangeText={setEventTitle}
          />

          <TextInput
            style={styles.formInput}
            placeholder="Địa điểm hoặc link họp (Google Meet, Cafe...)..."
            placeholderTextColor={COLORS.outline}
            value={eventLocation}
            onChangeText={setEventLocation}
          />

          {/* Time Picker Controls */}
          <View style={styles.timePickerContainer}>
            <View style={styles.timeColumn}>
              <TouchableOpacity onPress={() => setEventHour(h => (h === 12 ? 1 : h + 1))}>
                <Ionicons name="chevron-up" size={24} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.timeDigit}>{String(eventHour).padStart(2, '0')}</Text>
              <TouchableOpacity onPress={() => setEventHour(h => (h === 1 ? 12 : h - 1))}>
                <Ionicons name="chevron-down" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.timeColon}>:</Text>

            <View style={styles.timeColumn}>
              <TouchableOpacity onPress={() => setEventMinute(m => (m >= 55 ? 0 : m + 5))}>
                <Ionicons name="chevron-up" size={24} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.timeDigit}>{String(eventMinute).padStart(2, '0')}</Text>
              <TouchableOpacity onPress={() => setEventMinute(m => (m <= 0 ? 55 : m - 5))}>
                <Ionicons name="chevron-down" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.periodColumn}>
              <TouchableOpacity
                onPress={() => setEventPeriod('AM')}
                style={[styles.periodBtn, eventPeriod === 'AM' && styles.periodBtnActive]}
              >
                <Text style={[styles.periodText, eventPeriod === 'AM' && styles.periodTextActive]}>
                  AM
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setEventPeriod('PM')}
                style={[styles.periodBtn, eventPeriod === 'PM' && styles.periodBtnActive]}
              >
                <Text style={[styles.periodText, eventPeriod === 'PM' && styles.periodTextActive]}>
                  PM
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <BouncyPressable onPress={(e) => handleScheduleEvent(e)} style={styles.scheduleButton}>
            <Text style={styles.scheduleButtonText}>Cài nhắc lịch hẹn</Text>
          </BouncyPressable>
        </View>

        {/* Scheduled Meetings List */}
        <View style={styles.meetingsSection}>
          <View style={styles.meetingsHeader}>
            <Text style={styles.meetingsTitle}>Scheduled Meetings</Text>
            <View style={styles.meetingsBadge}>
              <Text style={styles.meetingsBadgeText}>
                {filteredEvents.length} {filteredEvents.length === 1 ? 'Meeting' : 'Meetings'}
              </Text>
            </View>
          </View>

          <View style={styles.meetingsList}>
            {filteredEvents.length === 0 ? (
              <View style={styles.emptyMeetingsCard}>
                <Text style={styles.emptyMeetingsText}>Không có lịch họp nào cho ngày này ✨</Text>
              </View>
            ) : (
              filteredEvents.map(event => (
                <View key={event.id} style={styles.meetingItemCard}>
                  <View style={[
                    styles.meetingContent,
                    event.isUrgent && styles.urgentLeftBorder,
                    !event.isUrgent && styles.normalLeftBorder
                  ]}>
                    <View style={styles.meetingTextBlock}>
                      <Text style={[styles.meetingCategory, event.isUrgent && styles.urgentText]}>
                        {event.isUrgent ? 'URGENT' : event.category.toUpperCase()}
                      </Text>
                      <Text style={styles.meetingTitleText}>{event.title}</Text>
                      
                      <View style={styles.meetingMeta}>
                        <View style={styles.metaRow}>
                          <Ionicons name="time-outline" size={14} color={COLORS.outline} />
                          <Text style={styles.metaText}>{event.time}</Text>
                        </View>
                        {event.location && (
                          <View style={styles.metaRow}>
                            <Ionicons name="location-outline" size={14} color={COLORS.outline} />
                            <Text style={styles.metaText} numberOfLines={1}>{event.location}</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Alarm Toggle Button */}
                    <BouncyPressable
                      onPress={() => toggleAlarm(event.id)}
                      style={[
                        styles.alarmButton,
                        event.alarmActive && styles.alarmButtonActive
                      ]}
                    >
                      <Ionicons
                        name={event.alarmActive ? 'notifications' : 'notifications-off-outline'}
                        size={18}
                        color={event.alarmActive ? COLORS.onSecondary : COLORS.outline}
                      />
                    </BouncyPressable>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
      <ConfettiView ref={confettiRef} />
      <CheerToast
        visible={toastVisible}
        message={toastMsg}
        subtitle={toastSub}
        badge={toastBadge}
        onHide={() => setToastVisible(false)}
      />
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
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBorder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.primaryContainer,
    overflow: 'hidden',
    marginRight: SPACING.sm,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  greetingText: {
    ...FONTS.headlineSmall,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  notificationButton: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.sm,
    paddingBottom: 120,
    gap: SPACING.lg,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  monthText: {
    ...FONTS.headlineSmall,
    color: COLORS.onSurface,
  },
  monthActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  monthActionText: {
    ...FONTS.labelLarge,
    color: COLORS.primary,
  },
  calendarStrip: {
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
  },
  dayCard: {
    width: 56,
    height: 80,
    borderRadius: SPACING.sm,
    backgroundColor: COLORS.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayCardSelected: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.tonalPrimary,
  },
  dayLabel: {
    ...FONTS.labelMedium,
    color: COLORS.onSurfaceVariant,
  },
  dayLabelSelected: {
    color: COLORS.onPrimary,
  },
  dayNumber: {
    ...FONTS.headlineSmall,
    color: COLORS.onSurface,
    fontWeight: 'bold',
    marginTop: 4,
  },
  dayNumberSelected: {
    color: COLORS.onPrimary,
  },
  schedulerFormCard: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: SPACING.sm,
    padding: SPACING.md,
    ...SHADOWS.soft,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.primaryContainer,
  },
  formTitle: {
    ...FONTS.headlineSmall,
    fontSize: 18,
    color: COLORS.onSurface,
    marginBottom: SPACING.md,
  },
  formInput: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    height: 48,
    ...FONTS.bodyMedium,
    color: COLORS.onSurface,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + '40',
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 9999,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  timeColumn: {
    alignItems: 'center',
  },
  timeDigit: {
    ...FONTS.headlineMedium,
    color: COLORS.primary,
    marginVertical: 2,
  },
  timeColon: {
    ...FONTS.headlineMedium,
    color: COLORS.outlineVariant,
  },
  periodColumn: {
    flexDirection: 'column',
    gap: 4,
    marginLeft: SPACING.md,
  },
  periodBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  periodBtnActive: {
    backgroundColor: COLORS.secondaryContainer,
    borderColor: COLORS.secondaryContainer,
  },
  periodText: {
    ...FONTS.labelMedium,
    color: COLORS.outline,
  },
  periodTextActive: {
    color: COLORS.onSecondaryContainer,
    fontFamily: 'Quicksand-Bold',
  },
  scheduleButton: {
    backgroundColor: COLORS.primaryContainer,
    borderRadius: 9999,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: SPACING.sm,
    ...SHADOWS.soft,
  },
  scheduleButtonText: {
    ...FONTS.labelLarge,
    color: COLORS.onPrimaryContainer,
  },
  meetingsSection: {
    gap: SPACING.sm,
  },
  meetingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  meetingsTitle: {
    ...FONTS.headlineSmall,
    color: COLORS.onSurface,
  },
  meetingsBadge: {
    backgroundColor: COLORS.secondaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  meetingsBadgeText: {
    fontSize: 12,
    fontFamily: 'Quicksand-Bold',
    color: COLORS.onSecondaryContainer,
  },
  meetingsList: {
    gap: SPACING.md,
  },
  emptyMeetingsCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: SPACING.sm,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
  },
  emptyMeetingsText: {
    ...FONTS.bodyMedium,
    color: COLORS.outline,
  },
  meetingItemCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: SPACING.sm,
    ...SHADOWS.soft,
    overflow: 'hidden',
  },
  meetingImageContainer: {
    height: 120,
    width: '100%',
  },
  meetingImage: {
    width: '100%',
    height: '100%',
  },
  meetingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderLeftWidth: 8,
  },
  normalLeftBorder: {
    borderLeftColor: COLORS.secondary,
  },
  urgentLeftBorder: {
    borderLeftColor: COLORS.errorContainer,
  },
  meetingTextBlock: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  meetingCategory: {
    fontSize: 10,
    fontFamily: 'Quicksand-Bold',
    color: COLORS.secondary,
    letterSpacing: 1,
  },
  urgentText: {
    color: COLORS.error,
  },
  meetingTitleText: {
    ...FONTS.headlineSmall,
    fontSize: 18,
    color: COLORS.onSurface,
    marginTop: 2,
  },
  meetingMeta: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
    flexWrap: 'wrap',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...FONTS.bodySmall,
    color: COLORS.onSurfaceVariant,
  },
  alarmButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alarmButtonActive: {
    backgroundColor: COLORS.secondary,
  },
});
