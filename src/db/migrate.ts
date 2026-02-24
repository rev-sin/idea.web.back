import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

const sqlite = new Database("./data/leaderboard.db", { create: true });
sqlite.exec("PRAGMA journal_mode=WAL;");
sqlite.exec("PRAGMA foreign_keys=ON;");
const db = drizzle(sqlite);

migrate(db, { migrationsFolder: "./migrations" });

console.log("migrations applied");
sqlite.close();
