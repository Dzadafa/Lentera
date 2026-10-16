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
  clearAllLocalData,
  recordSmallWin,
  calculateStreakDays,
} from '../db';
import { calculateTieredScreening } from '../services/scoring';
import { haptics } from '../services/haptics';
import { speech } from '../services/speech';
import { ambient } from '../services/ambientAudio';
import { reminders } from '../services/reminders';

export type FontScale = 'small' | 'medium' | 'large';
export type QuickCloseTarget = 'stealth' | 'google' | 'wikipedia';

interface AppState {
  isInitialized: boolean;
  workMode: boolean;
  hapticsEnabled: boolean;
  voiceGuide: boolean;
  ambientEnabled: boolean;
  nightlyReminder: boolean;
  fontScale: FontScale;
  quickCloseTarget: QuickCloseTarget;
  latestScreening: ScreeningResult | null;
  recentCheckIns: CheckIn[];
  streakCount: number;
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
  setFontScale: (scale: FontScale) => Promise<void>;
  setQuickCloseTarget: (target: QuickCloseTarget) => Promise<void>;
  logWin: (title: string) => Promise<void>;
  refreshStreak: () => Promise<void>;
  resetAllData: () => Promise<void>;
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
  fontScale: 'medium',
  quickCloseTarget: 'stealth',
  latestScreening: null,
  recentCheckIns: [],
  streakCount: 0,
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

    const fs = await getSetting('font_scale');
    const qc = await getSetting('quick_close_target');
    const fontScale: FontScale = fs === 'small' || fs === 'large' ? fs : 'medium';
    const quickCloseTarget: QuickCloseTarget =
      qc === 'google' || qc === 'wikipedia' ? qc : 'stealth';

    const latest = await getLatestScreening();
    const checks = await getCheckIns(365);
    const streak = await calculateStreakDays();

    set({
      isInitialized: true,
      hasSeenSplash: ss === 'true',
      workMode: isWorkMode,
      hapticsEnabled: isHaptics,
      voiceGuide: isVoiceGuide,
      ambientEnabled: isAmbient,
      nightlyReminder: nr === 'true',
      fontScale,
      quickCloseTarget,
      latestScreening: latest,
      recentCheckIns: checks,
      streakCount: streak,
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
    await recordSmallWin('Menyelesaikan skrining kondisi pikiran');
    const streak = await calculateStreakDays();
    set({ latestScreening: result, answers: {}, currentQuestionIndex: 0, streakCount: streak });
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
    await recordSmallWin('Mencatat energi & suasana hati hari ini');
    const checks = await getCheckIns(365);
    const streak = await calculateStreakDays();
    set({ recentCheckIns: checks, streakCount: streak });
    haptics.success();
  },

  logWin: async (title: string) => {
    await recordSmallWin(title);
    const streak = await calculateStreakDays();
    set({ streakCount: streak });
    haptics.success();
  },

  refreshStreak: async () => {
    const streak = await calculateStreakDays();
    set({ streakCount: streak });
  },

  setFontScale: async (scale: FontScale) => {
    await setSetting('font_scale', scale);
    set({ fontScale: scale });
  },

  setQuickCloseTarget: async (target: QuickCloseTarget) => {
    await setSetting('quick_close_target', target);
    set({ quickCloseTarget: target });
  },

  resetAllData: async () => {
    await reminders.cancelNightly();
    ambient.stop();
    await clearAllLocalData();
    set({
      workMode: false,
      hapticsEnabled: true,
      voiceGuide: false,
      ambientEnabled: false,
      nightlyReminder: false,
      fontScale: 'medium',
      quickCloseTarget: 'stealth',
      latestScreening: null,
      recentCheckIns: [],
      streakCount: 0,
      hasSeenSplash: false,
      answers: {},
      currentQuestionIndex: 0,
    });
  },
}));
