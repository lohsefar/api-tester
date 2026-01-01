import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.MARIADB_HOST!,
    port: parseInt(process.env.MARIADB_PORT || "3306"),
    user: process.env.MARIADB_USER!,
    password: process.env.MARIADB_PASSWORD!,
    database: process.env.MARIADB_DATABASE!,
  },
} satisfies Config;

