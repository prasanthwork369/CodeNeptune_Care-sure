import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('caresure.db');

export const initDb = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS api_cache (
      key TEXT PRIMARY KEY NOT NULL,
      data TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
};
