/**
 * Sync all tables to PostgreSQL using raw SQL.
 * Usage:  node scripts/sync-db.js          (create tables if not exist)
 *         node scripts/sync-db.js --force  (drop & recreate – DATA LOSS)
 */
import dotenv from "dotenv";
dotenv.config();
import pool from "../config/db.js";
import createAllTables from "../models/index.js";

// Drop all tables (used by --force flag)
const DROP_ALL = `
DROP TABLE IF EXISTS "task_members"   CASCADE;
DROP TABLE IF EXISTS "module_members" CASCADE;
DROP TABLE IF EXISTS "module_teams"   CASCADE;
DROP TABLE IF EXISTS "project_teams"  CASCADE;
DROP TABLE IF EXISTS "team_members"   CASCADE;
DROP TABLE IF EXISTS "chat_messages"  CASCADE;
DROP TABLE IF EXISTS "chat_groups"    CASCADE;
DROP TABLE IF EXISTS "todos"          CASCADE;
DROP TABLE IF EXISTS "tasks"          CASCADE;
DROP TABLE IF EXISTS "modules"        CASCADE;
DROP TABLE IF EXISTS "projects"       CASCADE;
DROP TABLE IF EXISTS "teams"          CASCADE;
DROP TABLE IF EXISTS "members"        CASCADE;
DROP TABLE IF EXISTS "organizations"  CASCADE;
DROP FUNCTION IF EXISTS update_updated_at CASCADE;
`;

const flag = process.argv[2];

(async () => {
  try {
    console.log("Connecting to database...");
    await pool.query("SELECT 1");
    console.log("Database connection OK.");

    if (flag === "--force") {
      console.log("⚠️  FORCE: Dropping all tables...");
      await pool.query(DROP_ALL);
    }

    // Use the same createAllTables from models/index.js
    await createAllTables();

    console.log("✅ All tables synced successfully.");
  } catch (err) {
    console.error("❌ Sync failed:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
