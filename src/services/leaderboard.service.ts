import { db } from "../db";
import { scores, teams, events } from "../db/schema";
import { eq, sum, desc, asc } from "drizzle-orm";

export type LeaderboardEntry = {
    rank: number;
    teamId: number;
    teamName: string;
    college: string;
    totalScore: number;
    eventBreakdown: { eventId: number; eventName: string; score: number }[];
};

// ── Overall or per-event leaderboard ─────────────────────────────────────────
export async function getLeaderboard(eventId?: number): Promise<LeaderboardEntry[]> {
    // Fetch all scores with team + event info
    const rows = await db
        .select({
            teamId: teams.id,
            teamName: teams.name,
            college: teams.college,
            eventId: events.id,
            eventName: events.name,
            score: scores.score,
        })
        .from(scores)
        .innerJoin(teams, eq(scores.teamId, teams.id))
        .innerJoin(events, eq(scores.eventId, events.id))
        .where(eventId !== undefined ? eq(scores.eventId, eventId) : undefined)
        .orderBy(asc(teams.id));

    // Group by team in memory — fast enough for competition scale
    const teamMap = new Map<number, LeaderboardEntry>();
    for (const row of rows) {
        if (!teamMap.has(row.teamId)) {
            teamMap.set(row.teamId, {
                rank: 0,
                teamId: row.teamId,
                teamName: row.teamName,
                college: row.college,
                totalScore: 0,
                eventBreakdown: [],
            });
        }
        const entry = teamMap.get(row.teamId)!;
        entry.totalScore += row.score;
        entry.eventBreakdown.push({
            eventId: row.eventId,
            eventName: row.eventName,
            score: row.score,
        });
    }

    // Sort by total score descending, then assign ranks
    const sorted = [...teamMap.values()].sort((a, b) => b.totalScore - a.totalScore);
    sorted.forEach((entry, i) => {
        entry.rank = i + 1;
    });

    return sorted;
}

// ── Single team detail ────────────────────────────────────────────────────────
export async function getTeamDetail(teamId: number): Promise<LeaderboardEntry | null> {
    const rows = await db
        .select({
            teamId: teams.id,
            teamName: teams.name,
            college: teams.college,
            eventId: events.id,
            eventName: events.name,
            score: scores.score,
        })
        .from(scores)
        .innerJoin(teams, eq(scores.teamId, teams.id))
        .innerJoin(events, eq(scores.eventId, events.id))
        .where(eq(scores.teamId, teamId));

    if (rows.length === 0) return null;

    const entry: LeaderboardEntry = {
        rank: 0,
        teamId: rows[0].teamId,
        teamName: rows[0].teamName,
        college: rows[0].college,
        totalScore: rows.reduce((acc, r) => acc + r.score, 0),
        eventBreakdown: rows.map((r) => ({
            eventId: r.eventId,
            eventName: r.eventName,
            score: r.score,
        })),
    };

    return entry;
}
