import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../shared/schema";
import { log } from "./vite"; // Assuming log function is available

let db: ReturnType<typeof drizzle> | ReturnType<typeof drizzleSqlite>;

if (process.env.NODE_ENV === "production") {
  // Production: Use Neon PostgreSQL
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL environment variable is not set for production.",
    );
  }
  log("Connecting to Production Database (PostgreSQL via Neon)...");
  const sql = neon(process.env.DATABASE_URL);
  db = drizzle(sql, { schema });
  log("Connected to Production Database.");
  // Migrations should be handled separately in production, e.g., via drizzle-kit push or Render build script

} else {
  // Development/Testing: Use SQLite
  log("Connecting to Development Database (SQLite)...");
  const db_path = "./quiz_app.db"; // Local SQLite file
  const sqlite = new Database(db_path);
  db = drizzleSqlite(sqlite, { schema });
  log(`Connected to Development Database at ${db_path}`);

  // Initialize SQLite tables if they don't exist (for local dev)
  const initSqliteDb = () => {
    try {
      // Use single quotes for string literals in CHECK constraint for SQLite compatibility
      sqlite.exec(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE
        );
        CREATE TABLE IF NOT EXISTS quizzes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          creator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          creator_name TEXT NOT NULL,
          access_code TEXT NOT NULL UNIQUE,
          url_slug TEXT NOT NULL UNIQUE,
          dashboard_token TEXT NOT NULL UNIQUE,
          created_at TEXT NOT NULL,
          expires_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS questions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
          text TEXT NOT NULL,
          image_url TEXT,
          type TEXT NOT NULL CHECK(type IN ('multiple_choice', 'select_all')) DEFAULT 'multiple_choice',
          options TEXT NOT NULL, -- JSON array of strings
          correct_answers TEXT NOT NULL -- JSON array of strings
        );
        CREATE TABLE IF NOT EXISTS quiz_attempts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
          taker_name TEXT NOT NULL,
          score INTEGER NOT NULL,
          max_score INTEGER NOT NULL,
          answers TEXT NOT NULL, -- JSON object mapping question ID to user answers
          completed_at TEXT NOT NULL
        );
      `);
      log("SQLite Database initialized successfully (local development).");
    } catch (error) {
      log(`Error initializing SQLite DB: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  initSqliteDb();
}

export { db };

