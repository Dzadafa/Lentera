export const CREATE_SCREENING_TABLE = `
CREATE TABLE IF NOT EXISTS screening_records (
  id TEXT PRIMARY KEY NOT NULL,
  created_at INTEGER NOT NULL,
  depression_score INTEGER NOT NULL,
  depression_severity TEXT NOT NULL,
  anxiety_score INTEGER NOT NULL,
  anxiety_severity TEXT NOT NULL,
  stress_score INTEGER NOT NULL,
  stress_severity TEXT NOT NULL,
  tier TEXT NOT NULL,
  crisis_flag INTEGER NOT NULL,
  answers_json TEXT NOT NULL
);
`;

export const CREATE_CRISIS_TABLE = `
CREATE TABLE IF NOT EXISTS crisis_events (
  id TEXT PRIMARY KEY NOT NULL,
  created_at INTEGER NOT NULL,
  source TEXT NOT NULL,
  action_taken TEXT NOT NULL
);
`;

export const CREATE_CHECKIN_TABLE = `
CREATE TABLE IF NOT EXISTS daily_checkins (
  id TEXT PRIMARY KEY NOT NULL,
  date TEXT UNIQUE NOT NULL,
  mood INTEGER NOT NULL,
  energy INTEGER NOT NULL,
  note TEXT,
  created_at INTEGER NOT NULL
);
`;

export const CREATE_SETTINGS_TABLE = `
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);
`;
