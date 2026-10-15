import * as SQLite from 'expo-sqlite';
import {
  CREATE_SCREENING_TABLE,
  CREATE_CRISIS_TABLE,
  CREATE_CHECKIN_TABLE,
  CREATE_SETTINGS_TABLE,
  CREATE_WIN_LOG_TABLE,
  CREATE_STORY_LETTER_TABLE,
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

export async function getWinLog(): Promise<string[] | null> {
  const db = await getDb();
  const today = new Date().toISOString().split('T')[0];
  const row = await db.getFirstAsync<{ wins_json: string }>(
    'SELECT wins_json FROM win_logs WHERE date = ?;',
    [today]
  );
  if (!row) return null;
  try {
    const parsed = JSON.parse(row.wins_json);
    return Array.isArray(parsed) ? (parsed as string[]) : null;
  } catch {
    return null;
  }
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
  const rows = await db.getAllAsync<any>(
    'SELECT id, created_at, depression_score, anxiety_score, stress_score, tier, tiered_json FROM screening_records ORDER BY created_at DESC LIMIT ?;',
    [limit]
  );
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
