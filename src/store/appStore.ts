import { create } from 'zustand';
import type { CheckIn, ScreeningResult } from '../types/domain';
import {
  initDatabase,
  getLatestScreening,
  insertScreening,
  getCheckIns,
  upsertDailyCheckIn,
  getSetting,
  setSetting,
  recordCrisisEvent,
} from '../db';
import { calculateTieredScreening } from '../services/scoring';
import { haptics } from '../services/haptics';
import { speech } from '../services/speech';
import { ambient } from '../services/ambientAudio';
import { reminders } from '../services/reminders';

interface AppState {
  isInitialized: boolean;
  workMode: boolean;
  hapticsEnabled: boolean;
  voiceGuide: boolean;
  ambientEnabled: boolean;
  nightlyReminder: boolean;
  latestScreening: ScreeningResult | null;
  recentCheckIns: CheckIn[];
  isCrisisModalVisible: boolean;
  crisisSource: string;

  // Quiz state
  currentQuestionIndex: number;
  answers: Record<string, number>;

  hasSeenSplash: boolean;

  // Actions
  initialize: () => Promise<void>;
  markSplashSeen: () => Promise<void>;
  toggleWorkMode: () => Promise<void>;
  toggleHaptics: () => Promise<void>;
  toggleVoiceGuide: () => Promise<void>;
  toggleAmbient: () => Promise<void>;
  toggleNightlyReminder: () => Promise<void>;
  openCrisisModal: (source?: string) => void;
  closeCrisisModal: () => void;
  recordCrisisDial: () => Promise<void>;

  // Quiz actions
  answerQuestion: (itemId: string, value: number) => void;
  resetQuiz: () => void;
  submitTieredQuiz: (
    k10Answers: Record<string, number>,
    phq9Answers?: Record<string, number>,
    gad7Answers?: Record<string, number>,
    crisisAnsweredYes?: boolean
  ) => Promise<ScreeningResult>;

  // CheckIn actions
  saveTodayCheckIn: (mood: number, energy: number, note?: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  isInitialized: false,
  workMode: false,
  hapticsEnabled: true,
  voiceGuide: false,
  ambientEnabled: false,
  nightlyReminder: false,
  latestScreening: null,
  recentCheckIns: [],
  isCrisisModalVisible: false,
  crisisSource: 'manual',
  currentQuestionIndex: 0,
  answers: {},
  hasSeenSplash: false,

  initialize: async () => {
    await initDatabase();
    const wm = await getSetting('work_mode');
    const hp = await getSetting('haptics_enabled');
    const vg = await getSetting('voice_guide');
    const ss = await getSetting('has_seen_splash');
    const isWorkMode = wm === 'true';
    const isHaptics = hp !== 'false';
    const isVoiceGuide = vg === 'true';
    haptics.setEnabled(isHaptics);
    speech.setEnabled(isVoiceGuide);

    const ab = await getSetting('ambient_enabled');
    const nr = await getSetting('nightly_reminder');
    const isAmbient = ab === 'true';
    ambient.setEnabled(isAmbient);

    const latest = await getLatestScreening();
    const checks = await getCheckIns(365);

    set({
      isInitialized: true,
      hasSeenSplash: ss === 'true',
      workMode: isWorkMode,
      hapticsEnabled: isHaptics,
      voiceGuide: isVoiceGuide,
      ambientEnabled: isAmbient,
      nightlyReminder: nr === 'true',
      latestScreening: latest,
      recentCheckIns: checks,
    });
  },

  markSplashSeen: async () => {
    await setSetting('has_seen_splash', 'true');
    set({ hasSeenSplash: true });
  },

  toggleWorkMode: async () => {
    const next = !get().workMode;
    await setSetting('work_mode', String(next));
    set({ workMode: next });
  },

  toggleVoiceGuide: async () => {
    const next = !get().voiceGuide;
    await setSetting('voice_guide', String(next));
    speech.setEnabled(next);
    set({ voiceGuide: next });
    if (next) {
      void speech.speak('Panduan suara aktif. Aku akan membacakan setiap langkah latihanmu.');
    }
  },

  toggleHaptics: async () => {
    const next = !get().hapticsEnabled;
    await setSetting('haptics_enabled', String(next));
    haptics.setEnabled(next);
    set({ hapticsEnabled: next });
  },

  openCrisisModal: (source = 'manual') => {
    haptics.alert();
    set({ isCrisisModalVisible: true, crisisSource: source });
  },

  closeCrisisModal: () => {
    set({ isCrisisModalVisible: false });
  },

  recordCrisisDial: async () => {
    await recordCrisisEvent(get().crisisSource, 'dial_119_ext_8');
  },

  answerQuestion: (itemId, value) => {
    haptics.tap();
    set((state) => ({
      answers: { ...state.answers, [itemId]: value },
    }));
  },

  resetQuiz: () => {
    set({ currentQuestionIndex: 0, answers: {} });
  },

  submitTieredQuiz: async (
    k10Answers: Record<string, number>,
    phq9Answers: Record<string, number> = {},
    gad7Answers: Record<string, number> = {},
    crisisAnsweredYes = false
  ) => {
    const result = calculateTieredScreening(k10Answers, phq9Answers, gad7Answers, crisisAnsweredYes);
    await insertScreening(result);
    set({ latestScreening: result, answers: {}, currentQuestionIndex: 0 });
    return result;
  },

  toggleAmbient: async () => {
    const next = !get().ambientEnabled;
    await setSetting('ambient_enabled', String(next));
    ambient.setEnabled(next);
    if (!next) ambient.stop();
    set({ ambientEnabled: next });
  },

  toggleNightlyReminder: async () => {
    const next = !get().nightlyReminder;
    if (next) {
      const id = await reminders.scheduleNightly();
      if (!id) {
        // Izin ditolak atau notifikasi tidak didukung: kembalikan sakelar.
        await setSetting('nightly_reminder', 'false');
        set({ nightlyReminder: false });
        return;
      }
      await setSetting('nightly_reminder', 'true');
      set({ nightlyReminder: true });
      return;
    }
    await reminders.cancelNightly();
    await setSetting('nightly_reminder', 'false');
    set({ nightlyReminder: false });
  },

  saveTodayCheckIn: async (mood, energy, note = '') => {
    const today = new Date().toISOString().split('T')[0];
    await upsertDailyCheckIn({ date: today, mood, energy, note });
    const checks = await getCheckIns(365);
    set({ recentCheckIns: checks });
    haptics.success();
  },
}));
