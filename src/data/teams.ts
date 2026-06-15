import type { Team, TeamPercentages, Group } from "../types";

// Import the CSV as a raw string
import csvRaw from "../../data/World Cup 2026 Groups and Odds - Sheet1.csv?raw";

/**
 * Convert a betting-odds string to an implied probability percentage.
 * Handles American (+450, -155), fractional ("10-1"), and special ("Even", "OFF").
 * Returns null when odds are unavailable (e.g. "OFF").
 */
function oddsToPct(odds: string): number | null {
    const trimmed = odds.trim();
    if (!trimmed || trimmed === "OFF") return null;

    // Even money = 50%
    if (trimmed.toLowerCase() === "even") return 50;

    // American negative: starts with "-" (e.g. "-155")
    if (trimmed.startsWith("-")) {
        const abs = Math.abs(parseFloat(trimmed));
        if (!isNaN(abs) && abs > 0) {
            return roundPct(abs / (abs + 100));
        }
        return null;
    }

    // Fractional odds: contains "-" but does not start with it (e.g. "10-1")
    if (trimmed.includes("-")) {
        const parts = trimmed.split("-");
        if (parts.length === 2) {
            const num = parseFloat(parts[0]);
            const den = parseFloat(parts[1]);
            if (!isNaN(num) && !isNaN(den) && den > 0) {
                return roundPct(den / (num + den));
            }
        }
        return null;
    }

    // American positive: plain number (e.g. "450")
    const num = parseFloat(trimmed);
    if (!isNaN(num) && num > 0) {
        return roundPct(100 / (num + 100));
    }

    return null;
}

/** Round a probability (0–1) to one decimal place as a percentage (0–100). */
function roundPct(probability: number): number {
    return Math.round(probability * 1000) / 10;
}

/**
 * Parse a CSV string that may contain quoted fields with embedded newlines.
 * Returns an array of rows, each row an array of string values.
 */
function parseCSV(raw: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = "";
    let inQuotes = false;

    for (let i = 0; i < raw.length; i++) {
        const ch = raw[i];
        const next = raw[i + 1];

        if (inQuotes) {
            if (ch === '"') {
                if (next === '"') {
                    // Escaped quote inside a quoted field
                    field += '"';
                    i++;
                } else {
                    // Closing quote
                    inQuotes = false;
                }
            } else {
                field += ch;
            }
        } else {
            if (ch === '"') {
                inQuotes = true;
            } else if (ch === ",") {
                row.push(field.trim());
                field = "";
            } else if (ch === "\n" || (ch === "\r" && next === "\n")) {
                // End of row
                row.push(field.trim());
                if (row.some((f) => f !== "")) {
                    rows.push(row);
                }
                row = [];
                field = "";
                if (ch === "\r") i++; // skip \n in \r\n
            } else if (ch === "\r") {
                // Bare \r
                row.push(field.trim());
                if (row.some((f) => f !== "")) {
                    rows.push(row);
                }
                row = [];
                field = "";
            } else {
                field += ch;
            }
        }
    }

    // Flush last field/row
    row.push(field.trim());
    if (row.some((f) => f !== "")) {
        rows.push(row);
    }

    return rows;
}

/**
 * Normalize the header names from the CSV into camelCase keys.
 */
const HEADER_MAP: Record<string, string> = {
    Team: "team",
    Group: "group",
    Win: "win",
    Finals: "finals",
    Semis: "semis",
    "Quarter Finals": "quarterFinals",
    "Win Group": "winGroup",
    "Qualify from Group": "qualifyFromGroup",
};

function normalizeHeader(h: string): string {
    // Remove embedded newlines and extra whitespace
    const cleaned = h.replace(/\s+/g, " ").trim();
    return HEADER_MAP[cleaned] || cleaned.toLowerCase().replace(/\s+/g, "");
}

/** Parse the raw CSV into an array of Team objects (raw odds strings) */
function parseTeams(raw: string): Team[] {
    const rows = parseCSV(raw);
    if (rows.length === 0) return [];

    const headers = rows[0].map(normalizeHeader);

    return rows.slice(1).map((row) => {
        const team: Record<string, string> = {};
        headers.forEach((key, i) => {
            team[key] = row[i] ?? "";
        });
        return team as unknown as Team;
    });
}

/** Convert a raw Team into a TeamPercentages with odds translated to percentages */
function toPercentages(t: Team): TeamPercentages {
    return {
        team: t.team,
        winPct: oddsToPct(t.win),
        finalsPct: oddsToPct(t.finals),
        semisPct: oddsToPct(t.semis),
        quarterFinalsPct: oddsToPct(t.quarterFinals),
        winGroupPct: oddsToPct(t.winGroup),
        qualifyFromGroupPct: oddsToPct(t.qualifyFromGroup),
    };
}

/** Group teams by their group letter, then convert odds to percentages */
function buildGroups(teams: Team[]): Group[] {
    const map = new Map<string, Team[]>();

    for (const team of teams) {
        const existing = map.get(team.group);
        if (existing) {
            existing.push(team);
        } else {
            map.set(team.group, [team]);
        }
    }

    // Sort groups alphabetically (A–L)
    const sortedGroups = [...map.entries()].sort(([a], [b]) =>
        a.localeCompare(b)
    );

    return sortedGroups.map(([name, groupTeams]) => ({
        name,
        teams: groupTeams
            .map(toPercentages)
            .sort((a, b) => (b.winPct ?? -1) - (a.winPct ?? -1)),
    }));
}

/** All teams, parsed, odds converted to percentages, and grouped */
export function getGroups(): Group[] {
    const teams = parseTeams(csvRaw);
    return buildGroups(teams);
}

/** All teams as a flat list (raw odds strings) */
export function getAllTeams(): Team[] {
    return parseTeams(csvRaw);
}
