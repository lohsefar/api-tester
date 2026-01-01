import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

if (!process.env.MARIADB_HOST || !process.env.MARIADB_USER || !process.env.MARIADB_PASSWORD || !process.env.MARIADB_DATABASE) {
  throw new Error("Missing MariaDB environment variables");
}

const connection = mysql.createPool({
  host: process.env.MARIADB_HOST,
  port: parseInt(process.env.MARIADB_PORT || "3306"),
  user: process.env.MARIADB_USER,
  password: process.env.MARIADB_PASSWORD,
  database: process.env.MARIADB_DATABASE,
});

export const db = drizzle(connection, { schema, mode: "default" });

