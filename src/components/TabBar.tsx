import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { COLORS, FONTS, SHADOWS, SPACING } from '../config/theme';
import { BouncyPressable } from './BouncyPressable';
import { MaterialIcons } from '@expo/vector-icons';

interface TabBarProps {
  activeTab: number;
  setActiveTab: (index: number) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { label: 'Home', icon: 'dashboard', iconActive: 'dashboard' },
    { label: 'Calendar', icon: 'calendar-month', iconActive: 'calendar-month' },
    { label: 'Notes', icon: 'sticky-note-2', iconActive: 'sticky-note-2' },
    { label: 'Tasks', icon: 'check-circle-outline', iconActive: 'check-circle' },
    { label: 'Settings', icon: 'person-outline', iconActive: 'person' },
  ];

  return (
    <View style={styles.navBar}>
      {tabs.map((tab, idx) => {
        const isActive = activeTab === idx;
        
        // Custom theme color based on index to mix it up
        const activeBg = idx % 2 === 0 ? COLORS.secondaryContainer : COLORS.primaryContainer;
        const activeText = idx % 2 === 0 ? COLORS.onSecondaryContainer : COLORS.onPrimaryContainer;
        const activeIconColor = idx % 2 === 0 ? COLORS.secondary : COLORS.primary;

        return (
          <BouncyPressable
            key={tab.label}
            onPress={() => setActiveTab(idx)}
            style={styles.tabBtnWrapper}
          >
            <View
              style={[
                styles.tabBtn,
                isActive && [styles.tabBtnActive, { backgroundColor: activeBg }],
              ]}
            >
              <MaterialIcons
                name={(isActive ? tab.iconActive : tab.icon) as any}
                size={isActive ? 20 : 22}
                color={isActive ? activeIconColor : COLORS.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.tabLabel,
                  isActive ? [styles.tabLabelActive, { color: activeText }] : { color: COLORS.onSurfaceVariant },
                ]}
              >
                {tab.label}
              </Text>
            </View>
          </BouncyPressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.sm, // Safe area padding for iOS
    borderTopLeftRadius: SPACING.sm,
    borderTopRightRadius: SPACING.sm,
    ...SHADOWS.ambient,
    zIndex: 100,
  },
  tabBtnWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtn: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 20,
    width: '100%',
    maxWidth: 72,
  },
  tabBtnActive: {
    flexDirection: 'column',
    paddingVertical: 6,
    paddingHorizontal: 12,
    ...SHADOWS.soft,
  },
  tabLabel: {
    ...FONTS.labelMedium,
    fontSize: 10,
    marginTop: 3,
    textAlign: 'center',
  },
  tabLabelActive: {
    fontFamily: 'Quicksand-Bold',
  },
});
