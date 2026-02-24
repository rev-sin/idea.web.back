import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

const sqlite = new Database("./data/leaderboard.db", { create: true });
sqlite.exec("PRAGMA journal_mode=WAL;");
sqlite.exec("PRAGMA foreign_keys=ON;");
const db = drizzle(sqlite, { schema });

const seedTeams = [
    { name: "Alpha Coders", college: "NIT Trichy" },
    { name: "Byte Brigade", college: "PSG Tech" },
    { name: "Circuit Breakers", college: "Anna University" },
    { name: "Delta Hackers", college: "SSN College" },
    { name: "Epsilon Edge", college: "SRM University" },
];

const seedEvents = [
    { name: "Coding Challenge", maxScore: 100 },
    { name: "Robotics", maxScore: 150 },
    { name: "Quiz Blitz", maxScore: 50 },
];

const seedScores: [number, number, number][] = [
    [0, 0, 85], [0, 1, 130], [0, 2, 42],
    [1, 0, 92], [1, 1, 110], [1, 2, 38],
    [2, 0, 78], [2, 1, 140], [2, 2, 45],
    [3, 0, 95], [3, 1, 95], [3, 2, 30],
    [4, 0, 60], [4, 1, 120], [4, 2, 48],
];

async function seed() {
    console.log("seeding teams...");
    for (const team of seedTeams) {
        await db.insert(schema.teams).values(team).onConflictDoNothing();
    }

    console.log("seeding events...");
    for (const event of seedEvents) {
        await db.insert(schema.events).values(event).onConflictDoNothing();
    }

    const teams = await db.select({ id: schema.teams.id }).from(schema.teams).orderBy(schema.teams.id);
    const events = await db.select({ id: schema.events.id }).from(schema.events).orderBy(schema.events.id);

    console.log("seeding scores...");
    for (const [teamIdx, eventIdx, score] of seedScores) {
        await db
            .insert(schema.scores)
            .values({
                teamId: teams[teamIdx].id,
                eventId: events[eventIdx].id,
                score,
            })
            .onConflictDoNothing();
    }

    console.log("seed complete!");
    sqlite.close();
}

seed().catch((err) => {
    console.error("seed failed:", err);
    process.exit(1);
});
