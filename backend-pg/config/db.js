import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

// Connection event provided by Pool
pool.on("connect", () => {
  console.log("PostgreSQL connected successfully!");
});

// Error event provided by Pool
pool.on("error", (err) => {
  console.error("Unexpected database error:", err);
});

export default pool;
