import { Elysia, status, t } from "elysia";
import { getLeaderboard, getTeamDetail } from "../services/leaderboard.service";

export const leaderboardRoute = new Elysia({ prefix: "/leaderboard" })
	.get(
		"/",
		async ({ query }) => {
			const eventId = query.event_id ? Number(query.event_id) : undefined;
			const data = await getLeaderboard(eventId);
			return { success: true, data };
		},
		{
			query: t.Object({
				event_id: t.Optional(t.String()),
			}),
			detail: {
				summary: "get leaderboard",
				description:
					"returns all teams ranked by total score. pass ?event_id= to filter to a single event.",
				tags: ["leaderboard"],
			},
		},
	)
	.get(
		"/teams/:id",
		async ({ params }) => {
			const team = await getTeamDetail(Number(params.id));
			if (!team)
				return status(404, { success: false, error: "team not found" });
			return { success: true, data: team };
		},
		{
			params: t.Object({ id: t.String() }),
			detail: {
				summary: "get team leaderboard detail",
				description: "returns a single team with per event score breakdown.",
				tags: ["leaderboard"],
			},
		},
	);
