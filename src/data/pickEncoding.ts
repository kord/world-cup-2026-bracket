import type { PicksStore } from "./useMatchPicks";

const XOR_KEY = [0x57, 0x43, 0x32, 0x30, 0x32, 0x36]; // "WC2026"

function xor(bytes: number[]): number[] {
    return bytes.map((b, i) => b ^ XOR_KEY[i % XOR_KEY.length]);
}

/**
 * Encode name + picks into an obfuscated shareable string.
 * Format: [nameLen:u8] [name:UTF-8] [18 pick bytes], XOR'd, then base64.
 */
export function encodePicks(name: string, picks: PicksStore): string {
    try {
        const encoder = new TextEncoder();
        const nameBytes = Array.from(encoder.encode(name));
        if (nameBytes.length > 255) throw new Error("Name too long");

        const bytes: number[] = [nameBytes.length, ...nameBytes];

        // Pack 72 matches into 18 bytes (4 matches per byte, 2 bits each)
        const pickBytes: number[] = Array(18).fill(0);
        for (let i = 1; i <= 72; i++) {
            const raw = picks[String(i)]?.selection;
            // Normalize legacy "tie" → "draw"
            const pick = raw === "tie" ? "draw" : raw;
            const bits = pick === "home" ? 0 : pick === "draw" ? 1 : pick === "away" ? 2 : 3;
            const byteIdx = Math.floor((i - 1) / 4);
            const shift = 6 - ((i - 1) % 4) * 2;
            pickBytes[byteIdx] |= bits << shift;
        }

        bytes.push(...pickBytes);

        const obfuscated = xor(bytes);
        const binary = String.fromCharCode(...obfuscated);
        return btoa(binary);
    } catch (e) {
        console.error("[pickEncoding] encode failed:", {
            error: e,
            name,
            nameLength: name.length,
            pickCount: Object.keys(picks).length,
        });
        throw e;
    }
}

/**
 * Decode an obfuscated share string back into { name, picks }.
 * Returns null if the string is invalid.
 */
export function decodePicks(encoded: string): { name: string; picks: PicksStore } | null {
    try {
        const binary = atob(encoded.trim());
        const bytes = Array.from(binary, c => c.charCodeAt(0));
        const deobfuscated = xor(bytes);

        const nameLen = deobfuscated[0];
        if (typeof nameLen !== "number" || nameLen < 0 || nameLen > 255 || !Number.isFinite(nameLen)) {
            console.error("[pickEncoding] decode failed: invalid name length", { nameLen, byteLength: deobfuscated.length, encoded: encoded.substring(0, 20) + "…" });
            return null;
        }
        if (deobfuscated.length < 1 + nameLen + 18) {
            console.error("[pickEncoding] decode failed: string too short", { nameLen, byteLength: deobfuscated.length, expected: 1 + nameLen + 18, encoded: encoded.substring(0, 20) + "…" });
            return null;
        }

        const nameBytes = deobfuscated.slice(1, 1 + nameLen);
        const decoder = new TextDecoder();
        const name = decoder.decode(new Uint8Array(nameBytes));

        const pickBytes = deobfuscated.slice(1 + nameLen, 1 + nameLen + 18);
        const picks: PicksStore = {};
        for (let i = 1; i <= 72; i++) {
            const byteIdx = Math.floor((i - 1) / 4);
            const shift = 6 - ((i - 1) % 4) * 2;
            const bits = (pickBytes[byteIdx] >> shift) & 3;
            if (bits === 0) picks[String(i)] = { selection: "home", timestamp: 0 };
            else if (bits === 1) picks[String(i)] = { selection: "draw", timestamp: 0 };
            else if (bits === 2) picks[String(i)] = { selection: "away", timestamp: 0 };
        }
        return { name, picks };
    } catch (e) {
        console.error("[pickEncoding] decode failed:", {
            error: e,
            encoded: encoded.substring(0, 30) + (encoded.length > 30 ? "…" : ""),
            encodedLength: encoded.length,
        });
        return null;
    }
}
