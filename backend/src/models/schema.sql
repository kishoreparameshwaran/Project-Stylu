-- StylU / Outfit Court Database Schema
-- SQLite with upgrade path to PostgreSQL

-- Users table (guest-first, upgradeable to full accounts)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    handle TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    google_id TEXT UNIQUE,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    settings_json TEXT DEFAULT '{}',
    is_guest INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_users_handle ON users(handle);
CREATE INDEX idx_users_email ON users(email);

-- Judges (the 5 AI personalities)
CREATE TABLE IF NOT EXISTS judges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    channel_no INTEGER NOT NULL,
    name TEXT NOT NULL,
    persona_prompt TEXT NOT NULL,
    severity INTEGER NOT NULL DEFAULT 5,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_judges_slug ON judges(slug);

-- Trials (outfit submissions and verdicts)
CREATE TABLE IF NOT EXISTS trials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_no TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    judge_id INTEGER NOT NULL,
    tier TEXT NOT NULL DEFAULT 'standard',
    image_path TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
    score_10 REAL,
    drip_pct INTEGER,
    title TEXT,
    verdict_json TEXT,
    appeal_of INTEGER,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    deleted_at INTEGER,
    share_allowed INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (judge_id) REFERENCES judges(id),
    FOREIGN KEY (appeal_of) REFERENCES trials(id)
);

CREATE INDEX idx_trials_user ON trials(user_id);
CREATE INDEX idx_trials_case_no ON trials(case_no);
CREATE INDEX idx_trials_status ON trials(status);
CREATE INDEX idx_trials_created ON trials(created_at);

-- Trial Votes (jury system)
CREATE TABLE IF NOT EXISTS trial_votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trial_id INTEGER NOT NULL,
    voter_id INTEGER NOT NULL,
    vote TEXT NOT NULL CHECK(vote IN ('GUILTY', 'NOT_GUILTY')),
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (trial_id) REFERENCES trials(id) ON DELETE CASCADE,
    FOREIGN KEY (voter_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(trial_id, voter_id)
);

CREATE INDEX idx_votes_trial ON trial_votes(trial_id);

-- Dress Codes (7-day wheel seeds)
CREATE TABLE IF NOT EXISTS dresscodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_index INTEGER NOT NULL UNIQUE,
    day TEXT NOT NULL,
    full_name TEXT NOT NULL,
    title TEXT NOT NULL,
    score_pct INTEGER NOT NULL,
    description TEXT NOT NULL,
    rule TEXT NOT NULL,
    crime TEXT NOT NULL,
    swatches_json TEXT NOT NULL,
    items TEXT NOT NULL,
    status TEXT NOT NULL
);

-- Week Plans (user's 7-day dresscode assignments)
CREATE TABLE IF NOT EXISTS week_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    week_start TEXT NOT NULL,
    slots_json TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, week_start)
);

CREATE INDEX idx_week_plans_user ON week_plans(user_id);

-- Daily Trials (themed challenges)
CREATE TABLE IF NOT EXISTS daily_trials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    theme TEXT NOT NULL,
    dresscode_id INTEGER,
    FOREIGN KEY (dresscode_id) REFERENCES dresscodes(id)
);

-- Streaks
CREATE TABLE IF NOT EXISTS streaks (
    user_id INTEGER PRIMARY KEY,
    current INTEGER NOT NULL DEFAULT 0,
    best INTEGER NOT NULL DEFAULT 0,
    last_date TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Duels (1v1 outfit battles)
CREATE TABLE IF NOT EXISTS duels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    creator_id INTEGER NOT NULL,
    opponent_id INTEGER,
    trial_a INTEGER,
    trial_b INTEGER,
    winner_id INTEGER,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (opponent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (trial_a) REFERENCES trials(id),
    FOREIGN KEY (trial_b) REFERENCES trials(id),
    FOREIGN KEY (winner_id) REFERENCES users(id)
);

-- Reports (moderation)
CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trial_id INTEGER NOT NULL,
    reporter_id INTEGER NOT NULL,
    reason TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (trial_id) REFERENCES trials(id) ON DELETE CASCADE,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
);
