import React, { useRef } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { COLORS, FONTS, SHADOWS, SPACING } from '../config/theme';
import { BouncyPressable } from '../components/BouncyPressable';
import { WaveProgress } from '../components/WaveProgress';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppDb, Event, getTodayDateString } from '../context/AppDbContext';
import { ConfettiView, ConfettiRef } from '../components/ConfettiView';

interface DashboardScreenProps {
  onNavigateToTab: (tabIndex: number) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigateToTab }) => {
  const { db, addWater, logMood } = useAppDb();
  const confettiRef = useRef<ConfettiRef>(null);

  // Get current hour to personalize greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = db.settings.currentUser?.name || 'Sunshine';
    if (hour >= 5 && hour < 12) {
      return `Chào buổi sáng, ${name}! ✨`;
    } else if (hour >= 12 && hour < 18) {
      return `Chào buổi chiều, ${name}! ☀️`;
    } else {
      return `Chào buổi tối, ${name}! 🌙`;
    }
  };

  // Get water intake for today
  const getTodayWater = () => {
    const today = getTodayDateString();
    const log = db.waterHistory.find(h => h.date === today);
    return log ? log.amount : 0;
  };

  const todayWater = getTodayWater();
  const waterGoal = 2000; // 2L goal
  const waterProgress = Math.min(1, todayWater / waterGoal);
  const waterPercent = Math.round(waterProgress * 100);

  // Get current logged mood for today
  const getTodayMood = () => {
    const today = getTodayDateString();
    const log = db.moodHistory.find(m => m.date === today);
    return log ? log.mood : null;
  };

  const todayMood = getTodayMood();

  // Determine if an event is in the future
  const isFutureEvent = (event: Event) => {
    const now = new Date();
    const todayStr = getTodayDateString();
    
    if (event.date > todayStr) return true;
    if (event.date < todayStr) return false;
    
    // If date is today, check start time
    try {
      const startTimePart = event.time.split('-')[0].trim();
      const timeMatch = startTimePart.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      
      if (timeMatch) {
        let hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        const period = timeMatch[3].toUpperCase();
        
        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        
        const eventTime = new Date();
        eventTime.setHours(hours, minutes, 0, 0);
        
        return eventTime > now;
      }
    } catch (e) {
      console.log('Failed to parse event time:', e);
    }
    return true; // Fallback
  };

  // Filter events scheduled for the future and sort chronologically
  const upcomingEvents = db.events
    .filter(isFutureEvent)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });

  const todayEvents = upcomingEvents.slice(0, 3); // Display top 3 upcoming future meetings

  const MOOD_OPTIONS = [
    { emoji: '😊', label: 'Vui vẻ' },
    { emoji: '✨', label: 'Tích cực' },
    { emoji: '🌸', label: 'Bình yên' },
    { emoji: '☕', label: 'Thư giãn' },
    { emoji: '📝', label: 'Tập trung' },
  ];

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text numberOfLines={1} style={styles.greetingText}>
            {getGreeting()}
          </Text>
        </View>
        <BouncyPressable style={styles.notificationButton}>
          <MaterialIcons name="notifications-none" size={24} color={COLORS.primary} />
        </BouncyPressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Water Tracker Bento Card */}
        <View style={[styles.card, styles.waterCard]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Uống nước thôi!</Text>
              <Text style={styles.cardSubtitle}>Hôm nay bạn đã rất cố gắng rồi.</Text>
            </View>
            <View style={styles.waterIconCircle}>
              <MaterialIcons name="opacity" size={22} color={COLORS.onSecondaryContainer} />
            </View>
          </View>

          <View style={styles.waterStats}>
            <Text style={styles.waterAmount}>
              {(todayWater / 1000).toFixed(1)}L{' '}
              <Text style={styles.waterGoal}>/ {(waterGoal / 1000)}L</Text>
            </Text>
            <Text style={styles.waterPercent}>{waterPercent}%</Text>
          </View>

          {/* wave progress */}
          <WaveProgress progress={waterProgress} height={20} />

          <View style={styles.waterActions}>
            <BouncyPressable onPress={(e) => {
              addWater(250);
              confettiRef.current?.trigger(e.nativeEvent.pageX || 200, e.nativeEvent.pageY || 300, ['💧', '💦', '🥤', '🐳', '✨']);
            }} style={styles.addWaterButton}>
              <MaterialIcons name="add" size={16} color={COLORS.onSecondaryContainer} />
              <Text style={styles.addWaterText}>Thêm 250ml</Text>
            </BouncyPressable>
            
            {todayWater > 0 && (
              <BouncyPressable onPress={(e) => {
                addWater(-250);
                confettiRef.current?.trigger(e.nativeEvent.pageX || 100, e.nativeEvent.pageY || 300, ['💨', '😅', '💧']);
              }} style={styles.subtractWaterButton}>
                <MaterialIcons name="remove" size={16} color={COLORS.outline} />
              </BouncyPressable>
            )}
          </View>
        </View>

        {/* Upcoming Meetings Bento Section */}
        <View style={styles.meetingsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lịch hẹn sắp tới</Text>
            <TouchableOpacity onPress={() => onNavigateToTab(1)}>
              <Text style={styles.viewAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.meetingsList}>
            {todayEvents.length === 0 ? (
              <View style={styles.emptyMeetingsCard}>
                <Text style={styles.emptyMeetingsText}>Không có lịch hẹn nào sắp tới ✨</Text>
              </View>
            ) : (
              todayEvents.map((event, idx) => {
                // Determine left border based on event index / type
                const borderStyles = [
                  { borderLeftColor: COLORS.tertiaryContainer },
                  { borderLeftColor: COLORS.primaryContainer },
                  { borderLeftColor: COLORS.secondaryContainer },
                ];
                const activeStyle = borderStyles[idx % borderStyles.length];

                return (
                  <BouncyPressable
                    key={event.id}
                    onPress={() => onNavigateToTab(1)}
                    style={[styles.meetingCard, activeStyle]}
                  >
                    <View style={styles.meetingDateContainer}>
                      <Text style={styles.meetingDayLabel}>TH 3</Text>
                      <Text style={styles.meetingDayNumber}>14</Text>
                    </View>
                    
                    <View style={styles.meetingInfo}>
                      <Text style={styles.meetingTitle}>{event.title}</Text>
                      <View style={styles.meetingTimeContainer}>
                        <MaterialIcons name="access-time" size={12} color={COLORS.onSurfaceVariant} />
                        <Text style={styles.meetingTime}>{event.time}</Text>
                      </View>
                    </View>

                    {/* Display mock avatars or indicator */}
                    <View style={styles.teammateAvatars}>
                      <View style={[styles.avatarCircle, { backgroundColor: COLORS.primaryContainer }]}>
                        <Text style={styles.avatarInitials}>AN</Text>
                      </View>
                      <View style={[styles.avatarCircle, { backgroundColor: COLORS.tertiaryContainer, marginLeft: -8 }]}>
                        <Text style={styles.avatarInitials}>BT</Text>
                      </View>
                    </View>
                  </BouncyPressable>
                );
              })
            )}
          </View>
        </View>

        {/* Mood Tracker Bento Card */}
        <View style={[styles.card, styles.moodCard]}>
          <Text style={styles.moodTitle}>Hôm nay bạn thấy thế nào?</Text>
          <Text style={styles.moodSubtitle}>Ghi lại tâm trạng của bạn.</Text>

          <View style={styles.moodSelectors}>
            {MOOD_OPTIONS.map(opt => {
              const isActive = todayMood === opt.emoji;
              return (
                <BouncyPressable
                  key={opt.emoji}
                  onPress={(e) => {
                    logMood(opt.emoji);
                    confettiRef.current?.trigger(e.nativeEvent.pageX || 150, e.nativeEvent.pageY || 500, [opt.emoji, '✨', '💖', '🌸']);
                  }}
                  style={[
                    styles.moodButton,
                    isActive && styles.activeMoodButton,
                  ]}
                >
                  <Text style={styles.moodEmoji}>{opt.emoji}</Text>
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                    style={[styles.moodLabel, isActive && styles.activeMoodLabel]}
                  >
                    {opt.label}
                  </Text>
                </BouncyPressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
      <ConfettiView ref={confettiRef} />
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
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    fontSize: 18,
    flex: 1,
  },
  notificationButton: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.sm,
    paddingBottom: 120, // Pad for bottom navigation bar
    gap: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: SPACING.sm,
    padding: SPACING.md,
    ...SHADOWS.ambient,
  },
  waterCard: {
    borderBottomWidth: 4,
    borderBottomColor: COLORS.secondaryContainer,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    ...FONTS.headlineSmall,
    color: COLORS.onSurface,
  },
  cardSubtitle: {
    ...FONTS.bodySmall,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  waterIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: SPACING.sm,
  },
  waterAmount: {
    ...FONTS.headlineMedium,
    color: COLORS.secondary,
  },
  waterGoal: {
    ...FONTS.labelMedium,
    color: COLORS.onSurfaceVariant,
    fontWeight: 'normal',
  },
  waterPercent: {
    ...FONTS.labelLarge,
    color: COLORS.secondary,
  },
  waterActions: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  addWaterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondaryContainer,
    paddingVertical: 12,
    borderRadius: 9999,
    gap: 4,
  },
  addWaterText: {
    ...FONTS.labelLarge,
    color: COLORS.onSecondaryContainer,
  },
  subtractWaterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meetingsSection: {
    gap: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  sectionTitle: {
    ...FONTS.headlineSmall,
    color: COLORS.onSurface,
  },
  viewAllText: {
    ...FONTS.labelLarge,
    color: COLORS.primary,
  },
  meetingsList: {
    gap: SPACING.sm,
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
  meetingCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: SPACING.sm,
    padding: SPACING.sm + 4,
    ...SHADOWS.soft,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 8,
  },
  meetingDateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  meetingDayLabel: {
    ...FONTS.labelMedium,
    color: COLORS.onSurfaceVariant,
  },
  meetingDayNumber: {
    ...FONTS.headlineSmall,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  meetingInfo: {
    flex: 1,
    paddingLeft: SPACING.sm,
  },
  meetingTitle: {
    ...FONTS.labelLarge,
    color: COLORS.onSurface,
  },
  meetingTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  meetingTime: {
    ...FONTS.bodySmall,
    color: COLORS.onSurfaceVariant,
  },
  teammateAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 9,
    fontFamily: 'Quicksand-Bold',
    color: COLORS.onSurface,
  },
  moodCard: {
    backgroundColor: COLORS.tertiaryContainer + '20', // Tonal translucent purple
    borderWidth: 1,
    borderColor: COLORS.tertiaryContainer + '60',
  },
  moodTitle: {
    ...FONTS.labelLarge,
    color: COLORS.onTertiaryContainer,
    fontSize: 16,
  },
  moodSubtitle: {
    ...FONTS.bodySmall,
    color: COLORS.onTertiaryContainer,
    opacity: 0.8,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  moodSelectors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 2,
  },
  moodButton: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 12,
    ...SHADOWS.soft,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeMoodButton: {
    backgroundColor: COLORS.tertiaryContainer,
    borderColor: COLORS.tertiary,
  },
  moodEmoji: {
    fontSize: 22,
  },
  moodLabel: {
    ...FONTS.labelMedium,
    fontSize: 9,
    color: COLORS.outline,
    marginTop: 4,
  },
  activeMoodLabel: {
    color: COLORS.tertiary,
    fontFamily: 'Quicksand-Bold',
  },
});
