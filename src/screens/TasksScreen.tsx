import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TextInput, Modal, Alert } from 'react-native';
import { COLORS, FONTS, SHADOWS, SPACING } from '../config/theme';
import { BouncyPressable } from '../components/BouncyPressable';
import { Ionicons } from '@expo/vector-icons';
import { useAppDb, Task } from '../context/AppDbContext';
import { ConfettiView, ConfettiRef } from '../components/ConfettiView';
import { CheerToast } from '../components/CheerToast';

export const TasksScreen: React.FC = () => {
  const { db, addTask, toggleTask, deleteTask } = useAppDb();

  const confettiRef = useRef<ConfettiRef>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<Task['category']>('Self Care');

  // Compute tasks counts
  const todayTasks = db.tasks.filter(t => !t.completed);
  const completedTasks = db.tasks.filter(t => t.completed);
  const tasksLeftCount = todayTasks.length;

  const CHEER_MESSAGES = [
    'Bạn thật tuyệt vời! 🌟',
    'Làm tốt lắm! ✨',
    'Tuyệt vời ông mặt trời! ☀️',
    'Tiến thêm một bước nữa rồi! 💖',
    'Thật năng suất quá đi! 🎉',
  ];

  const handleToggle = (task: Task, event: any) => {
    const isNowCompleted = !task.completed;
    toggleTask(task.id);

    if (isNowCompleted) {
      // Trigger particles at tap location
      const { pageX, pageY } = event.nativeEvent;
      if (confettiRef.current) {
        confettiRef.current.trigger(pageX || 200, pageY || 300);
      }

      // Show random cheer toast
      const randomMsg = CHEER_MESSAGES[Math.floor(Math.random() * CHEER_MESSAGES.length)];
      setToastMsg(randomMsg);
      setToastVisible(true);
    }
  };

  const handleAddTask = () => {
    if (!newTaskText.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên công việc.');
      return;
    }
    addTask(newTaskText.trim(), newTaskCategory);
    setNewTaskText('');
    setModalVisible(false);
  };

  // Helper for Category Styling
  const getCategoryTheme = (cat: Task['category']) => {
    switch (cat) {
      case 'Self Care':
        return {
          icon: 'heart',
          bgColor: COLORS.tertiaryContainer,
          color: COLORS.tertiary,
        };
      case 'Projects':
        return {
          icon: 'create',
          bgColor: COLORS.primaryContainer,
          color: COLORS.primary,
        };
      case 'Home':
        return {
          icon: 'home',
          bgColor: COLORS.secondaryContainer,
          color: COLORS.secondary,
        };
    }
  };

  // Date Formatting for display
  const getFormattedDate = () => {
    const months = [
      'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
    ];
    const d = new Date();
    return `${months[d.getMonth()]} ${d.getDate()}`;
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
        {/* Welcome Encouragement Card */}
        <View style={styles.encouragementCard}>
          <Text style={styles.cardTitle}>You're doing great!</Text>
          <Text style={styles.cardSubtitle}>
            {tasksLeftCount === 0 ? 'Tất cả công việc đã hoàn thành! 🎉' : `${tasksLeftCount} công việc chưa hoàn tất hôm nay.`}
          </Text>
        </View>

        {/* Section title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nhiệm vụ hôm nay</Text>
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>{getFormattedDate()}</Text>
          </View>
        </View>

        {/* Uncompleted Tasks List */}
        <View style={styles.tasksList}>
          {todayTasks.length === 0 ? (
            <View style={styles.emptyTasksCard}>
              <Text style={styles.emptyTasksText}>Tuyệt vời! Bạn không còn việc nào cần làm hôm nay. ✨</Text>
            </View>
          ) : (
            todayTasks.map(task => {
              const theme = getCategoryTheme(task.category);
              return (
                <View key={task.id} style={styles.taskCard}>
                  <View style={styles.taskInfo}>
                    <View style={[styles.categoryIconCircle, { backgroundColor: theme.bgColor }]}>
                      <Ionicons name={theme.icon as any} size={18} color={theme.color} />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.taskText}>{task.text}</Text>
                      <Text style={[styles.taskCategory, { color: theme.color }]}>
                        {task.category.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <BouncyPressable onPress={(e) => handleToggle(task, e)} style={styles.checkboxWrapper}>
                    <View style={styles.checkbox} />
                  </BouncyPressable>
                </View>
              );
            })
          )}
        </View>

        {/* Completed Section */}
        {completedTasks.length > 0 && (
          <View style={styles.completedSection}>
            <Text style={styles.completedSectionTitle}>Đã hoàn thành</Text>
            <View style={styles.tasksList}>
              {completedTasks.map(task => {
                const theme = getCategoryTheme(task.category);
                return (
                  <View key={task.id} style={[styles.taskCard, styles.completedTaskCard]}>
                    <View style={styles.taskInfo}>
                      <View style={[styles.categoryIconCircle, { backgroundColor: theme.bgColor, opacity: 0.5 }]}>
                        <Ionicons name={theme.icon as any} size={18} color={theme.color} />
                      </View>
                      <View style={styles.textContainer}>
                        <Text style={[styles.taskText, styles.checkedText]}>{task.text}</Text>
                        <Text style={[styles.taskCategory, { color: theme.color, opacity: 0.6 }]}>
                          {task.category.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <BouncyPressable onPress={(e) => handleToggle(task, e)} style={styles.checkboxWrapper}>
                      <View style={[styles.checkbox, styles.checkboxChecked]}>
                        <Ionicons name="checkmark" size={16} color={COLORS.secondary} />
                      </View>
                    </BouncyPressable>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Visual Sticker Area */}
        <View style={styles.stickerArea}>
          <View style={styles.trophyCircle}>
            <Ionicons name="trophy" size={48} color={COLORS.onTertiaryContainer} />
          </View>
          <Text style={styles.stickerText}>
            Mỗi dấu tích là một chiến thắng nhỏ. Tiếp tục phát huy nhé!
          </Text>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <BouncyPressable onPress={() => setModalVisible(true)} style={styles.fab}>
        <Ionicons name="add" size={32} color="#ffffff" />
      </BouncyPressable>

      {/* Add Task Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm nhiệm vụ mới</Text>
              <BouncyPressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.onSurface} />
              </BouncyPressable>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Bạn cần làm việc gì..."
              placeholderTextColor={COLORS.outline}
              value={newTaskText}
              onChangeText={setNewTaskText}
              autoFocus
            />

            <Text style={styles.categoryLabel}>Chọn danh mục</Text>
            <View style={styles.categorySelector}>
              {(['Self Care', 'Projects', 'Home'] as Task['category'][]).map(cat => {
                const isSelected = newTaskCategory === cat;
                const theme = getCategoryTheme(cat);
                return (
                  <BouncyPressable
                    key={cat}
                    onPress={() => setNewTaskCategory(cat)}
                    style={[
                      styles.categoryOption,
                      { borderColor: theme.bgColor },
                      isSelected && { backgroundColor: theme.bgColor },
                    ]}
                  >
                    <Ionicons name={theme.icon as any} size={16} color={theme.color} />
                    <Text style={[styles.categoryOptionText, { color: theme.color }]}>{cat}</Text>
                  </BouncyPressable>
                );
              })}
            </View>

            <BouncyPressable onPress={handleAddTask} style={styles.addTaskSubmitButton}>
              <Text style={styles.addTaskSubmitText}>Thêm Công Việc</Text>
            </BouncyPressable>
          </View>
        </View>
      </Modal>

      {/* Toast Alert */}
      <CheerToast
        visible={toastVisible}
        message={toastMsg}
        onHide={() => setToastVisible(false)}
      />

      {/* Particles Emitter */}
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
  encouragementCard: {
    backgroundColor: COLORS.primaryContainer,
    borderRadius: SPACING.sm,
    padding: SPACING.md,
    ...SHADOWS.ambient,
    minHeight: 120,
    justifyContent: 'flex-end',
  },
  cardTitle: {
    ...FONTS.headlineMedium,
    color: COLORS.onPrimaryContainer,
  },
  cardSubtitle: {
    ...FONTS.bodySmall,
    color: COLORS.onPrimaryFixedVariant,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  sectionTitle: {
    ...FONTS.labelLarge,
    color: COLORS.onSurfaceVariant,
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dateBadge: {
    backgroundColor: COLORS.primaryFixed,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  dateText: {
    fontSize: 11,
    fontFamily: 'Quicksand-Bold',
    color: COLORS.primary,
  },
  tasksList: {
    gap: SPACING.sm,
  },
  emptyTasksCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: SPACING.sm,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
  },
  emptyTasksText: {
    ...FONTS.bodyMedium,
    color: COLORS.outline,
    textAlign: 'center',
  },
  taskCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: SPACING.sm,
    padding: SPACING.sm + 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.soft,
  },
  completedTaskCard: {
    opacity: 0.7,
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  textContainer: {
    flex: 1,
  },
  taskText: {
    ...FONTS.bodyMedium,
    color: COLORS.onSurface,
    fontWeight: '600',
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: COLORS.outline,
  },
  taskCategory: {
    fontSize: 10,
    fontFamily: 'Quicksand-Bold',
    marginTop: 2,
  },
  checkboxWrapper: {
    padding: 6,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.secondaryContainer,
    borderColor: COLORS.secondaryContainer,
  },
  completedSection: {
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  completedSectionTitle: {
    ...FONTS.labelLarge,
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 4,
  },
  stickerArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  trophyCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.tertiaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickerText: {
    ...FONTS.labelMedium,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100, // Float above bottom bar
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.tonalPrimary,
    zIndex: 90,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: SPACING.sm,
    borderTopRightRadius: SPACING.sm,
    padding: SPACING.md,
    paddingBottom: 40,
    ...SHADOWS.tonalPrimary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    ...FONTS.headlineMedium,
    color: COLORS.onSurface,
  },
  modalInput: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: SPACING.sm,
    padding: SPACING.sm + 4,
    ...FONTS.bodyMedium,
    color: COLORS.onSurface,
    ...SHADOWS.soft,
    marginBottom: SPACING.md,
  },
  categoryLabel: {
    ...FONTS.labelLarge,
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.sm,
  },
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    gap: 8,
  },
  categoryOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 9999,
    paddingVertical: 10,
    gap: 4,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  categoryOptionText: {
    ...FONTS.labelMedium,
  },
  addTaskSubmitButton: {
    width: '100%',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  addTaskSubmitText: {
    ...FONTS.labelLarge,
    color: '#ffffff',
    backgroundColor: COLORS.primary,
    textAlign: 'center',
    paddingVertical: 14,
    borderRadius: 9999,
    ...SHADOWS.soft,
  },
});
