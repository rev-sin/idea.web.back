import { Elysia, t, status } from "elysia";
import { getAllEvents, getEventById } from "../services/event.service";

export const eventsRoute = new Elysia({ prefix: "/events" })
    .get(
        "/",
        async () => {
            const data = await getAllEvents();
            return { success: true, data };
        },
        {
            detail: { summary: "get all events", tags: ["events"] },
        }
    )
    .get(
        "/:id",
        async ({ params }) => {
            const event = await getEventById(Number(params.id));
            if (!event) return status(404, { success: false, error: "event not found" });
            return { success: true, data: event };
        },
        {
            params: t.Object({ id: t.String() }),
            detail: { summary: "get event by ID", tags: ["events"] },
        }
    );
