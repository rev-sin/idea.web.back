import { Elysia, t, status } from "elysia";
import { getAllTeams, getTeamById } from "../services/team.service";

export const teamsRoute = new Elysia({ prefix: "/teams" })
    .get(
        "/",
        async () => {
            const data = await getAllTeams();
            return { success: true, data };
        },
        {
            detail: { summary: "get all teams", tags: ["teams"] },
        }
    )
    .get(
        "/:id",
        async ({ params }) => {
            const team = await getTeamById(Number(params.id));
            if (!team) return status(404, { success: false, error: "team not found" });
            return { success: true, data: team };
        },
        {
            params: t.Object({ id: t.String() }),
            detail: { summary: "get team by ID", tags: ["teams"] },
        }
    );
