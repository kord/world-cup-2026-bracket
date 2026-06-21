/**
 * ELO ratings for all 48 World Cup 2026 teams.
 * Data sourced from https://worldfootballrankings.com/rankings (Sun Jun 21 2026).
 */

/** ELO ratings keyed by our canonical team name */
const ELO_DATA: Record<string, number> = {
    Argentina: 1889.06,
    France: 1887.11,
    Spain: 1856.03,
    England: 1847.68,
    Brazil: 1772.01,
    Morocco: 1769.98,
    Netherlands: 1764.40,
    Germany: 1760.46,
    Portugal: 1755.09,
    Belgium: 1733.93,
    Mexico: 1721.78,
    Colombia: 1712.60,
    "United States": 1709.59,
    Croatia: 1695.21,
    Japan: 1681.26,
    Senegal: 1667.66,
    Uruguay: 1661.95,
    Switzerland: 1654.94,
    Austria: 1612.86,
    Iran: 1605.12,
    "South Korea": 1591.75,
    Australia: 1584.55,
    Norway: 1577.18,
    Canada: 1572.13,
    Egypt: 1570.67,
    Algeria: 1559.24,
    Ecuador: 1558.35,
    "Ivory Coast": 1551.71,
    Turkey: 1550.13,
    Sweden: 1517.99,
    Paraguay: 1517.39,
    Panama: 1505.33,
    Scotland: 1504.41,
    "Congo DR": 1487.18,
    Czechia: 1481.49,
    // — ranks 51–100 —
    Uzbekistan: 1444.48,
    Qatar: 1438.82,
    Tunisia: 1437.69,
    "Saudi Arabia": 1435.00,
    Iraq: 1426.53,
    "South Africa": 1418.21,
    "Cape Verde": 1389.79,
    "Bosnia and Herzegovina": 1381.18,
    Ghana: 1380.71,
    Jordan: 1372.29,
    Curacao: 1299.41,
    "New Zealand": 1290.04,
    Haiti: 1271.00,
};

/** Get the ELO rating for a team by canonical name. Returns null if unknown. */
export function getElo(teamName: string): number | null {
    return ELO_DATA[teamName] ?? null;
}

/** All ELO ratings as a map */
export function getAllElos(): Record<string, number> {
    return { ...ELO_DATA };
}

/** Predicted outcome probabilities for a matchup */
export interface EloPrediction {
    homeWin: number;
    draw: number;
    awayWin: number;
}

/**
 * Predict match outcome probabilities based on ELO ratings.
 * Uses the standard ELO expected-score formula with a draw model.
 * Probabilities sum to 1.
 */
export function predictMatch(
    homeElo: number,
    awayElo: number,
): EloPrediction {
    const diff = homeElo - awayElo;
    const expectedHome = 1 / (1 + Math.pow(10, -diff / 400));

    // Draw probability decreases as the Elo gap widens
    const drawBase = 0.28;
    const drawFactor = Math.exp(-Math.abs(diff) / 250);
    const draw = drawBase * drawFactor;

    const homeWin = (1 - draw) * expectedHome;
    const awayWin = (1 - draw) * (1 - expectedHome);

    return {
        homeWin: Math.round(homeWin * 1000) / 10,
        draw: Math.round(draw * 1000) / 10,
        awayWin: Math.round(awayWin * 1000) / 10,
    };
}

/**
 * Predict a matchup by team name. Returns null if either team has no ELO.
 */
export function predictByName(
    homeTeam: string,
    awayTeam: string,
): EloPrediction | null {
    const homeElo = getElo(homeTeam);
    const awayElo = getElo(awayTeam);
    if (homeElo === null || awayElo === null) return null;
    return predictMatch(homeElo, awayElo);
}
