/**
 * ELO ratings for all 48 World Cup 2026 teams.
 * Data sourced from worldfootballrankings.com (June 2026).
 */

/** ELO ratings keyed by our canonical team name */
const ELO_DATA: Record<string, number> = {
    Argentina: 1877.27,
    France: 1870.70,
    Spain: 1856.03,
    England: 1828.02,
    Portugal: 1767.85,
    Brazil: 1765.34,
    Morocco: 1755.62,
    Netherlands: 1749.20,
    Germany: 1743.54,
    Belgium: 1742.24,
    Croatia: 1714.87,
    Mexico: 1700.98,
    Colombia: 1698.35,
    "United States": 1688.53,
    Senegal: 1684.07,
    Uruguay: 1673.07,
    Japan: 1665.94,
    Switzerland: 1640.92,
    Iran: 1619.58,
    "South Korea": 1612.55,
    Australia: 1605.61,
    Austria: 1597.40,
    Turkey: 1579.47,
    Algeria: 1571.03,
    Ecuador: 1570.76,
    "Ivory Coast": 1568.62,
    Egypt: 1562.37,
    Norway: 1557.44,
    Canada: 1551.50,
    Panama: 1539.16,
    Sweden: 1533.19,
    Scotland: 1518.77,
    Paraguay: 1488.05,
    Czechia: 1484.82,
    "Congo DR": 1474.43,
    Qatar: 1459.45,
    Uzbekistan: 1458.73,
    Tunisia: 1453.00,
    Iraq: 1446.28,
    "Saudi Arabia": 1423.88,
    "South Africa": 1414.88,
    "Bosnia and Herzegovina": 1395.19,
    "Cape Verde": 1389.79,
    Jordan: 1387.74,
    Ghana: 1346.88,
    Curacao: 1287.00,
    Haiti: 1277.67,
    "New Zealand": 1275.58,
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
