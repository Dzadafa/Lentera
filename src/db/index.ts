import * as SQLite from 'expo-sqlite';
import {
  CREATE_SCREENING_TABLE,
  CREATE_CRISIS_TABLE,
  CREATE_CHECKIN_TABLE,
  CREATE_SETTINGS_TABLE,
  CREATE_WIN_LOG_TABLE,
  CREATE_STORY_LETTER_TABLE,
  CREATE_STORY_SUBMISSION_TABLE,
} from './schema';
import type { CheckIn, CrisisEvent, ScreeningResult } from '../types/domain';
import type { ScreeningTrendPoint } from '../types/screening_trend';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  const db = await SQLite.openDatabaseAsync('tautjiwa.db');
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await db.execAsync(CREATE_SCREENING_TABLE);
  await db.execAsync(CREATE_CRISIS_TABLE);
  await db.execAsync(CREATE_CHECKIN_TABLE);
  await db.execAsync(CREATE_SETTINGS_TABLE);
  await db.execAsync(CREATE_WIN_LOG_TABLE);
  await db.execAsync(CREATE_STORY_LETTER_TABLE);
  await db.execAsync(CREATE_STORY_SUBMISSION_TABLE);

  // Migrasi otomatis untuk database yang sudah dibuat sebelumnya di perangkat pengguna
  try {
    await db.execAsync('ALTER TABLE screening_records ADD COLUMN tiered_json TEXT;');
  } catch {
    // Kolom sudah ada
  }

  dbInstance = db;
  return db;
}

export async function initDatabase(): Promise<void> {
  await getDb();
}

export async function insertScreening(res: ScreeningResult): Promise<void> {
  const db = await getDb();
  // Ensure tiered_json column exists if migrated
  try {
    await db.execAsync('ALTER TABLE screening_records ADD COLUMN tiered_json TEXT;');
  } catch {
    // Column already exists
  }

  await db.runAsync(
    `INSERT INTO screening_records (
      id, created_at, depression_score, depression_severity,
      anxiety_score, anxiety_severity, stress_score, stress_severity,
      tier, crisis_flag, answers_json, tiered_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      res.id,
      res.createdAt,
      res.depression.score,
      res.depression.severity,
      res.anxiety.score,
      res.anxiety.severity,
      res.stress.score,
      res.stress.severity,
      res.tier,
      res.crisisFlag ? 1 : 0,
      JSON.stringify(res.answers),
      res.tiered ? JSON.stringify(res.tiered) : null,
    ]
  );
}

export async function getLatestScreening(): Promise<ScreeningResult | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM screening_records ORDER BY created_at DESC LIMIT 1;'
  );
  if (!row) return null;
  let tieredData = undefined;
  if (row.tiered_json) {
    try {
      tieredData = JSON.parse(row.tiered_json);
    } catch {
      // ignore
    }
  }

  return {
    id: row.id,
    createdAt: row.created_at,
    depression: {
      raw: Math.round(row.depression_score / 2),
      score: row.depression_score,
      severity: row.depression_severity,
    },
    anxiety: {
      raw: Math.round(row.anxiety_score / 2),
      score: row.anxiety_score,
      severity: row.anxiety_severity,
    },
    stress: {
      raw: Math.round(row.stress_score / 2),
      score: row.stress_score,
      severity: row.stress_severity,
    },
    tier: row.tier,
    crisisFlag: Boolean(row.crisis_flag),
    answers: JSON.parse(row.answers_json || '[]'),
    tiered: tieredData,
  };
}

export async function getScreeningById(id: string): Promise<ScreeningResult | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM screening_records WHERE id = ? LIMIT 1;',
    [id]
  );
  if (!row) return null;
  let tieredData = undefined;
  if (row.tiered_json) {
    try {
      tieredData = JSON.parse(row.tiered_json);
    } catch {
      // ignore
    }
  }

  return {
    id: row.id,
    createdAt: row.created_at,
    depression: {
      raw: Math.round(row.depression_score / 2),
      score: row.depression_score,
      severity: row.depression_severity,
    },
    anxiety: {
      raw: Math.round(row.anxiety_score / 2),
      score: row.anxiety_score,
      severity: row.anxiety_severity,
    },
    stress: {
      raw: Math.round(row.stress_score / 2),
      score: row.stress_score,
      severity: row.stress_severity,
    },
    tier: row.tier,
    crisisFlag: Boolean(row.crisis_flag),
    answers: JSON.parse(row.answers_json || '[]'),
    tiered: tieredData,
  };
}

export async function recordCrisisEvent(source: string, actionTaken: string): Promise<void> {
  const db = await getDb();
  const id = `crs_${Date.now()}`;
  await db.runAsync(
    'INSERT INTO crisis_events (id, created_at, source, action_taken) VALUES (?, ?, ?, ?);',
    [id, Date.now(), source, actionTaken]
  );
}

export async function upsertDailyCheckIn(checkin: Omit<CheckIn, 'id' | 'createdAt'>): Promise<void> {
  const db = await getDb();
  const id = `chk_${checkin.date}`;
  const now = Date.now();
  await db.runAsync(
    `INSERT INTO daily_checkins (id, date, mood, energy, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET mood = excluded.mood, energy = excluded.energy, note = excluded.note;`,
    [id, checkin.date, checkin.mood, checkin.energy, checkin.note ?? null, now]
  );
}

export async function getCheckIns(limit: number = 7): Promise<CheckIn[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM daily_checkins ORDER BY date DESC LIMIT ?;',
    [limit]
  );
  return rows.map((r) => ({
    id: r.id,
    date: r.date,
    mood: r.mood,
    energy: r.energy,
    note: r.note,
    createdAt: r.created_at,
  }));
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value;',
    [key, value]
  );
}

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?;',
    [key]
  );
  return row ? row.value : null;
}
/** Log Kemenangan Kecil (J4) — satu baris per hari, disimpan lokal. */
export async function saveWinLog(wins: string[]): Promise<void> {
  const db = await getDb();
  const date = new Date().toISOString().split('T')[0];
  await db.runAsync(
    `INSERT INTO win_logs (id, date, wins_json, created_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET wins_json = excluded.wins_json, created_at = excluded.created_at;`,
    [`win_${date}`, date, JSON.stringify(wins), Date.now()]
  );
}

export async function getWinLog(date?: string): Promise<string[] | null> {
  const db = await getDb();
  const targetDate = date ?? new Date().toISOString().split('T')[0];
  const row = await db.getFirstAsync<{ wins_json: string }>(
    'SELECT wins_json FROM win_logs WHERE date = ?;',
    [targetDate]
  );
  if (!row) return null;
  try {
    const parsed = JSON.parse(row.wins_json);
    return Array.isArray(parsed) ? (parsed as string[]) : null;
  } catch {
    return null;
  }
}

/** Menambahkan satu kemenangan kecil ke daftar hari ini */
export async function recordSmallWin(title: string): Promise<void> {
  const current = (await getWinLog()) ?? [];
  if (!current.includes(title)) {
    const updated = [title, ...current];
    await saveWinLog(updated);
  }
}

/** Mengambil seluruh log kemenangan terurut dari tanggal terbaru */
export async function getAllWinLogs(limitDays = 30): Promise<{ date: string; wins: string[]; createdAt: number }[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ date: string; wins_json: string; created_at: number }>(
    'SELECT date, wins_json, created_at FROM win_logs ORDER BY date DESC LIMIT ?;',
    [limitDays]
  );
  return rows.map((r) => {
    let wins: string[] = [];
    try {
      wins = JSON.parse(r.wins_json);
    } catch {
      wins = [];
    }
    return { date: r.date, wins, createdAt: r.created_at };
  });
}

/** Menghitung rentetan hari berurutan (streak) dari aktivitas check-in dan kemenangan kecil */
export async function calculateStreakDays(): Promise<number> {
  const db = await getDb();
  const checkinRows = await db.getAllAsync<{ date: string }>('SELECT date FROM daily_checkins ORDER BY date DESC;');
  const winRows = await db.getAllAsync<{ date: string }>('SELECT date FROM win_logs ORDER BY date DESC;');

  const activeDates = new Set<string>();
  checkinRows.forEach((r) => activeDates.add(r.date));
  winRows.forEach((r) => activeDates.add(r.date));

  if (activeDates.size === 0) return 0;

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  // Jika hari ini belum ada aktivitas, periksa apakah kemarin ada aktivitas
  const todayStr = cursor.toISOString().split('T')[0];
  if (!activeDates.has(todayStr)) {
    cursor.setDate(cursor.getDate() - 1);
    const yesterdayStr = cursor.toISOString().split('T')[0];
    if (!activeDates.has(yesterdayStr)) {
      return 0; // Streak terputus
    }
  }

  while (true) {
    const dStr = cursor.toISOString().split('T')[0];
    if (activeDates.has(dStr)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export interface StoryLetter {
  id: string;
  body: string;
  createdAt: number;
}

/** Surat untuk diri sendiri di Dinding Cerita (I4) — lokal, bisa dihapus. */
export async function addStoryLetter(body: string): Promise<void> {
  const db = await getDb();
  const id = `ltr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  await db.runAsync('INSERT INTO story_letters (id, body, created_at) VALUES (?, ?, ?);', [
    id,
    body,
    Date.now(),
  ]);
}

export async function getStoryLetters(limit: number = 10): Promise<StoryLetter[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM story_letters ORDER BY created_at DESC LIMIT ?;',
    [limit]
  );
  return rows.map((r) => ({ id: r.id, body: r.body, createdAt: r.created_at }));
}

export async function deleteStoryLetter(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM story_letters WHERE id = ?;', [id]);
}

export async function getScreeningTrend(limit: number = 12): Promise<ScreeningTrendPoint[]> {
  const db = await getDb();
  let rows: any[] = [];
  try {
    rows = await db.getAllAsync<any>(
      'SELECT id, created_at, depression_score, anxiety_score, stress_score, tier, tiered_json FROM screening_records ORDER BY created_at DESC LIMIT ?;',
      [limit]
    );
  } catch {
    try {
      rows = await db.getAllAsync<any>(
        'SELECT id, created_at, depression_score, anxiety_score, stress_score, tier FROM screening_records ORDER BY created_at DESC LIMIT ?;',
        [limit]
      );
    } catch {
      rows = [];
    }
  }
  return rows
    .map((r) => {
      let tiered = undefined;
      if (r.tiered_json) {
        try {
          tiered = JSON.parse(r.tiered_json);
        } catch {
          // ignore
        }
      }
      return {
        id: r.id as string,
        createdAt: r.created_at as number,
        depression: r.depression_score as number,
        anxiety: r.anxiety_score as number,
        stress: r.stress_score as number,
        tier: r.tier as ScreeningTrendPoint['tier'],
        tiered,
      };
    })
    .reverse();
}

/**
 * Menghapus seluruh jejak dan data lokal dari memori perangkat (Privacy Shredder).
 */
export async function clearAllLocalData(): Promise<void> {
  const db = await getDb();
  await db.execAsync('DELETE FROM screening_records;');
  await db.execAsync('DELETE FROM daily_checkins;');
  await db.execAsync('DELETE FROM win_logs;');
  await db.execAsync('DELETE FROM story_letters;');
  await db.execAsync('DELETE FROM story_submissions;');
  await db.execAsync('DELETE FROM crisis_events;');
  await db.execAsync('DELETE FROM settings;');
}

export interface UserStorySubmission {
  id: string;
  author: string;
  category: string;
  felt: string;
  turningPoint: string;
  actionTaken: string;
  resultText: string;
  message: string;
  status: 'pending' | 'approved';
  helpfulCount: number;
  createdAt: number;
}

/** Menyimpan cerita baru kiriman pengguna ke basis data lokal */
export async function insertStorySubmission(data: Omit<UserStorySubmission, 'id' | 'createdAt' | 'status' | 'helpfulCount'>): Promise<UserStorySubmission> {
  const db = await getDb();
  const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const createdAt = Date.now();
  const status = 'pending';
  const helpfulCount = 0;

  await db.runAsync(
    `INSERT INTO story_submissions (
      id, author, category, felt, turning_point, action_taken, result_text, message, status, helpful_count, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      data.author,
      data.category,
      data.felt,
      data.turningPoint,
      data.actionTaken,
      data.resultText,
      data.message,
      status,
      helpfulCount,
      createdAt,
    ]
  );

  return {
    id,
    ...data,
    status,
    helpfulCount,
    createdAt,
  };
}

/** Mengambil seluruh cerita yang pernah dikirimkan oleh pengguna */
export async function getUserStorySubmissions(): Promise<UserStorySubmission[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM story_submissions ORDER BY created_at DESC;'
  );
  return rows.map((r) => ({
    id: r.id,
    author: r.author,
    category: r.category,
    felt: r.felt,
    turningPoint: r.turning_point,
    actionTaken: r.action_taken,
    resultText: r.result_text,
    message: r.message,
    status: r.status,
    helpfulCount: r.helpful_count,
    createdAt: r.created_at,
  }));
}

/** Toggle tombol 'Cerita ini membantuku' */
export async function toggleStoryHelpful(storyId: string): Promise<{ count: number; isHelped: boolean }> {
  const helpfulJson = (await getSetting('story_helpful_reactions')) ?? '{}';
  let helpfulMap: Record<string, boolean> = {};
  try {
    helpfulMap = JSON.parse(helpfulJson);
  } catch {
    helpfulMap = {};
  }

  const currentlyHelped = Boolean(helpfulMap[storyId]);
  const newHelped = !currentlyHelped;
  helpfulMap[storyId] = newHelped;
  await setSetting('story_helpful_reactions', JSON.stringify(helpfulMap));

  // Ambil counter dasar
  const baseCountsJson = (await getSetting('story_helpful_counts')) ?? '{}';
  let countsMap: Record<string, number> = {};
  try {
    countsMap = JSON.parse(baseCountsJson);
  } catch {
    countsMap = {};
  }

  const currentCount = countsMap[storyId] ?? 0;
  const newCount = newHelped ? currentCount + 1 : Math.max(0, currentCount - 1);
  countsMap[storyId] = newCount;
  await setSetting('story_helpful_counts', JSON.stringify(countsMap));

  return { count: newCount, isHelped: newHelped };
}

/** Ambil status reaksi cerita */
export async function getStoryHelpfulStatus(storyId: string, initialBase = 12): Promise<{ count: number; isHelped: boolean }> {
  const helpfulJson = (await getSetting('story_helpful_reactions')) ?? '{}';
  let helpfulMap: Record<string, boolean> = {};
  try {
    helpfulMap = JSON.parse(helpfulJson);
  } catch {
    helpfulMap = {};
  }

  const baseCountsJson = (await getSetting('story_helpful_counts')) ?? '{}';
  let countsMap: Record<string, number> = {};
  try {
    countsMap = JSON.parse(baseCountsJson);
  } catch {
    countsMap = {};
  }

  const isHelped = Boolean(helpfulMap[storyId]);
  const count = countsMap[storyId] !== undefined ? countsMap[storyId] : initialBase;
  return { count, isHelped };
}

/** Sembunyikan cerita yang dilaporkan */
export async function hideReportedStory(storyId: string): Promise<void> {
  const hiddenJson = (await getSetting('hidden_story_ids')) ?? '[]';
  let hiddenList: string[] = [];
  try {
    hiddenList = JSON.parse(hiddenJson);
  } catch {
    hiddenList = [];
  }
  if (!hiddenList.includes(storyId)) {
    hiddenList.push(storyId);
    await setSetting('hidden_story_ids', JSON.stringify(hiddenList));
  }
}

/** Mengambil daftar ID cerita yang disembunyikan */
export async function getHiddenStoryIds(): Promise<string[]> {
  const hiddenJson = (await getSetting('hidden_story_ids')) ?? '[]';
  try {
    const list = JSON.parse(hiddenJson);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/** ID Anonim unik perangkat untuk sesi konseling anonim */
export async function getOrCreateAnonymousUserId(): Promise<string> {
  const existingId = await getSetting('anonymous_user_id');
  if (existingId) return existingId;
  const newId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  await setSetting('anonymous_user_id', newId);
  return newId;
}
