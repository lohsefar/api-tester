import mysql from "mysql2/promise";
import { readFileSync } from "fs";
import { join } from "path";

// Load .env.local
function loadEnv() {
  const envPath = join(process.cwd(), ".env.local");
  try {
    const envFile = readFileSync(envPath, "utf-8");
    return Object.fromEntries(
      envFile
        .split("\n")
        .filter((line) => line.trim() && !line.startsWith("#"))
        .map((line) => {
          const [key, ...valueParts] = line.split("=");
          return [key.trim(), valueParts.join("=").trim().replace(/^["']|["']$/g, "")];
        })
    );
  } catch (error) {
    console.error("Error loading .env.local:", error);
    process.exit(1);
  }
}

const env = loadEnv();

if (!env.MARIADB_HOST || !env.MARIADB_USER || !env.MARIADB_PASSWORD || !env.MARIADB_DATABASE) {
  console.error("Missing required MariaDB environment variables");
  process.exit(1);
}

const connection = await mysql.createConnection({
  host: env.MARIADB_HOST,
  port: parseInt(env.MARIADB_PORT || "3306"),
  user: env.MARIADB_USER,
  password: env.MARIADB_PASSWORD,
  database: env.MARIADB_DATABASE,
});

console.log("Running database migrations...\n");

try {
  // Migration 1: Add anonymousSessionId column to endpoints table
  try {
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM endpoints LIKE 'anonymousSessionId'"
    );

    if (Array.isArray(columns) && columns.length === 0) {
      await connection.execute(
        "ALTER TABLE endpoints ADD COLUMN anonymousSessionId VARCHAR(255) NULL"
      );
      console.log("✓ Added anonymousSessionId column to endpoints table");
    } else {
      console.log("✓ anonymousSessionId column already exists");
    }
  } catch (error: any) {
    if (error.code === "ER_DUP_FIELDNAME") {
      console.log("✓ anonymousSessionId column already exists");
    } else {
      throw error;
    }
  }

  // Migration 2: Make userId nullable if it isn't already
  try {
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM endpoints WHERE Field = 'userId'"
    ) as any[];

    if (Array.isArray(columns) && columns.length > 0) {
      const column = columns[0];
      if (column.Null === "NO") {
        await connection.execute(
          "ALTER TABLE endpoints MODIFY COLUMN userId VARCHAR(255) NULL"
        );
        console.log("✓ Made userId column nullable");
      } else {
        console.log("✓ userId column is already nullable");
      }
    }
  } catch (error: any) {
    console.warn("Warning: Could not check/modify userId column:", error.message);
  }

  console.log("\n✓ All migrations completed successfully");
} catch (error: any) {
  console.error("\n✗ Migration failed:", error.message);
  process.exit(1);
} finally {
  await connection.end();
}

