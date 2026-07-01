/**
 * Manually specified knockout match results.
 * These take priority over scraped results — set them here if the scraper
 * hasn't picked up a finished match yet.
 *
 * Format: matchId → { result, homeScore, awayScore, homeShootout?, awayShootout? }
 */

export interface ManualKnockoutResult {
    result: "home" | "away";
    homeScore: number;
    awayScore: number;
    homeShootout?: number;
    awayShootout?: number;
}

export const manualKnockoutResults: Record<number, ManualKnockoutResult> = {
    // ═══════════════════════════════════════════════════════════════
    // Round of 32 (matches 73–88) — Jun 28 – Jul 3
    // ═══════════════════════════════════════════════════════════════

    // #73 · Sun, Jun 28 · SoFi Stadium
    // Home: Runner-up A  ·  Away: Canada
    73: { result: "away", homeScore: 0, awayScore: 1 },

    // #76 · Mon, Jun 29 · NRG Stadium
    // Home: Brazil  ·  Away: Japan
    76: { result: "home", homeScore: 2, awayScore: 1 },

    // #74 · Mon, Jun 29 · Gillette Stadium
    // Home: Germany  ·  Away: Paraguay
    74: { result: "away", homeScore: 1, awayScore: 1, homeShootout: 3, awayShootout: 4 },

    // #75 · Mon, Jun 29 · Estadio BBVA
    // Home: Netherlands  ·  Away: Morocco
    75: { result: "away", homeScore: 1, awayScore: 1, homeShootout: 2, awayShootout: 3 },

    // #78 · Tue, Jun 30 · AT&T Stadium
    // Home: Ivory Coast  ·  Away: Norway
    78: { result: "away", homeScore: 1, awayScore: 2 },

    // #77 · Tue, Jun 30 · MetLife Stadium
    // Home: France  ·  Away: Sweden
    77: { result: "home", homeScore: 3, awayScore: 0 },

    // #79 · Tue, Jun 30 · Estadio Azteca
    // Home: Mexico  ·  Away: Ecuador
    79: { result: "home", homeScore: 2, awayScore: 0 },

    // #80 · Wed, Jul 1 · Mercedes-Benz Stadium
    // Home: England  ·  Away: D.R. Congo
    80: { result: "home", homeScore: 2, awayScore: 1 },

    // #81 · Wed, Jul 1 · Levi's Stadium
    // Home: United States  ·  Away: Best 3rd (B/E/F/I/J)
    // 81: { result: "", homeScore: 0, awayScore: 0 },

    // #82 · Wed, Jul 1 · Lumen Field
    // Home: Belgium  ·  Away: Best 3rd (A/E/H/I/J)
    // 82: { result: "", homeScore: 0, awayScore: 0 },

    // #83 · Thu, Jul 2 · BMO Field
    // Home: Portugal  ·  Away: Croatia
    // 83: { result: "", homeScore: 0, awayScore: 0 },

    // #84 · Thu, Jul 2 · SoFi Stadium
    // Home: Spain  ·  Away: Austria
    // 84: { result: "", homeScore: 0, awayScore: 0 },

    // #85 · Thu, Jul 2 · BC Place
    // Home: Winner B  ·  Away: Best 3rd (E/F/G/I/J)
    // 85: { result: "", homeScore: 0, awayScore: 0 },

    // #86 · Fri, Jul 3 · Hard Rock Stadium
    // Home: Argentina  ·  Away: Cape Verde
    // 86: { result: "", homeScore: 0, awayScore: 0 },

    // #87 · Fri, Jul 3 · Arrowhead Stadium
    // Home: Colombia  ·  Away: Best 3rd (D/E/I/J/L)
    // 87: { result: "", homeScore: 0, awayScore: 0 },

    // #88 · Fri, Jul 3 · AT&T Stadium
    // Home: Australia  ·  Away: Egypt
    // 88: { result: "", homeScore: 0, awayScore: 0 },

    // ═══════════════════════════════════════════════════════════════
    // Round of 16 (matches 89–96) — Jul 4–7
    // ═══════════════════════════════════════════════════════════════

    // #89 · Sat, Jul 4 · Lincoln Financial Field
    // Home: Paraguay  ·  Away: Winner M77
    // 89: { result: "", homeScore: 0, awayScore: 0 },

    // #90 · Sat, Jul 4 · NRG Stadium
    // Home: Canada  ·  Away: Winner M75
    // 90: { result: "", homeScore: 0, awayScore: 0 },

    // #91 · Sun, Jul 5 · MetLife Stadium
    // Home: Brazil  ·  Away: Norway
    // 91: { result: "", homeScore: 0, awayScore: 0 },

    // #92 · Sun, Jul 5 · Estadio Azteca
    // Home: Winner M79  ·  Away: Winner M80
    // 92: { result: "", homeScore: 0, awayScore: 0 },

    // #93 · Mon, Jul 6 · AT&T Stadium
    // Home: Winner M83  ·  Away: Winner M84
    // 93: { result: "", homeScore: 0, awayScore: 0 },

    // #94 · Mon, Jul 6 · Lumen Field
    // Home: Winner M81  ·  Away: Winner M82
    // 94: { result: "", homeScore: 0, awayScore: 0 },

    // #95 · Tue, Jul 7 · Mercedes-Benz Stadium
    // Home: Winner M86  ·  Away: Winner M88
    // 95: { result: "", homeScore: 0, awayScore: 0 },

    // #96 · Tue, Jul 7 · BC Place
    // Home: Winner M85  ·  Away: Winner M87
    // 96: { result: "", homeScore: 0, awayScore: 0 },

    // ═══════════════════════════════════════════════════════════════
    // Quarterfinals (matches 97–100) — Jul 9–11
    // ═══════════════════════════════════════════════════════════════

    // #97 · Thu, Jul 9 · Gillette Stadium
    // Home: Winner M89  ·  Away: Winner M90
    // 97: { result: "", homeScore: 0, awayScore: 0 },

    // #98 · Fri, Jul 10 · SoFi Stadium
    // Home: Winner M93  ·  Away: Winner M94
    // 98: { result: "", homeScore: 0, awayScore: 0 },

    // #99 · Sat, Jul 11 · Hard Rock Stadium
    // Home: Winner M91  ·  Away: Winner M92
    // 99: { result: "", homeScore: 0, awayScore: 0 },

    // #100 · Sat, Jul 11 · Arrowhead Stadium
    // Home: Winner M95  ·  Away: Winner M96
    // 100: { result: "", homeScore: 0, awayScore: 0 },

    // ═══════════════════════════════════════════════════════════════
    // Semifinals (matches 101–102) — Jul 14–15
    // ═══════════════════════════════════════════════════════════════

    // #101 · Tue, Jul 14 · AT&T Stadium
    // Home: Winner M97  ·  Away: Winner M98
    // 101: { result: "", homeScore: 0, awayScore: 0 },

    // #102 · Wed, Jul 15 · Mercedes-Benz Stadium
    // Home: Winner M99  ·  Away: Winner M100
    // 102: { result: "", homeScore: 0, awayScore: 0 },

    // ═══════════════════════════════════════════════════════════════
    // Third Place (match 103) — Jul 18
    // ═══════════════════════════════════════════════════════════════

    // #103 · Sat, Jul 18 · Hard Rock Stadium
    // Home: Loser M101  ·  Away: Loser M102
    // 103: { result: "", homeScore: 0, awayScore: 0 },

    // ═══════════════════════════════════════════════════════════════
    // Final (match 104) — Jul 19
    // ═══════════════════════════════════════════════════════════════

    // #104 · Sun, Jul 19 · MetLife Stadium
    // Home: Winner M101  ·  Away: Winner M102
    // 104: { result: "", homeScore: 0, awayScore: 0 },
};
