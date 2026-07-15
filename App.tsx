import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  } as any),
});
import { useFonts } from 'expo-font';
import {
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from '@expo-google-fonts/quicksand';
import {
  NunitoSans_400Regular,
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
} from '@expo-google-fonts/nunito-sans';

import { COLORS } from './src/config/theme';
import { AppDbProvider, useAppDb } from './src/context/AppDbContext';
import { TabBar } from './src/components/TabBar';

// Screens
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { NotesScreen } from './src/screens/NotesScreen';
import { NoteDetailScreen } from './src/screens/NoteDetailScreen';
import { TasksScreen } from './src/screens/TasksScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

function MainApp() {
  const { db, loading: dbLoading } = useAppDb();
  
  // Navigation State
  // Boot directly to main application, skipping login/onboarding
  const [flowState, setFlowState] = useState<'onboarding' | 'login' | 'app'>('app');
  
  // Tab Bar navigation state:
  // 0: Home, 1: Calendar, 2: Notes, 3: Tasks, 4: Settings
  const [activeTab, setActiveTab] = useState<number>(0);
  
  // Sub-navigation for Note Detail:
  // undefined = showing tabs, null = creating new note, string = editing note ID
  const [activeNoteId, setActiveNoteId] = useState<string | null | undefined>(undefined);

  if (dbLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // --- NAVIGATION SWITCH ROUTER ---

  // Onboarding Flow
  if (flowState === 'onboarding') {
    return (
      <WelcomeScreen
        onStart={() => setFlowState('app')} // Starts directly as guest / Sunshine default
        onLogin={() => setFlowState('login')}
      />
    );
  }

  // Login Form Screen
  if (flowState === 'login') {
    return (
      <LoginScreen
        onLoginSuccess={() => setFlowState('app')}
        onBack={() => setFlowState('onboarding')}
      />
    );
  }

  // Note Detail Screen (takes precedence over general tabs when a note is active)
  if (activeNoteId !== undefined) {
    return (
      <NoteDetailScreen
        noteId={activeNoteId}
        onBack={() => setActiveNoteId(undefined)}
      />
    );
  }

  // General Application Tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <DashboardScreen onNavigateToTab={(tabIdx) => setActiveTab(tabIdx)} />;
      case 1:
        return <CalendarScreen />;
      case 2:
        return (
          <NotesScreen
            onSelectNote={(noteId) => setActiveNoteId(noteId)}
            onNavigateToTab={(tabIdx) => setActiveTab(tabIdx)}
          />
        );
      case 3:
        return <TasksScreen />;
      case 4:
        return <SettingsScreen onLogout={() => setFlowState('onboarding')} />;
      default:
        return <DashboardScreen onNavigateToTab={(tabIdx) => setActiveTab(tabIdx)} />;
    }
  };

  return (
    <View style={styles.appContainer}>
      {/* Current Screen Content */}
      <View style={styles.screenWrapper}>{renderTabContent()}</View>

      {/* Persistent Custom Tab Bar */}
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'Quicksand-Medium': Quicksand_500Medium,
    'Quicksand-SemiBold': Quicksand_600SemiBold,
    'Quicksand-Bold': Quicksand_700Bold,
    'NunitoSans-Regular': NunitoSans_400Regular,
    'NunitoSans-SemiBold': NunitoSans_600SemiBold,
    'NunitoSans-Bold': NunitoSans_700Bold,
  });

  useEffect(() => {
    async function requestPermissions() {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
      }
    }
    requestPermissions();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <AppDbProvider>
      <View style={styles.appWrapper}>
        <MainApp />
        <StatusBar style="auto" />
      </View>
    </AppDbProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appWrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  appContainer: {
    flex: 1,
    position: 'relative',
  },
  screenWrapper: {
    flex: 1,
  },
});
