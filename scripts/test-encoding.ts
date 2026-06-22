/**
 * Quick tests for pick encoding/decoding.
 * Usage: npx tsx scripts/test-encoding.ts
 */

import { encodePicks, decodePicks } from "../src/data/pickEncoding";
import type { PicksStore } from "../src/data/useMatchPicks";
import { getAllFixtures } from "../src/data/fixtures";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
    if (condition) { passed++; console.log(`  ✓ ${msg}`); }
    else { failed++; console.error(`  ✗ ${msg}`); }
}

function assertEq<T>(actual: T, expected: T, msg: string) {
    if (actual === expected) { passed++; console.log(`  ✓ ${msg}`); }
    else { failed++; console.error(`  ✗ ${msg}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`); }
}

// ── Test 1: roundtrip with picks ──────────────────────────────────────────

console.log("\n1. Roundtrip encode → decode");
{
    const name = "Test User";
    const picks: PicksStore = {};
    // Fill all 72 matches: i%3=1 home, i%3=2 draw, i%3=0 away
    for (let i = 1; i <= 72; i++) {
        const sel = i % 3 === 1 ? "home" : i % 3 === 2 ? "draw" : "away";
        picks[String(i)] = { selection: sel, timestamp: 0 };
    }
    const encoded = encodePicks(name, picks);
    console.log(`   Encoded: ${encoded}`);
    const decoded = decodePicks(encoded);
    assert(decoded !== null, "decode returned non-null");
    if (decoded) {
        assertEq(decoded.name, name, "name roundtrips");
        assertEq(Object.keys(decoded.picks).length, 72, "72 picks roundtrip");
        let allMatch = true;
        for (let i = 1; i <= 72; i++) {
            if (decoded.picks[String(i)]?.selection !== picks[String(i)]?.selection) {
                allMatch = false;
                break;
            }
        }
        assert(allMatch, "all pick selections match");
        // Verify draw distribution
        const counts = { home: 0, draw: 0, away: 0 };
        for (const [, e] of Object.entries(decoded.picks)) counts[e.selection]++;
        assertEq(counts.draw, 24, "24 draws (i%3=2)");
        assertEq(counts.home, 24, "24 homes (i%3=1)");
        assertEq(counts.away, 24, "24 always (i%3=0)");
    }
}

// ── Test 2: provided strings ──────────────────────────────────────────────

const TEST_STRINGS = [
    "UDBaWUBaMjrLnzDO2EnCn5DEeEHCvxrW22s=",
];

for (let i = 0; i < TEST_STRINGS.length; i++) {
    console.log(`\n2.${i + 1} Decode provided string: "${TEST_STRINGS[i]}"`);
    const decoded = decodePicks(TEST_STRINGS[i]);
    assert(decoded !== null, "decode returned non-null");
    if (decoded) {
        console.log(`   Name: "${decoded.name}"`);
        const pickEntries = Object.entries(decoded.picks);
        console.log(`   Picks: ${pickEntries.length}`);
        const counts = { home: 0, draw: 0, away: 0 };
        for (const [, entry] of pickEntries) {
            counts[entry.selection]++;
        }
        console.log(`   Home: ${counts.home}, Draw: ${counts.draw}, Away: ${counts.away}`);

        // Re-encode and compare
        const reEncoded = encodePicks(decoded.name, decoded.picks);
        console.log(`   Re-encoded: ${reEncoded}`);
        assertEq(reEncoded, TEST_STRINGS[i], "re-encode matches original");

        // Contiguity check: picks should be contiguous by kickoff time
        const allFixtures = getAllFixtures().sort((a, b) => a.kickoff - b.kickoff);
        const chronoIds = allFixtures.map(f => f.id);
        const pickedSet = new Set(Object.keys(decoded.picks).map(Number));
        const pickedChrono = chronoIds.filter(id => pickedSet.has(id));
        if (pickedChrono.length > 0) {
            const firstIdx = chronoIds.indexOf(pickedChrono[0]);
            const lastIdx = chronoIds.indexOf(pickedChrono[pickedChrono.length - 1]);
            const expected = chronoIds.slice(firstIdx, lastIdx + 1);
            const missing = expected.filter(id => !pickedSet.has(id));
            const contiguous = missing.length === 0;
            const goesToEnd = lastIdx === chronoIds.length - 1;
            console.log(`   Chrono range: #${pickedChrono[0]}–#${pickedChrono[pickedChrono.length - 1]} (${pickedChrono.length} picks of ${expected.length} matches)`);
            if (!contiguous) console.log(`   Missing: ${missing.join(", ")}`);
            console.log(`   Chrono-contiguous: ${contiguous ? "yes" : "NO"}, to last match: ${goesToEnd ? "yes" : "NO"}`);
            assert(contiguous, `picks chrono-contiguous from #${pickedChrono[0]} to #${pickedChrono[pickedChrono.length - 1]}`);
            assert(goesToEnd, "picks include the final group-stage match");
        }
    }
}

// ── Test 3: invalid strings ───────────────────────────────────────────────

console.log("\n3. Invalid strings return null");
assert(decodePicks("") === null, 'empty string → null');
assert(decodePicks("!!!not-base64!!!") === null, 'garbage → null');
assert(decodePicks("abc") === null, 'too short → null');

// ── Test 4: empty name ────────────────────────────────────────────────────

console.log("\n4. Empty name roundtrip");
{
    const encoded = encodePicks("", {});
    console.log(`   Encoded: ${encoded}`);
    const decoded = decodePicks(encoded);
    assert(decoded !== null && decoded.name === "", "empty name roundtrips");
}

// ── Test 5: all draw ──────────────────────────────────────────────────────

console.log("\n5. All draws roundtrip");
{
    const picks: PicksStore = {};
    for (let i = 1; i <= 72; i++) {
        picks[String(i)] = { selection: "draw", timestamp: 0 };
    }
    const encoded = encodePicks("Drawer", picks);
    const decoded = decodePicks(encoded);
    assert(decoded !== null, "decode non-null");
    if (decoded) {
        assertEq(decoded.name, "Drawer", "name");
        let allDraw = true;
        for (const [, e] of Object.entries(decoded.picks)) {
            if (e.selection !== "draw") { allDraw = false; break; }
        }
        assert(allDraw, "all picks are draw");
    }
}

// ── Test 6: legacy "tie" → "draw" normalization in encoder ────────────────

console.log("\n6. Legacy 'tie' encodes as 'draw'");
{
    const picks: PicksStore = {
        "4": { selection: "tie" as any, timestamp: 0 },
    };
    const encoded = encodePicks("test", picks);
    const decoded = decodePicks(encoded);
    assert(decoded !== null, "decode non-null");
    if (decoded) {
        assertEq(decoded.picks["4"]?.selection, "draw", "tie encoded/decoded as draw");
    }
}

// ── Test 7: Shirley's full dataset → matches expected encoded string ──────

console.log("\n7. Shirley full dataset encodes to expected string");
{
    const shirleyFull: PicksStore = {
        "3": { selection: "away", timestamp: 0 },
        "4": { selection: "draw", timestamp: 0 },
        "5": { selection: "away", timestamp: 0 },
        "6": { selection: "away", timestamp: 0 },
        "9": { selection: "home", timestamp: 0 },
        "10": { selection: "home", timestamp: 0 },
        "11": { selection: "home", timestamp: 0 },
        "12": { selection: "away", timestamp: 0 },
        "15": { selection: "away", timestamp: 0 },
        "16": { selection: "home", timestamp: 0 },
        "17": { selection: "away", timestamp: 0 },
        "18": { selection: "home", timestamp: 0 },
        "21": { selection: "home", timestamp: 0 },
        "22": { selection: "home", timestamp: 0 },
        "23": { selection: "away", timestamp: 0 },
        "24": { selection: "away", timestamp: 0 },
        "27": { selection: "home", timestamp: 0 },
        "28": { selection: "home", timestamp: 0 },
        "29": { selection: "away", timestamp: 0 },
        "30": { selection: "away", timestamp: 0 },
        "33": { selection: "away", timestamp: 0 },
        "34": { selection: "away", timestamp: 0 },
        "35": { selection: "home", timestamp: 0 },
        "36": { selection: "away", timestamp: 0 },
        "39": { selection: "home", timestamp: 0 },
        "40": { selection: "away", timestamp: 0 },
        "41": { selection: "home", timestamp: 0 },
        "42": { selection: "away", timestamp: 0 },
        "45": { selection: "home", timestamp: 0 },
        "46": { selection: "home", timestamp: 0 },
        "47": { selection: "home", timestamp: 0 },
        "48": { selection: "away", timestamp: 0 },
        "51": { selection: "home", timestamp: 0 },
        "52": { selection: "home", timestamp: 0 },
        "53": { selection: "away", timestamp: 0 },
        "54": { selection: "home", timestamp: 0 },
        "57": { selection: "home", timestamp: 0 },
        "58": { selection: "away", timestamp: 0 },
        "59": { selection: "away", timestamp: 0 },
        "60": { selection: "home", timestamp: 0 },
        "62": { selection: "away", timestamp: 0 },
        "63": { selection: "home", timestamp: 0 },
        "64": { selection: "home", timestamp: 0 },
        "65": { selection: "away", timestamp: 0 },
        "66": { selection: "home", timestamp: 0 },
        "68": { selection: "home", timestamp: 0 },
        "69": { selection: "home", timestamp: 0 },
        "70": { selection: "away", timestamp: 0 },
        "71": { selection: "away", timestamp: 0 },
        "72": { selection: "home", timestamp: 0 },
    };
    const EXPECTED = "UDBaWUBaMjrLnzDO2EnCn5DEeEHCvxrW22s=";
    const encoded = encodePicks("shirley", shirleyFull);
    console.log(`   Encoded: ${encoded}`);
    console.log(`   Expected: ${EXPECTED}`);
    assertEq(encoded, EXPECTED, "Shirley full dataset matches expected string");
    const decoded = decodePicks(encoded);
    assert(decoded !== null, "decode non-null");
    if (decoded) {
        assertEq(decoded.name, "shirley", "name roundtrips");
        assertEq(Object.keys(decoded.picks).length, 50, "50 picks (4 included via tie→draw fix)");
        assertEq(decoded.picks["4"]?.selection, "draw", "#4 is draw");
    }
}

// ── Summary ───────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
