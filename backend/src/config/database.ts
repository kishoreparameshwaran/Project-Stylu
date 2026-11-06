import initSqlJs from 'sql.js';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(__dirname, '../../data/stylu.db');
const dataDir = path.dirname(dbPath);

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db: any;
let SQL: any;

// Initialize SQL.js
async function initDb() {
  SQL = await initSqlJs();

  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
}

// Save database to disk
function saveDb() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

// Initialize schema (only if tables don't exist)
export async function initializeDatabase() {
  await initDb();

  db.run('PRAGMA foreign_keys = ON');

  // Check if already initialized
  const result = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");

  if (result.length === 0 || result[0].values.length === 0) {
    const schemaPath = path.join(__dirname, '../models/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    db.exec(schema);
    saveDb();
    console.log('✓ Database schema initialized');
  } else {
    console.log('✓ Database loaded');
  }
}

// Wrapper for queries that returns row objects
function prepareQuery(sql: string) {
  return {
    get(...params: any[]) {
      try {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        if (stmt.step()) {
          const row = stmt.getAsObject();
          stmt.free();
          return row;
        }
        stmt.free();
        return null;
      } catch (error) {
        console.error('Query error:', error, 'SQL:', sql);
        throw error;
      }
    },
    all(...params: any[]) {
      try {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        const results = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      } catch (error) {
        console.error('Query error:', error, 'SQL:', sql);
        throw error;
      }
    },
    run(...params: any[]) {
      try {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        stmt.step();
        stmt.free();
        saveDb();
      } catch (error) {
        console.error('Query error:', error, 'SQL:', sql);
        throw error;
      }
    }
  };
}

// Data access layer
export const queries = {
  // Users
  createUser: {
    get(handle: string) {
      const stmt = db.prepare('INSERT INTO users (handle, is_guest) VALUES (?, 1)');
      stmt.bind([handle]);
      stmt.step();
      const lastId = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];
      stmt.free();
      saveDb();
      return prepareQuery('SELECT * FROM users WHERE id = ?').get(lastId);
    }
  },

  findUserById: prepareQuery('SELECT * FROM users WHERE id = ?'),
  findUserByHandle: prepareQuery('SELECT * FROM users WHERE handle = ?'),
  updateUserSettings: prepareQuery('UPDATE users SET settings_json = ? WHERE id = ?'),

  // Judges
  getAllJudges: prepareQuery('SELECT * FROM judges ORDER BY sort_order'),
  getJudgeBySlug: prepareQuery('SELECT * FROM judges WHERE slug = ?'),

  // Trials
  createTrial: {
    get(case_no: string, user_id: number, judge_id: number, tier: string, image_path: string) {
      const stmt = db.prepare(`
        INSERT INTO trials (case_no, user_id, judge_id, tier, image_path, status)
        VALUES (?, ?, ?, ?, ?, 'queued')
      `);
      stmt.bind([case_no, user_id, judge_id, tier, image_path]);
      stmt.step();
      const lastId = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];
      stmt.free();
      saveDb();
      return prepareQuery('SELECT * FROM trials WHERE id = ?').get(lastId);
    }
  },

  updateTrialVerdict: prepareQuery(`
    UPDATE trials
    SET status = ?, score_10 = ?, drip_pct = ?, title = ?, verdict_json = ?
    WHERE id = ?
  `),

  getTrialById: prepareQuery('SELECT * FROM trials WHERE id = ? AND deleted_at IS NULL'),
  getTrialsByUser: prepareQuery(`
    SELECT t.*, j.name as judge_name, j.slug as judge_slug, j.channel_no
    FROM trials t
    LEFT JOIN judges j ON t.judge_id = j.id
    WHERE t.user_id = ? AND t.deleted_at IS NULL
    ORDER BY t.created_at DESC
    LIMIT ? OFFSET ?
  `),

  softDeleteTrial: prepareQuery('UPDATE trials SET deleted_at = strftime(\'%s\', \'now\') WHERE id = ?'),
  softDeleteTrialByUser: prepareQuery('UPDATE trials SET deleted_at = strftime(\'%s\', \'now\') WHERE id = ? AND user_id = ?'),

  // Dresscodes
  getAllDresscodes: prepareQuery('SELECT * FROM dresscodes ORDER BY day_index'),
  getDresscodeById: prepareQuery('SELECT * FROM dresscodes WHERE id = ?'),

  // Week Plans
  getWeekPlan: prepareQuery('SELECT * FROM week_plans WHERE user_id = ? AND week_start = ?'),

  createWeekPlan: {
    get(user_id: number, week_start: string, slots_json: string) {
      const stmt = db.prepare(`
        INSERT INTO week_plans (user_id, week_start, slots_json)
        VALUES (?, ?, ?)
      `);
      stmt.bind([user_id, week_start, slots_json]);
      stmt.step();
      const lastId = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];
      stmt.free();
      saveDb();
      return prepareQuery('SELECT * FROM week_plans WHERE id = ?').get(lastId);
    }
  },

  updateWeekPlan: prepareQuery(`
    UPDATE week_plans
    SET slots_json = ?
    WHERE user_id = ? AND week_start = ?
  `),

  // Leaderboard
  getTopTrials: prepareQuery(`
    SELECT t.*, u.handle
    FROM trials t
    JOIN users u ON t.user_id = u.id
    WHERE t.deleted_at IS NULL
      AND t.status = 'done'
      AND t.share_allowed = 1
    ORDER BY t.score_10 DESC
    LIMIT 20
  `),

  // Latest verdict for ticker
  getLatestPublicTrial: prepareQuery(`
    SELECT t.*, u.handle
    FROM trials t
    JOIN users u ON t.user_id = u.id
    WHERE t.deleted_at IS NULL
      AND t.status = 'done'
      AND t.share_allowed = 1
    ORDER BY t.created_at DESC
    LIMIT 1
  `)
};

export { db };
