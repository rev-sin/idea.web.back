import { eq } from "drizzle-orm";
import { db } from "../db";
import { events } from "../db/schema";

export async function getAllEvents() {
	return db.select().from(events).orderBy(events.name);
}

export async function getEventById(id: number) {
	const result = await db.select().from(events).where(eq(events.id, id));
	return result[0] ?? null;
}
