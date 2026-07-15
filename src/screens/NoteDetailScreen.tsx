import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS, FONTS, SHADOWS, SPACING } from '../config/theme';
import { BouncyPressable } from '../components/BouncyPressable';
import { Ionicons } from '@expo/vector-icons';
import { useAppDb, Note, ChecklistItem } from '../context/AppDbContext';

interface NoteDetailScreenProps {
  noteId: string | null;
  onBack: () => void;
}

export const NoteDetailScreen: React.FC<NoteDetailScreenProps> = ({ noteId, onBack }) => {
  const { db, addNote, updateNote, deleteNote } = useAppDb();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Note['category']>('General');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newCheckItemText, setNewCheckItemText] = useState('');
  const [noteDate, setNoteDate] = useState('');

  // Load note if editing
  useEffect(() => {
    if (noteId) {
      const note = db.notes.find(n => n.id === noteId);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setCategory(note.category);
        setChecklist(note.checklist || []);
        setNoteDate(note.date);
      }
    } else {
      // Clear fields for new note
      setTitle('');
      setContent('');
      setCategory('General');
      setChecklist([]);
      setNewCheckItemText('');
      setNoteDate('');
    }
  }, [noteId, db.notes]);

  // Save action
  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền tiêu đề ghi chú.');
      return;
    }

    const noteData = {
      title: title.trim(),
      content: content.trim(),
      category,
      checklist,
    };

    if (noteId) {
      updateNote(noteId, noteData);
      Alert.alert('Thành công', 'Đã cập nhật ghi chú! ✨', [{ text: 'OK', onPress: onBack }]);
    } else {
      addNote(noteData);
      Alert.alert('Thành công', 'Đã tạo ghi chú mới! 🌟', [{ text: 'OK', onPress: onBack }]);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Xóa ghi chú',
      'Bạn có chắc chắn muốn xóa ghi chú này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            if (noteId) {
              deleteNote(noteId);
              onBack();
            }
          },
        },
      ]
    );
  };

  // Checklist manipulations
  const toggleChecklistItem = (itemId: string) => {
    const updated = checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setChecklist(updated);
  };

  const addChecklistItem = () => {
    if (!newCheckItemText.trim()) return;
    const newItem: ChecklistItem = {
      id: 'item_' + Date.now(),
      text: newCheckItemText.trim(),
      completed: false,
    };
    setChecklist([...checklist, newItem]);
    setNewCheckItemText('');
  };

  const removeChecklistItem = (itemId: string) => {
    setChecklist(checklist.filter(item => item.id !== itemId));
  };



  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <View style={styles.container}>
        {/* Top App Bar */}
        <View style={styles.appBar}>
          <BouncyPressable onPress={onBack} style={styles.appBarBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </BouncyPressable>
          
          <Text style={styles.appBarTitle}>Chi tiết Ghi chú</Text>

          <View style={styles.appBarActions}>
            {noteId && (
              <BouncyPressable onPress={handleDelete} style={[styles.appBarBtn, { marginRight: 8 }]}>
                <Ionicons name="trash-outline" size={22} color={COLORS.error} />
              </BouncyPressable>
            )}
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Tag Selection Chips */}
          <View style={styles.tagChipsContainer}>
            {(['Important', 'Personal', 'Social', 'General'] as Note['category'][]).map(cat => {
              const isSelected = category === cat;
              return (
                <BouncyPressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.tagChip,
                    isSelected && styles.tagChipActive,
                  ]}
                >
                  <Text style={[styles.tagChipText, isSelected && styles.tagChipTextActive]}>
                    {cat}
                  </Text>
                </BouncyPressable>
              );
            })}
          </View>

          {/* Title Header Input */}
          <View style={styles.titleSection}>
            <TextInput
              style={styles.titleInput}
              placeholder="Nhập tiêu đề ghi chú..."
              placeholderTextColor={COLORS.outline}
              value={title}
              onChangeText={setTitle}
            />
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={14} color={COLORS.outline} />
              <Text style={styles.metaText}>
                {noteId ? `Ngày tạo: ${noteDate}` : 'Ngày tạo: Hôm nay'}
              </Text>
            </View>
          </View>



          {/* Rich Content Text Area (Glassmorphism layout style) */}
          <View style={styles.noteGlassCard}>
            <View style={styles.cardHeaderAccent} />
            <TextInput
              style={styles.noteTextArea}
              placeholder="Ghi chú thêm tại đây..."
              placeholderTextColor={COLORS.outline}
              multiline
              value={content}
              onChangeText={setContent}
              textAlignVertical="top"
            />
          </View>

          {/* Checklist Area */}
          <View style={styles.checklistSection}>
            <Text style={styles.checklistTitle}>
              <Ionicons name="list-sharp" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
              Đồ cần chuẩn bị
            </Text>

            <View style={styles.checklistItems}>
              {checklist.map(item => (
                <View key={item.id} style={styles.checkItemRow}>
                  <BouncyPressable onPress={() => toggleChecklistItem(item.id)} style={styles.checkBtn}>
                    <View style={[styles.checkboxCircle, item.completed && styles.checkboxCircleChecked]}>
                      {item.completed && <Ionicons name="checkmark" size={14} color={COLORS.secondary} />}
                    </View>
                  </BouncyPressable>
                  
                  <Text style={[styles.checkText, item.completed && styles.checkTextCompleted]}>
                    {item.text}
                  </Text>

                  <BouncyPressable onPress={() => removeChecklistItem(item.id)} style={styles.checkRemoveBtn}>
                    <Ionicons name="close-circle-outline" size={18} color={COLORS.outline} />
                  </BouncyPressable>
                </View>
              ))}

              {/* Add checklist item row */}
              <View style={styles.addCheckRow}>
                <TextInput
                  style={styles.addCheckInput}
                  placeholder="Thêm mục cần chuẩn bị..."
                  placeholderTextColor={COLORS.outline}
                  value={newCheckItemText}
                  onChangeText={setNewCheckItemText}
                  onSubmitEditing={addChecklistItem}
                />
                <BouncyPressable onPress={addChecklistItem} style={styles.addCheckBtn}>
                  <Ionicons name="add" size={20} color={COLORS.primary} />
                </BouncyPressable>
              </View>
            </View>
          </View>

          {/* Date and Time Picker Section (Visual picker mock) */}
          <View style={styles.scheduleRowCard}>
            <Text style={styles.scheduleHeader}>Thời gian dự kiến</Text>
            <View style={styles.pickerRow}>
              <View style={styles.pickerField}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.secondary} />
                <Text style={styles.pickerText}>2023-10-21</Text>
              </View>
              <View style={styles.pickerField}>
                <Ionicons name="time-outline" size={16} color={COLORS.secondary} />
                <Text style={styles.pickerText}>08:30 AM</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <BouncyPressable onPress={handleSave} style={styles.saveBtn}>
            <Ionicons name="save-outline" size={20} color={COLORS.onPrimaryContainer} />
            <Text style={styles.saveBtnText}>Lưu Ghi Chú</Text>
          </BouncyPressable>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  appBar: {
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
  appBarBtn: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  appBarTitle: {
    ...FONTS.headlineSmall,
    color: COLORS.primary,
  },
  appBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBorder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.primaryContainer,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.md,
    paddingBottom: 60,
    gap: SPACING.md,
  },
  tagChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  tagChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tagChipText: {
    fontSize: 12,
    fontFamily: 'Quicksand-SemiBold',
    color: COLORS.onSurfaceVariant,
  },
  tagChipTextActive: {
    color: COLORS.onPrimary,
  },
  titleSection: {
    gap: 4,
  },
  titleInput: {
    ...FONTS.headlineLarge,
    fontSize: 26,
    color: COLORS.onSurface,
    paddingVertical: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    ...FONTS.bodySmall,
    color: COLORS.onSurfaceVariant,
  },
  imageAttachmentCard: {
    width: '100%',
    height: 180,
    borderRadius: SPACING.sm,
    overflow: 'hidden',
    ...SHADOWS.soft,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.outlineVariant + '40',
    borderStyle: 'dashed',
    borderRadius: SPACING.sm,
    gap: SPACING.sm,
  },
  imagePlaceholderText: {
    ...FONTS.labelMedium,
    color: COLORS.outline,
  },
  imageWrapper: {
    flex: 1,
    position: 'relative',
  },
  attachedImage: {
    width: '100%',
    height: '100%',
  },
  addPhotoFab: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: '#ffffffbf',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
  },
  noteGlassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    padding: SPACING.sm + 4,
    ...SHADOWS.soft,
  },
  cardHeaderAccent: {
    width: 48,
    height: 4,
    backgroundColor: COLORS.primaryContainer,
    borderRadius: 999,
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
  noteTextArea: {
    ...FONTS.bodyLarge,
    color: COLORS.onSurface,
    minHeight: 120,
  },
  checklistSection: {
    gap: SPACING.sm,
  },
  checklistTitle: {
    ...FONTS.headlineSmall,
    color: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checklistItems: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    ...SHADOWS.soft,
    gap: SPACING.sm,
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
    paddingBottom: 8,
  },
  checkBtn: {
    paddingRight: SPACING.sm,
  },
  checkboxCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCircleChecked: {
    backgroundColor: COLORS.secondaryContainer,
    borderColor: COLORS.secondaryContainer,
  },
  checkText: {
    ...FONTS.bodyMedium,
    color: COLORS.onSurface,
    flex: 1,
  },
  checkTextCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.outline,
  },
  checkRemoveBtn: {
    padding: 4,
  },
  addCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  addCheckInput: {
    flex: 1,
    ...FONTS.bodyMedium,
    color: COLORS.onSurface,
    paddingVertical: 8,
  },
  addCheckBtn: {
    padding: 8,
    borderRadius: 9999,
    backgroundColor: COLORS.primaryContainer,
  },
  scheduleRowCard: {
    backgroundColor: COLORS.secondaryContainer + '1a',
    borderRadius: SPACING.sm,
    padding: SPACING.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.secondaryContainer,
    gap: SPACING.sm,
  },
  scheduleHeader: {
    ...FONTS.labelLarge,
    color: COLORS.onSecondaryContainer,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  pickerField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 9999,
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    gap: 8,
    ...SHADOWS.soft,
  },
  pickerText: {
    ...FONTS.bodyMedium,
    color: COLORS.onSurface,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryContainer,
    borderRadius: 9999,
    paddingVertical: 14,
    ...SHADOWS.soft,
    gap: 8,
    marginVertical: SPACING.md,
  },
  saveBtnText: {
    ...FONTS.labelLarge,
    color: COLORS.onPrimaryContainer,
    fontSize: 16,
  },
});
