import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TextInput, FlatList } from 'react-native';
import { COLORS, FONTS, SHADOWS, SPACING } from '../config/theme';
import { BouncyPressable } from '../components/BouncyPressable';
import { Ionicons } from '@expo/vector-icons';
import { useAppDb, Note } from '../context/AppDbContext';

interface NotesScreenProps {
  onSelectNote: (noteId: string | null) => void;
  onNavigateToTab: (tabIndex: number) => void;
}

export const NotesScreen: React.FC<NotesScreenProps> = ({ onSelectNote, onNavigateToTab }) => {
  const { db } = useAppDb();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchFocused, setSearchFocused] = useState(false);

  const categories = ['All', 'Important', 'Personal', 'Social'];

  // Filter notes based on category & search query
  const filteredNotes = db.notes.filter(note => {
    const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory;
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Extract featured notes (Important category) to display as large cards
  const importantNotes = filteredNotes.filter(n => n.category === 'Important');
  const otherNotes = filteredNotes.filter(n => n.category !== 'Important');

  // Icons based on note content or category
  const getNoteIcon = (note: Note) => {
    const title = note.title.toLowerCase();
    if (title.includes('gym') || title.includes('fit') || title.includes('run')) return 'fitness-outline';
    if (title.includes('study') || title.includes('history') || title.includes('learn') || title.includes('session')) return 'book-outline';
    if (title.includes('art') || title.includes('project') || title.includes('paint') || title.includes('craft')) return 'color-palette-outline';
    if (note.checklist && note.checklist.length > 0) return 'list-circle-outline';
    return 'document-text-outline';
  };

  const getCategoryColor = (cat: Note['category']) => {
    switch (cat) {
      case 'Important':
        return COLORS.primary;
      case 'Personal':
        return COLORS.secondary;
      case 'Social':
        return COLORS.tertiary;
      default:
        return COLORS.outline;
    }
  };

  const getCategoryBgColor = (cat: Note['category']) => {
    switch (cat) {
      case 'Important':
        return COLORS.primaryContainer;
      case 'Personal':
        return COLORS.secondaryContainer;
      case 'Social':
        return COLORS.tertiaryContainer;
      default:
        return COLORS.surfaceContainerLow;
    }
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
        {/* Search Section */}
        <View style={[styles.searchContainer, searchFocused && styles.searchContainerFocused]}>
          <Ionicons name="search" size={20} color={COLORS.outline} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for your notes..."
            placeholderTextColor={COLORS.outline + '80'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <BouncyPressable>
            <Ionicons name="funnel-outline" size={20} color={COLORS.primary} />
          </BouncyPressable>
        </View>

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsStrip}
        >
          {categories.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <BouncyPressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.chip,
                  isSelected && styles.chipSelected,
                ]}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {cat === 'All' ? 'All Notes' : cat}
                </Text>
              </BouncyPressable>
            );
          })}
        </ScrollView>

        {/* Bento Grid for Important/Featured Notes */}
        <View style={styles.bentoSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <BouncyPressable onPress={() => onNavigateToTab(1)}>
              <Text style={styles.viewCalendarLink}>View Calendar</Text>
            </BouncyPressable>
          </View>

          {/* Large Card (renders first Important Note if available, otherwise fallback placeholder) */}
          {importantNotes.length > 0 ? (
            <BouncyPressable
              onPress={() => onSelectNote(importantNotes[0].id)}
              style={styles.featuredCard}
            >
              <View style={styles.decorIconContainer}>
                <Ionicons name="gift-outline" size={100} color={COLORS.primary + '15'} style={styles.decorIcon} />
              </View>
              
              <View style={styles.featuredCardHeader}>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagBadgeText}>Important</Text>
                </View>
              </View>

              <View style={styles.featuredCardBody}>
                <Text numberOfLines={1} style={styles.featuredTitle}>{importantNotes[0].title}</Text>
                <Text numberOfLines={2} style={styles.featuredSubtitle}>{importantNotes[0].content}</Text>
              </View>

              <View style={styles.featuredCardFooter}>
                <View style={styles.featuredMeta}>
                  <Ionicons name="time-outline" size={14} color={COLORS.onPrimaryContainer} />
                  <Text style={styles.featuredTime}>Tomorrow, 08:00 PM</Text>
                </View>
                <View style={styles.featuredArrowBtn}>
                  <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                </View>
              </View>
            </BouncyPressable>
          ) : (
            <BouncyPressable
              onPress={() => onNavigateToTab(1)}
              style={[styles.featuredCard, { backgroundColor: COLORS.secondaryContainer }]}
            >
              <View style={styles.decorIconContainer}>
                <Ionicons name="calendar-outline" size={100} color={COLORS.secondary + '15'} style={styles.decorIcon} />
              </View>
              <View style={styles.tagBadge}>
                <Text style={[styles.tagBadgeText, { color: COLORS.secondary }]}>Upcoming</Text>
              </View>
              <View style={styles.featuredCardBody}>
                <Text style={[styles.featuredTitle, { color: COLORS.onSecondaryContainer }]}>Đi picnic cuối tuần</Text>
                <Text style={[styles.featuredSubtitle, { color: COLORS.onSecondaryContainer + 'bb' }]}>Lake side with friends.</Text>
              </View>
              <View style={styles.featuredCardFooter}>
                <View style={styles.featuredMeta}>
                  <Ionicons name="time-outline" size={14} color={COLORS.onSecondaryContainer} />
                  <Text style={[styles.featuredTime, { color: COLORS.onSecondaryContainer }]}>Saturday, 08:30 AM</Text>
                </View>
              </View>
            </BouncyPressable>
          )}

          {/* Double Column Sub Grid */}
          <View style={styles.gridContainer}>
            {otherNotes.slice(0, 2).map((note, index) => {
              const bgColor = getCategoryBgColor(note.category);
              const textColor = getCategoryColor(note.category);
              return (
                <BouncyPressable
                  key={note.id}
                  onPress={() => onSelectNote(note.id)}
                  style={[styles.gridCard, { backgroundColor: bgColor }]}
                >
                  <View style={[styles.gridIconCircle, { backgroundColor: '#ffffff70' }]}>
                    <Ionicons name={getNoteIcon(note) as any} size={18} color={textColor} />
                  </View>
                  <View style={styles.gridTextContainer}>
                    <Text numberOfLines={1} style={[styles.gridTitle, { color: textColor }]}>
                      {note.title}
                    </Text>
                    <Text numberOfLines={2} style={[styles.gridDesc, { color: textColor + 'bb' }]}>
                      {note.content}
                    </Text>
                  </View>
                  <View style={styles.gridTagFooter}>
                    <View style={[styles.tagDot, { backgroundColor: textColor }]} />
                    <Text style={[styles.tagLabel, { color: textColor }]}>{note.category}</Text>
                  </View>
                </BouncyPressable>
              );
            })}
          </View>
        </View>

        {/* Other Notes vertical list */}
        <View style={styles.otherNotesSection}>
          <Text style={styles.sectionTitle}>Other Notes</Text>
          
          <View style={styles.otherNotesList}>
            {filteredNotes.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Không tìm thấy ghi chú nào ✨</Text>
              </View>
            ) : (
              filteredNotes.map(note => (
                <BouncyPressable
                  key={note.id}
                  onPress={() => onSelectNote(note.id)}
                  style={[
                    styles.noteListItem,
                    { borderBottomColor: getCategoryBgColor(note.category) }
                  ]}
                >
                  <View style={[styles.listItemIconCircle, { backgroundColor: getCategoryBgColor(note.category) }]}>
                    <Ionicons
                      name={getNoteIcon(note) as any}
                      size={20}
                      color={getCategoryColor(note.category)}
                    />
                  </View>
                  <View style={styles.listItemTextContainer}>
                    <Text style={styles.listItemTitle}>{note.title}</Text>
                    <Text numberOfLines={1} style={styles.listItemDesc}>{note.content}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.outlineVariant} />
                </BouncyPressable>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* FAB to add a new note */}
      <BouncyPressable onPress={() => onSelectNote(null)} style={styles.fab}>
        <Ionicons name="add" size={32} color="#ffffff" />
      </BouncyPressable>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 9999,
    paddingHorizontal: SPACING.sm + 4,
    height: 54,
    borderWidth: 1,
    borderColor: 'transparent',
    ...SHADOWS.soft,
  },
  searchContainerFocused: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderColor: COLORS.primaryContainer,
    borderWidth: 1.5,
  },
  searchInput: {
    flex: 1,
    ...FONTS.bodyMedium,
    color: COLORS.onSurface,
    paddingHorizontal: SPACING.sm,
    height: '100%',
  },
  chipsStrip: {
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  chip: {
    backgroundColor: COLORS.surfaceContainerHigh,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 9999,
    ...SHADOWS.soft,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.tonalPrimary,
  },
  chipText: {
    ...FONTS.labelLarge,
    color: COLORS.onSurfaceVariant,
  },
  chipTextSelected: {
    color: COLORS.onPrimary,
  },
  bentoSection: {
    gap: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  sectionTitle: {
    ...FONTS.headlineMedium,
    fontSize: 20,
    color: COLORS.onSurface,
  },
  viewCalendarLink: {
    ...FONTS.labelLarge,
    color: COLORS.primary,
  },
  featuredCard: {
    backgroundColor: COLORS.primaryContainer,
    borderRadius: SPACING.sm,
    padding: SPACING.md,
    ...SHADOWS.tonalPrimary,
    minHeight: 180,
    position: 'relative',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  decorIconContainer: {
    position: 'absolute',
    right: -20,
    top: -20,
  },
  decorIcon: {},
  featuredCardHeader: {
    flexDirection: 'row',
  },
  tagBadge: {
    backgroundColor: '#ffffff70',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  tagBadgeText: {
    fontSize: 10,
    fontFamily: 'Quicksand-Bold',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  featuredCardBody: {
    marginVertical: SPACING.sm,
  },
  featuredTitle: {
    ...FONTS.headlineMedium,
    color: COLORS.onPrimaryContainer,
  },
  featuredSubtitle: {
    ...FONTS.bodySmall,
    color: COLORS.onPrimaryFixedVariant,
    marginTop: 4,
  },
  featuredCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featuredTime: {
    ...FONTS.labelMedium,
    color: COLORS.onPrimaryContainer,
  },
  featuredArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
  },
  gridContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  gridCard: {
    flex: 1,
    borderRadius: SPACING.sm,
    padding: SPACING.md,
    ...SHADOWS.soft,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  gridIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridTextContainer: {
    marginVertical: SPACING.sm,
  },
  gridTitle: {
    ...FONTS.labelLarge,
    fontSize: 16,
  },
  gridDesc: {
    ...FONTS.bodySmall,
    marginTop: 2,
  },
  gridTagFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tagLabel: {
    fontSize: 10,
    fontFamily: 'Quicksand-Bold',
  },
  otherNotesSection: {
    gap: SPACING.sm,
  },
  otherNotesList: {
    gap: SPACING.sm,
  },
  emptyCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: SPACING.sm,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
  },
  emptyText: {
    ...FONTS.bodyMedium,
    color: COLORS.outline,
  },
  noteListItem: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.soft,
    borderBottomWidth: 4,
  },
  listItemIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  listItemTextContainer: {
    flex: 1,
  },
  listItemTitle: {
    ...FONTS.labelLarge,
    color: COLORS.onSurface,
  },
  listItemDesc: {
    ...FONTS.bodySmall,
    color: COLORS.outline,
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.tonalPrimary,
    zIndex: 90,
  },
});
