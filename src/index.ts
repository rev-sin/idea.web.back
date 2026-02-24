import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { eventsRoute } from "./routes/events.route";
import { healthRoute } from "./routes/health.route";
import { leaderboardRoute } from "./routes/leaderboard.route";
import { teamsRoute } from "./routes/teams.route";

const app = new Elysia()
	.use(cors())
	.use(
		swagger({
			documentation: {
				info: {
					title: "IDEA Leaderboard API",
					version: "1.0.0",
					description:
						"Type-safe leaderboard API for the IDEA competition. Scores are managed via direct SQL.",
				},
				tags: [
					{ name: "Leaderboard", description: "Ranked leaderboard endpoints" },
					{ name: "Teams", description: "Team lookup endpoints" },
					{ name: "Events", description: "Event lookup endpoints" },
					{ name: "System", description: "Health & diagnostics" },
				],
			},
		}),
	)
	.use(healthRoute)
	.use(leaderboardRoute)
	.use(teamsRoute)
	.use(eventsRoute)
	.onError(({ code, error }) => {
		const status =
			code === "NOT_FOUND" ? 404 : code === "VALIDATION" ? 400 : 500;
		const message = error instanceof Error ? error.message : String(error);
		return new Response(JSON.stringify({ success: false, error: message }), {
			status,
			headers: { "Content-Type": "application/json" },
		});
	})
	.listen(3000);

console.log(
	`Avishkar - IDEA Leaderboard API running at http://${app.server?.hostname}:${app.server?.port}`,
);
console.log(
	`Swagger docs at http://${app.server?.hostname}:${app.server?.port}/swagger`,
);

export type App = typeof app;
