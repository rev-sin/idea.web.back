import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const teams = sqliteTable("teams", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull().unique(),
    college: text("college").notNull().default(""),
    createdAt: text("created_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
});

export const events = sqliteTable("events", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull().unique(),
    maxScore: integer("max_score").notNull().default(100),
    createdAt: text("created_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
});

export const scores = sqliteTable(
    "scores",
    {
        id: integer("id").primaryKey({ autoIncrement: true }),
        teamId: integer("team_id")
            .notNull()
            .references(() => teams.id, { onDelete: "cascade" }),
        eventId: integer("event_id")
            .notNull()
            .references(() => events.id, { onDelete: "cascade" }),
        score: integer("score").notNull().default(0),
        updatedAt: text("updated_at")
            .notNull()
            .default(sql`(CURRENT_TIMESTAMP)`),
    },
    (t) => [unique("uq_team_event").on(t.teamId, t.eventId)]
);

export type Team = typeof teams.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Score = typeof scores.$inferSelect;
