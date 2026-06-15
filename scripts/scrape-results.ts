/**
 * Scrape match results from worldcupstats.football.
 * Fetches all 12 group pages (A-L), parses match cards for scores,
 * and matches them to our fixtures by group + team names.
 *
 * Usage: npx tsx scripts/scrape-results.ts
 */
import { writeFileSync } from "fs";

const OUT = "src/data/group-phase-scrape-results.ts";

/** All 72 group-stage fixtures */
interface Fixture { id: number; home: string; away: string; group: string; date: string; time: string; }
const FX: Fixture[] = [
    // Group A
    { id: 1, home: "Mexico", away: "South Africa", group: "A", date: "Thu, Jun 11", time: "3:00 PM" },
    { id: 2, home: "Korea Republic", away: "Czechia", group: "A", date: "Thu, Jun 11", time: "10:00 PM" },
    { id: 3, home: "Czechia", away: "South Africa", group: "A", date: "Thu, Jun 18", time: "12:00 PM" },
    { id: 4, home: "Mexico", away: "Korea Republic", group: "A", date: "Thu, Jun 18", time: "9:00 PM" },
    { id: 5, home: "Czechia", away: "Mexico", group: "A", date: "Wed, Jun 24", time: "9:00 PM" },
    { id: 6, home: "South Africa", away: "Korea Republic", group: "A", date: "Wed, Jun 24", time: "9:00 PM" },
    // Group B
    { id: 7, home: "Canada", away: "Bosnia and Herzegovina", group: "B", date: "Fri, Jun 12", time: "3:00 PM" },
    { id: 8, home: "Qatar", away: "Switzerland", group: "B", date: "Sat, Jun 13", time: "3:00 PM" },
    { id: 9, home: "Switzerland", away: "Bosnia and Herzegovina", group: "B", date: "Thu, Jun 18", time: "3:00 PM" },
    { id: 10, home: "Canada", away: "Qatar", group: "B", date: "Thu, Jun 18", time: "6:00 PM" },
    { id: 11, home: "Switzerland", away: "Canada", group: "B", date: "Wed, Jun 24", time: "3:00 PM" },
    { id: 12, home: "Bosnia and Herzegovina", away: "Qatar", group: "B", date: "Wed, Jun 24", time: "3:00 PM" },
    // Group C
    { id: 13, home: "Brazil", away: "Morocco", group: "C", date: "Sat, Jun 13", time: "6:00 PM" },
    { id: 14, home: "Haiti", away: "Scotland", group: "C", date: "Sat, Jun 13", time: "9:00 PM" },
    { id: 15, home: "Scotland", away: "Morocco", group: "C", date: "Fri, Jun 19", time: "6:00 PM" },
    { id: 16, home: "Brazil", away: "Haiti", group: "C", date: "Fri, Jun 19", time: "8:30 PM" },
    { id: 17, home: "Scotland", away: "Brazil", group: "C", date: "Wed, Jun 24", time: "6:00 PM" },
    { id: 18, home: "Morocco", away: "Haiti", group: "C", date: "Wed, Jun 24", time: "6:00 PM" },
    // Group D
    { id: 19, home: "United States", away: "Paraguay", group: "D", date: "Fri, Jun 12", time: "9:00 PM" },
    { id: 20, home: "Australia", away: "Türkiye", group: "D", date: "Sat, Jun 13", time: "12:00 AM" },
    { id: 21, home: "United States", away: "Australia", group: "D", date: "Fri, Jun 19", time: "3:00 PM" },
    { id: 22, home: "Türkiye", away: "Paraguay", group: "D", date: "Fri, Jun 19", time: "11:00 PM" },
    { id: 23, home: "Türkiye", away: "United States", group: "D", date: "Thu, Jun 25", time: "10:00 PM" },
    { id: 24, home: "Paraguay", away: "Australia", group: "D", date: "Thu, Jun 25", time: "10:00 PM" },
    // Group E
    { id: 25, home: "Germany", away: "Curaçao", group: "E", date: "Sun, Jun 14", time: "1:00 PM" },
    { id: 26, home: "Ivory Coast", away: "Ecuador", group: "E", date: "Sun, Jun 14", time: "7:00 PM" },
    { id: 27, home: "Germany", away: "Ivory Coast", group: "E", date: "Sat, Jun 20", time: "4:00 PM" },
    { id: 28, home: "Ecuador", away: "Curaçao", group: "E", date: "Sat, Jun 20", time: "8:00 PM" },
    { id: 29, home: "Curaçao", away: "Ivory Coast", group: "E", date: "Thu, Jun 25", time: "4:00 PM" },
    { id: 30, home: "Ecuador", away: "Germany", group: "E", date: "Thu, Jun 25", time: "4:00 PM" },
    // Group F
    { id: 31, home: "Netherlands", away: "Japan", group: "F", date: "Sun, Jun 14", time: "4:00 PM" },
    { id: 32, home: "Sweden", away: "Tunisia", group: "F", date: "Sun, Jun 14", time: "10:00 PM" },
    { id: 33, home: "Netherlands", away: "Sweden", group: "F", date: "Sat, Jun 20", time: "1:00 PM" },
    { id: 34, home: "Tunisia", away: "Japan", group: "F", date: "Sat, Jun 20", time: "12:00 AM" },
    { id: 35, home: "Japan", away: "Sweden", group: "F", date: "Thu, Jun 25", time: "7:00 PM" },
    { id: 36, home: "Tunisia", away: "Netherlands", group: "F", date: "Thu, Jun 25", time: "7:00 PM" },
    // Group G
    { id: 37, home: "Belgium", away: "Egypt", group: "G", date: "Mon, Jun 15", time: "3:00 PM" },
    { id: 38, home: "Iran", away: "New Zealand", group: "G", date: "Mon, Jun 15", time: "9:00 PM" },
    { id: 39, home: "Belgium", away: "Iran", group: "G", date: "Sun, Jun 21", time: "3:00 PM" },
    { id: 40, home: "New Zealand", away: "Egypt", group: "G", date: "Sun, Jun 21", time: "9:00 PM" },
    { id: 41, home: "Egypt", away: "Iran", group: "G", date: "Fri, Jun 26", time: "11:00 PM" },
    { id: 42, home: "New Zealand", away: "Belgium", group: "G", date: "Fri, Jun 26", time: "11:00 PM" },
    // Group H
    { id: 43, home: "Spain", away: "Cape Verde", group: "H", date: "Mon, Jun 15", time: "12:00 PM" },
    { id: 44, home: "Saudi Arabia", away: "Uruguay", group: "H", date: "Mon, Jun 15", time: "6:00 PM" },
    { id: 45, home: "Spain", away: "Saudi Arabia", group: "H", date: "Sun, Jun 21", time: "12:00 PM" },
    { id: 46, home: "Uruguay", away: "Cape Verde", group: "H", date: "Sun, Jun 21", time: "6:00 PM" },
    { id: 47, home: "Cape Verde", away: "Saudi Arabia", group: "H", date: "Fri, Jun 26", time: "8:00 PM" },
    { id: 48, home: "Uruguay", away: "Spain", group: "H", date: "Fri, Jun 26", time: "8:00 PM" },
    // Group I
    { id: 49, home: "France", away: "Senegal", group: "I", date: "Tue, Jun 16", time: "3:00 PM" },
    { id: 50, home: "Iraq", away: "Norway", group: "I", date: "Tue, Jun 16", time: "6:00 PM" },
    { id: 51, home: "France", away: "Iraq", group: "I", date: "Mon, Jun 22", time: "5:00 PM" },
    { id: 52, home: "Norway", away: "Senegal", group: "I", date: "Mon, Jun 22", time: "8:00 PM" },
    { id: 53, home: "Norway", away: "France", group: "I", date: "Fri, Jun 26", time: "3:00 PM" },
    { id: 54, home: "Senegal", away: "Iraq", group: "I", date: "Fri, Jun 26", time: "3:00 PM" },
    // Group J
    { id: 55, home: "Argentina", away: "Algeria", group: "J", date: "Tue, Jun 16", time: "9:00 PM" },
    { id: 56, home: "Austria", away: "Jordan", group: "J", date: "Tue, Jun 16", time: "12:00 AM" },
    { id: 57, home: "Argentina", away: "Austria", group: "J", date: "Mon, Jun 22", time: "1:00 PM" },
    { id: 58, home: "Jordan", away: "Algeria", group: "J", date: "Mon, Jun 22", time: "11:00 PM" },
    { id: 59, home: "Jordan", away: "Argentina", group: "J", date: "Sat, Jun 27", time: "10:00 PM" },
    { id: 60, home: "Algeria", away: "Austria", group: "J", date: "Sat, Jun 27", time: "10:00 PM" },
    // Group K
    { id: 61, home: "Portugal", away: "DR Congo", group: "K", date: "Wed, Jun 17", time: "1:00 PM" },
    { id: 62, home: "Uzbekistan", away: "Colombia", group: "K", date: "Wed, Jun 17", time: "10:00 PM" },
    { id: 63, home: "Portugal", away: "Uzbekistan", group: "K", date: "Tue, Jun 23", time: "1:00 PM" },
    { id: 64, home: "Colombia", away: "DR Congo", group: "K", date: "Tue, Jun 23", time: "10:00 PM" },
    { id: 65, home: "Colombia", away: "Portugal", group: "K", date: "Sat, Jun 27", time: "7:30 PM" },
    { id: 66, home: "DR Congo", away: "Uzbekistan", group: "K", date: "Sat, Jun 27", time: "7:30 PM" },
    // Group L
    { id: 67, home: "England", away: "Croatia", group: "L", date: "Wed, Jun 17", time: "4:00 PM" },
    { id: 68, home: "Ghana", away: "Panama", group: "L", date: "Wed, Jun 17", time: "7:00 PM" },
    { id: 69, home: "England", away: "Ghana", group: "L", date: "Tue, Jun 23", time: "4:00 PM" },
    { id: 70, home: "Panama", away: "Croatia", group: "L", date: "Tue, Jun 23", time: "7:00 PM" },
    { id: 71, home: "Panama", away: "England", group: "L", date: "Sat, Jun 27", time: "5:00 PM" },
    { id: 72, home: "Croatia", away: "Ghana", group: "L", date: "Sat, Jun 27", time: "5:00 PM" },
];

/**
 * Map worldcupstats.football team names to our fixture team names.
 */
const NAME_MAP: Record<string, string> = {
    "Czech Republic": "Czechia",
    "South Korea": "Korea Republic",
    "Turkey": "Türkiye",
    "Curacao": "Curaçao",
    "Bosnia & Herzegovina": "Bosnia and Herzegovina",
};

function decode(s: string): string {
    return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

/** Normalize a worldcupstats team name to our fixture name */
function norm(name: string): string {
    const d = decode(name).trim();
    return NAME_MAP[d] ?? d;
}

interface ParsedResult { home: string; away: string; scoreH: number; scoreA: number; }

async function scrapeGroup(group: string): Promise<ParsedResult[]> {
    const url = `https://worldcupstats.football/groups/${group.toLowerCase()}/`;
    const html = await fetch(url).then(r => r.text());

    const results: ParsedResult[] = [];
    const blocks = html.split("match-card__teams");

    for (let i = 1; i < blocks.length; i++) {
        const b = blocks[i];
        const alts = [...b.matchAll(/alt="([^"]*)"/g)].map(m => m[1]);
        const scoreM = b.match(/match-card__score">([^<]*)/);
        if (scoreM && alts.length >= 2) {
            const [h, a] = scoreM[1].split(/\s*-\s*/).map(Number);
            results.push({ home: norm(alts[0]), away: norm(alts[1]), scoreH: h, scoreA: a });
        }
    }
    return results;
}

function resultToString(_home: string, _away: string, h: number, a: number): "home" | "away" | "tie" {
    if (h > a) return "home";
    if (a > h) return "away";
    return "tie";
}

async function main() {
    const groups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
    console.log(`Scraping ${groups.length} group pages from worldcupstats.football...\n`);

    // Fetch all groups in parallel
    const allResults = await Promise.all(groups.map(async g => {
        try {
            const r = await scrapeGroup(g);
            if (r.length > 0) console.log(`  Group ${g}: ${r.length} result(s)`);
            return { group: g, results: r };
        } catch (e) {
            console.log(`  Group ${g}: ERROR - ${e}`);
            return { group: g, results: [] as ParsedResult[] };
        }
    }));

    // Build fixture lookup: "group|home|away" → id
    const fixtureLookup = new Map<string, number>();
    for (const f of FX) {
        fixtureLookup.set(`${f.group}|${f.home}|${f.away}`, f.id);
    }

    // Build a reverse lookup: fixture id → fixture (for date/time in comments)
    const idToFixture = new Map<number, Fixture>();
    for (const f of FX) idToFixture.set(f.id, f);

    // Match results to fixture IDs, collect with their score info
    const items: { id: number; result: string; home: string; away: string; h: number; a: number; date: string; time: string }[] = [];
    for (const { group, results } of allResults) {
        for (const r of results) {
            const key = `${group}|${r.home}|${r.away}`;
            const id = fixtureLookup.get(key);
            if (id) {
                const result = resultToString(r.home, r.away, r.scoreH, r.scoreA);
                const f = idToFixture.get(id)!;
                items.push({ id, result, home: r.home, away: r.away, h: r.scoreH, a: r.scoreA, date: f.date, time: f.time });
                console.log(`  [${id}] ${r.home} ${r.scoreH}-${r.scoreA} ${r.away} → ${result}`);
            } else {
                console.log(`  [?] ${r.home} ${r.scoreH}-${r.scoreA} ${r.away} (no fixture match)`);
            }
        }
    }

    // Sort by fixture ID for clean output
    items.sort((a, b) => a.id - b.id);

    // Build .ts file with annotated comments
    const lines: string[] = [
        "// Auto-generated by scripts/scrape-results.ts — do not edit",
        "//",
        `// ${items.length} group-stage match results scraped from worldcupstats.football`,
        "//",
        "export interface ScrapeResult {",
        '  result: "home" | "away" | "tie";',
        "  homeScore: number;",
        "  awayScore: number;",
        "  home: string;",
        "  away: string;",
        "  date: string;",
        "  time: string;",
        "}",
        "",
        "export const groupPhaseScrapeResults: Record<number, ScrapeResult> = {",
    ];
    for (const item of items) {
        lines.push(`  // ${item.home} ${item.h}–${item.a} ${item.away} — ${item.date}, ${item.time} ET`);
        const obj = JSON.stringify({ result: item.result, homeScore: item.h, awayScore: item.a, home: item.home, away: item.away, date: item.date, time: item.time });
        lines.push(`  "${item.id}": ${obj},`);
    }
    lines.push("};");
    lines.push("");

    writeFileSync(OUT, lines.join("\n"));
    console.log(`\nDone: ${items.length} results → ${OUT}`);
}

main();
