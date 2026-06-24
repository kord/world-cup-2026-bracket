/**
 * Encode/decode knockout-round picks into shareable strings.
 * 32 matches (IDs 73–104), 1 bit per match (0=home, 1=away, unset omitted).
 */
import type { KnockoutPick } from "./useKnockoutPicks";

const XOR_KEY = [0x4B, 0x4F, 0x32, 0x30, 0x32, 0x36]; // "KO2026"

type KnockoutStore = Record<string, { selection: KnockoutPick; timestamp: number }>;

function xor(bytes: number[]): number[] {
    return bytes.map((b, i) => b ^ XOR_KEY[i % XOR_KEY.length]);
}

/** Encode name + knockout picks into a shareable string. */
export function encodeKnockoutPicks(name: string, picks: KnockoutStore): string {
    const encoder = new TextEncoder();
    const nameBytes = Array.from(encoder.encode(name));
    if (nameBytes.length > 255) throw new Error("Name too long");

    const bytes: number[] = [nameBytes.length, ...nameBytes];

    // Pack 32 matches into 4 bytes (8 matches per byte, 1 bit each)
    const pickBytes: number[] = Array(4).fill(0);
    for (let i = 73; i <= 104; i++) {
        const pick = picks[String(i)]?.selection;
        const bit = pick === "away" ? 1 : 0;
        const idx = i - 73;
        const byteIdx = Math.floor(idx / 8);
        const shift = 7 - (idx % 8);
        pickBytes[byteIdx] |= bit << shift;
    }

    bytes.push(...pickBytes);

    const obfuscated = xor(bytes);
    const binary = String.fromCharCode(...obfuscated);
    return btoa(binary);
}

/** Decode a knockout pick string. Returns null if invalid. */
export function decodeKnockoutPicks(encoded: string): { name: string; picks: KnockoutStore } | null {
    try {
        const binary = atob(encoded.trim());
        const bytes = Array.from(binary, c => c.charCodeAt(0));
        const deobfuscated = xor(bytes);

        const nameLen = deobfuscated[0];
        if (typeof nameLen !== "number" || nameLen < 0 || nameLen > 255 || !Number.isFinite(nameLen)) {
            console.error("[knockoutEncoding] decode failed: invalid name length", { nameLen, byteLength: deobfuscated.length });
            return null;
        }
        if (deobfuscated.length < 1 + nameLen + 4) {
            console.error("[knockoutEncoding] decode failed: string too short", { nameLen, byteLength: deobfuscated.length, expected: 1 + nameLen + 4 });
            return null;
        }

        const nameBytes = deobfuscated.slice(1, 1 + nameLen);
        const decoder = new TextDecoder();
        const name = decoder.decode(new Uint8Array(nameBytes));

        const pickBytes = deobfuscated.slice(1 + nameLen, 1 + nameLen + 4);
        const picks: KnockoutStore = {};
        for (let i = 73; i <= 104; i++) {
            const idx = i - 73;
            const byteIdx = Math.floor(idx / 8);
            const shift = 7 - (idx % 8);
            const bit = (pickBytes[byteIdx] >> shift) & 1;
            if (bit === 1) picks[String(i)] = { selection: "away", timestamp: 0 };
            else picks[String(i)] = { selection: "home", timestamp: 0 };
        }

        return { name, picks };
    } catch (e) {
        console.error("[knockoutEncoding] decode failed:", { error: e, encoded: encoded.substring(0, 30) });
        return null;
    }
}
