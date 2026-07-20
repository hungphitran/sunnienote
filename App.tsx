import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Platform } from 'react-native';
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

const VAPID_PUBLIC_KEY = 'BIrUiRolvPe5JpsBnlLnhz_tR7wk95zw_axWnsAm7ddVPJD9njR9Uj0sjVdXzKOlwWXN1ge2aj3rliYz6Z44-MQ';

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

function MainApp() {
  const { db, loading: dbLoading, updateUserSettings } = useAppDb();
  
  // Navigation State
  // Boot directly to main application, skipping login/onboarding
  const [flowState, setFlowState] = useState<'onboarding' | 'login' | 'app'>('app');
  
  // Tab Bar navigation state:
  // 0: Home, 1: Calendar, 2: Notes, 3: Tasks, 4: Settings
  const [activeTab, setActiveTab] = useState<number>(0);
  
  // Sub-navigation for Note Detail:
  // undefined = showing tabs, null = creating new note, string = editing note ID
  const [activeNoteId, setActiveNoteId] = useState<string | null | undefined>(undefined);

  // Auto-check and register device token if permission is granted but token is missing
  useEffect(() => {
    if (dbLoading || flowState !== 'app' || db.settings.pushToken) return;

    const autoCheckAndRegisterPushToken = async () => {
      const isNotificationSupported = Platform.OS !== 'web' || (typeof window !== 'undefined' && 'Notification' in window);
      if (!isNotificationSupported) return;

      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        if (existingStatus !== 'granted') return;

        console.log('Notification permission is already granted, but pushToken is missing. Registering now...');

        if (Platform.OS === 'web') {
          if ('serviceWorker' in navigator && 'PushManager' in window) {
            let registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
              registration = await navigator.serviceWorker.register('/sw.js');
            }
            await navigator.serviceWorker.ready;

            let subscription = await registration.pushManager.getSubscription();
            if (!subscription) {
              const subscribeOptions = {
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
              };
              subscription = await registration.pushManager.subscribe(subscribeOptions);
              
              // Register with backend
              await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscription),
              });
            }

            if (subscription && subscription.endpoint) {
              updateUserSettings({ pushToken: subscription.endpoint });
              console.log('Auto-registered web push token:', subscription.endpoint);
            }
          }
        } else {
          const projectId = '211455b2-e8f6-4c2f-9f59-aeade1898efe';
          const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
          const token = tokenData.data;
          if (token) {
            updateUserSettings({ pushToken: token });
            console.log('Auto-registered native push token:', token);
          }
        }
      } catch (err) {
        console.log('Auto-registration of push token failed:', err);
      }
    };

    autoCheckAndRegisterPushToken();
  }, [dbLoading, flowState, db.settings.pushToken]);

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
      const isNotificationSupported = Platform.OS !== 'web' || (typeof window !== 'undefined' && 'Notification' in window);
      if (!isNotificationSupported) return;

      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          console.log('Notification permissions not granted');
        }
      } catch (err) {
        console.log('Notification permissions request failed:', err);
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
