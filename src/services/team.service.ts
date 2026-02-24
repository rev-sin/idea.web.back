import { db } from "../db";
import { teams } from "../db/schema";
import { eq } from "drizzle-orm";

export async function getAllTeams() {
    return db.select().from(teams).orderBy(teams.name);
}

export async function getTeamById(id: number) {
    const result = await db.select().from(teams).where(eq(teams.id, id));
    return result[0] ?? null;
}
