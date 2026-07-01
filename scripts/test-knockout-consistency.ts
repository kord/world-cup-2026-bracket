/**
 * Test that manually entered knockout results (manual-knockout-results.ts)
 * match the scraped results (knockout-phase-scrape-results.ts) for every match
 * that appears in both.
 *
 * Usage: npx tsx scripts/test-knockout-consistency.ts
 */

import assert from "node:assert";
import { manualKnockoutResults } from "../src/data/manual-knockout-results.js";
import { knockoutPhaseScrapeResults } from "../src/data/knockout-phase-scrape-results.js";

let failures = 0;
let ok = 0;

for (const [idStr, manual] of Object.entries(manualKnockoutResults)) {
    const id = Number(idStr);
    const scraped = knockoutPhaseScrapeResults[id];

    // Only compare if the scraper has a result for this match
    if (!scraped || scraped.result === null) continue;

    const label = `Match #${id}`;

    try {
        assert.strictEqual(
            manual.result,
            scraped.result,
            `${label}: result mismatch — manual=${manual.result}, scraped=${scraped.result}`,
        );
        assert.strictEqual(
            manual.homeScore,
            scraped.homeScore,
            `${label}: homeScore mismatch — manual=${manual.homeScore}, scraped=${scraped.homeScore}`,
        );
        assert.strictEqual(
            manual.awayScore,
            scraped.awayScore,
            `${label}: awayScore mismatch — manual=${manual.awayScore}, scraped=${scraped.awayScore}`,
        );

        // homeShootout / awayShootout: manual may omit them (undefined), scraped uses null
        const manHso = manual.homeShootout ?? null;
        const manAso = manual.awayShootout ?? null;
        assert.strictEqual(
            manHso,
            scraped.homeShootout,
            `${label}: homeShootout mismatch — manual=${manHso}, scraped=${scraped.homeShootout}`,
        );
        assert.strictEqual(
            manAso,
            scraped.awayShootout,
            `${label}: awayShootout mismatch — manual=${manAso}, scraped=${scraped.awayShootout}`,
        );

        console.log(`  ✓ ${label} — matches scraped`);
        ok++;
    } catch (e) {
        console.error(`  ✗ ${(e as Error).message}`);
        failures++;
    }
}

// Also check: are there scraped matches with results that are NOT in manual?
console.log();
let missingManual = 0;
for (const [idStr, scraped] of Object.entries(knockoutPhaseScrapeResults)) {
    if (scraped.result === null) continue;
    const id = Number(idStr);
    if (!(id in manualKnockoutResults)) {
        console.error(`  ⚠ Match #${id} has scraped result but no manual entry`);
        missingManual++;
    }
}

console.log();
if (failures === 0 && missingManual === 0) {
    console.log(`All ${ok} manual results match scraped. No issues.`);
    process.exit(0);
} else {
    if (failures > 0) console.error(`${failures} mismatch(es) found.`);
    if (missingManual > 0) console.error(`${missingManual} scraped match(es) missing from manual.`);
    process.exit(1);
}
