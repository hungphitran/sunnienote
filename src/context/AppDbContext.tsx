import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

// --- TYPES ---
export interface Task {
  id: string;
  text: string;
  category: 'Self Care' | 'Projects' | 'Home';
  completed: boolean;
  date: string; // YYYY-MM-DD
}

export interface Event {
  id: string;
  title: string;
  category: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:00 AM - 11:00 AM" or "2:30 PM"
  location?: string;
  isUrgent?: boolean;
  alarmActive?: boolean;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Note {
  id: string;
  title: string;
  date: string; // DD Tháng MM, YYYY
  content: string;
  category: 'Important' | 'Personal' | 'Social' | 'General';
  checklist?: ChecklistItem[];
}

export interface MoodLog {
  id: string;
  date: string; // YYYY-MM-DD
  mood: string; // 😊, ✨, 🌸, ☕, 📝
}

export interface WaterLog {
  date: string; // YYYY-MM-DD
  amount: number; // in ml
}

export interface UserSettings {
  theme: 'light' | 'dark';
  waterReminder: boolean;
  meetingsReminder: boolean;
  currentUser: {
    name: string;
    email: string;
  } | null;
}

interface AppDatabase {
  tasks: Task[];
  events: Event[];
  notes: Note[];
  moodHistory: MoodLog[];
  waterHistory: WaterLog[];
  settings: UserSettings;
}

interface AppDbContextType {
  db: AppDatabase;
  loading: boolean;
  // Tasks Actions
  addTask: (text: string, category: Task['category']) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  // Events Actions
  addEvent: (event: Omit<Event, 'id'>) => void;
  toggleAlarm: (id: string) => void;
  deleteEvent: (id: string) => void;
  // Notes Actions
  addNote: (note: Omit<Note, 'id' | 'date'>) => void;
  updateNote: (id: string, updatedFields: Partial<Omit<Note, 'id'>>) => void;
  deleteNote: (id: string) => void;
  // Water Actions
  addWater: (amount: number) => void;
  resetWater: () => void;
  // Mood Actions
  logMood: (mood: string) => void;
  // Settings / Storage Actions
  updateUserSettings: (settings: Partial<UserSettings>) => void;
  factoryReset: () => Promise<void>;
  pruneOldData: () => void;
  exportDatabase: () => Promise<void>;
  importDatabase: (importedJson: string) => Promise<boolean>;
  getDbSize: () => number;
}

const STORAGE_KEY = '@sunnie_db_v1';

// --- MOCK INITIAL DATA ---
const getTodayDateString = () => {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

const initialMockDb: AppDatabase = {
  tasks: [],
  events: [],
  notes: [],
  moodHistory: [],
  waterHistory: [],
  settings: {
    theme: 'light',
    waterReminder: true,
    meetingsReminder: false,
    currentUser: {
      name: 'Sunshine',
      email: 'sunshine.hello@example.com'
    }
  }
};

const AppDbContext = createContext<AppDbContextType | undefined>(undefined);

export const AppDbProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<AppDatabase>(initialMockDb);
  const [loading, setLoading] = useState<boolean>(true);

  // Load database from AsyncStorage on mount
  useEffect(() => {
    const initializeDb = async () => {
      try {
        const storedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedData) {
          const parsed = JSON.parse(storedData) as AppDatabase;
          
          // Ensure we merge keys if structure changed in updates
          const merged: AppDatabase = {
            tasks: parsed.tasks || [],
            events: parsed.events || [],
            notes: parsed.notes || [],
            moodHistory: parsed.moodHistory || [],
            waterHistory: parsed.waterHistory || [],
            settings: { ...initialMockDb.settings, ...(parsed.settings || {}) }
          };

          // Run automated pruning on start
          const today = getTodayDateString();
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const limitTime = thirtyDaysAgo.getTime();

          // 1. Prune tasks that are completed and older than 30 days
          merged.tasks = merged.tasks.filter(task => {
            if (!task.completed) return true;
            const taskTime = new Date(task.date).getTime();
            return taskTime >= limitTime;
          });

          // 2. Prune mood entries older than 30 days
          merged.moodHistory = merged.moodHistory.filter(mood => {
            const moodTime = new Date(mood.date).getTime();
            return moodTime >= limitTime;
          });

          // 3. Prune water log entries older than 30 days
          merged.waterHistory = merged.waterHistory.filter(water => {
            const waterTime = new Date(water.date).getTime();
            return waterTime >= limitTime;
          });

          setDb(merged);
          // Save pruned db back
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } else {
          // Store initial mock data on first load
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockDb));
          setDb(initialMockDb);
        }
      } catch (e) {
        console.error('Failed to initialize local storage', e);
      } finally {
        setLoading(false);
      }
    };

    initializeDb();
  }, []);

  // Save database helper
  const saveDb = async (newDb: AppDatabase) => {
    try {
      setDb(newDb);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newDb));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  };

  // --- ACTIONS ---

  // Tasks
  const addTask = (text: string, category: Task['category']) => {
    const newTask: Task = {
      id: 'task_' + Date.now(),
      text,
      category,
      completed: false,
      date: getTodayDateString(),
    };
    saveDb({ ...db, tasks: [newTask, ...db.tasks] });
  };

  const toggleTask = (id: string) => {
    const updatedTasks = db.tasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveDb({ ...db, tasks: updatedTasks });
  };

  const deleteTask = (id: string) => {
    const filtered = db.tasks.filter(t => t.id !== id);
    saveDb({ ...db, tasks: filtered });
  };

  // Events
  const addEvent = (eventData: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...eventData,
      id: 'event_' + Date.now(),
    };
    saveDb({ ...db, events: [...db.events, newEvent] });
  };

  const toggleAlarm = (id: string) => {
    const updated = db.events.map(e =>
      e.id === id ? { ...e, alarmActive: !e.alarmActive } : e
    );
    saveDb({ ...db, events: updated });
  };

  const deleteEvent = (id: string) => {
    const filtered = db.events.filter(e => e.id !== id);
    saveDb({ ...db, events: filtered });
  };

  // Notes
  const addNote = (noteData: Omit<Note, 'id' | 'date'>) => {
    const formatNotesDate = () => {
      const months = [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
      ];
      const d = new Date();
      return `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
    };

    const newNote: Note = {
      ...noteData,
      id: 'note_' + Date.now(),
      date: formatNotesDate(),
    };
    saveDb({ ...db, notes: [newNote, ...db.notes] });
  };

  const updateNote = (id: string, updatedFields: Partial<Omit<Note, 'id'>>) => {
    const updated = db.notes.map(n =>
      n.id === id ? { ...n, ...updatedFields } : n
    );
    saveDb({ ...db, notes: updated });
  };

  const deleteNote = (id: string) => {
    const filtered = db.notes.filter(n => n.id !== id);
    saveDb({ ...db, notes: filtered });
  };

  // Water Tracker
  const addWater = (amount: number) => {
    const today = getTodayDateString();
    let updatedHistory = [...db.waterHistory];
    const todayIndex = updatedHistory.findIndex(h => h.date === today);

    if (todayIndex >= 0) {
      updatedHistory[todayIndex] = {
        ...updatedHistory[todayIndex],
        amount: Math.max(0, updatedHistory[todayIndex].amount + amount),
      };
    } else {
      updatedHistory.push({ date: today, amount: Math.max(0, amount) });
    }

    saveDb({ ...db, waterHistory: updatedHistory });
  };

  const resetWater = () => {
    const today = getTodayDateString();
    const updatedHistory = db.waterHistory.map(h =>
      h.date === today ? { ...h, amount: 0 } : h
    );
    saveDb({ ...db, waterHistory: updatedHistory });
  };

  // Mood Tracker
  const logMood = (mood: string) => {
    const today = getTodayDateString();
    // Keep only one mood entry per day, overwrite if already exists today
    const filteredMoods = db.moodHistory.filter(m => m.date !== today);
    const newMoodLog: MoodLog = {
      id: 'mood_' + Date.now(),
      date: today,
      mood,
    };
    saveDb({ ...db, moodHistory: [...filteredMoods, newMoodLog] });
  };

  // Settings
  const updateUserSettings = (updatedSettings: Partial<UserSettings>) => {
    const newSettings = { ...db.settings, ...updatedSettings };
    saveDb({ ...db, settings: newSettings });
  };

  // Factory Reset
  const factoryReset = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setDb(initialMockDb);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockDb));
  };

  // Manual Pruning of older data
  const pruneOldData = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const limitTime = thirtyDaysAgo.getTime();

    const prunedTasks = db.tasks.filter(task => {
      if (!task.completed) return true;
      return new Date(task.date).getTime() >= limitTime;
    });

    const prunedMood = db.moodHistory.filter(mood =>
      new Date(mood.date).getTime() >= limitTime
    );

    const prunedWater = db.waterHistory.filter(water =>
      new Date(water.date).getTime() >= limitTime
    );

    saveDb({
      ...db,
      tasks: prunedTasks,
      moodHistory: prunedMood,
      waterHistory: prunedWater
    });
  };

  // Export DB as Local JSON file
  const exportDatabase = async () => {
    try {
      const dbString = JSON.stringify(db, null, 2);
      const fileUri = FileSystem.documentDirectory + 'sunnie_backup.json';
      await FileSystem.writeAsStringAsync(fileUri, dbString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Sao lưu dữ liệu Sunnie',
          UTI: 'public.json',
        });
      } else {
        console.warn('Sharing is not available on this platform');
      }
    } catch (e) {
      console.error('Failed to export database', e);
    }
  };

  // Import DB from JSON String
  const importDatabase = async (importedJson: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(importedJson) as AppDatabase;

      // Schema verification check
      if (
        Array.isArray(parsed.tasks) &&
        Array.isArray(parsed.events) &&
        Array.isArray(parsed.notes) &&
        Array.isArray(parsed.moodHistory) &&
        Array.isArray(parsed.waterHistory) &&
        parsed.settings
      ) {
        await saveDb(parsed);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to import database, invalid JSON structure', e);
      return false;
    }
  };

  // Calculate size in Bytes of the database
  const getDbSize = () => {
    try {
      const str = JSON.stringify(db);
      // Byte length calculation in React Native UTF-8
      return encodeURIComponent(str).replace(/%[0-9A-F]{2}/g, 'a').length;
    } catch (e) {
      return 0;
    }
  };

  return (
    <AppDbContext.Provider
      value={{
        db,
        loading,
        addTask,
        toggleTask,
        deleteTask,
        addEvent,
        toggleAlarm,
        deleteEvent,
        addNote,
        updateNote,
        deleteNote,
        addWater,
        resetWater,
        logMood,
        updateUserSettings,
        factoryReset,
        pruneOldData,
        exportDatabase,
        importDatabase,
        getDbSize,
      }}
    >
      {children}
    </AppDbContext.Provider>
  );
};

export const useAppDb = () => {
  const context = useContext(AppDbContext);
  if (context === undefined) {
    throw new Error('useAppDb must be used within an AppDbProvider');
  }
  return context;
};
