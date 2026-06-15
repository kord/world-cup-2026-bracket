/**
 * ISO 3166-1 alpha-2 codes for every team in the 2026 World Cup.
 * England & Scotland use GB subdivisions (flagcdn supports gb-eng / gb-sct).
 */
export const COUNTRY_CODES: Record<string, string> = {
    "Spain": "es",
    "France": "fr",
    "England": "gb-eng",
    "Portugal": "pt",
    "Argentina": "ar",
    "Brazil": "br",
    "Germany": "de",
    "Netherlands": "nl",
    "Norway": "no",
    "Morocco": "ma",
    "Belgium": "be",
    "United States": "us",
    "Colombia": "co",
    "Mexico": "mx",
    "Japan": "jp",
    "Uruguay": "uy",
    "Switzerland": "ch",
    "Croatia": "hr",
    "Sweden": "se",
    "Ecuador": "ec",
    "Senegal": "sn",
    "Turkey": "tr",
    "Austria": "at",
    "Ivory Coast": "ci",
    "South Korea": "kr",
    "Australia": "au",
    "Scotland": "gb-sct",
    "Canada": "ca",
    "Egypt": "eg",
    "Ghana": "gh",
    "Bosnia+": "ba",
    "Algeria": "dz",
    "Paraguay": "py",
    "Czechia": "cz",
    "Tunisia": "tn",
    "Iran": "ir",
    "Congo DR": "cd",
    "Saudi Arabia": "sa",
    "Panama": "pa",
    "Qatar": "qa",
    "Cape Verde": "cv",
    "Uzbekistan": "uz",
    "New Zealand": "nz",
    "Iraq": "iq",
    "South Africa": "za",
    "Jordan": "jo",
    "Curacao": "cw",
    "Haiti": "ht",
};

/** Build a flagcdn.com URL for a team name. Returns null if no mapping exists. */
export function flagUrl(teamName: string): string | null {
    const code = COUNTRY_CODES[teamName];
    if (!code) return null;
    return `https://flagcdn.com/${code}.svg`;
}
