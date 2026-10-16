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
  answers_json TEXT NOT NULL,
  tiered_json TEXT
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
export const CREATE_WIN_LOG_TABLE = `
CREATE TABLE IF NOT EXISTS win_logs (
  id TEXT PRIMARY KEY NOT NULL,
  date TEXT UNIQUE NOT NULL,
  wins_json TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
`;

export const CREATE_STORY_LETTER_TABLE = `
CREATE TABLE IF NOT EXISTS story_letters (
  id TEXT PRIMARY KEY NOT NULL,
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
`;

export const CREATE_STORY_SUBMISSION_TABLE = `
CREATE TABLE IF NOT EXISTS story_submissions (
  id TEXT PRIMARY KEY NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  felt TEXT NOT NULL,
  turning_point TEXT NOT NULL,
  action_taken TEXT NOT NULL,
  result_text TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL,
  helpful_count INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);
`;
