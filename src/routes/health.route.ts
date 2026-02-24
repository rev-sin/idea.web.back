import { Elysia } from "elysia";

export const healthRoute = new Elysia().get(
	"/health",
	() => ({
		success: true,
		data: { status: "ok", timestamp: new Date().toISOString() },
	}),
	{ detail: { summary: "health check", tags: ["health"] } },
);
