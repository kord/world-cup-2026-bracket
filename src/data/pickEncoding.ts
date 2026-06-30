import { FINAL_MATCH_ID } from "./knockoutFixtures";
import type { PicksStore } from "./useMatchPicks";

const XOR_KEY = [0x57, 0x43, 0x32, 0x30, 0x32, 0x36]; // "WC2026"

type KnockoutStore = Record<string, { selection: "home" | "away" | null; timestamp: number }>;

function encodeGS(gp: PicksStore): number[] {
    const bytes = Array(18).fill(0);
    for (let i = 1; i <= 72; i++) {
        const raw = gp[String(i)]?.selection;
        const pick = (raw as string) === "tie" ? "draw" : raw;
        const bits = pick === "home" ? 0 : pick === "draw" ? 1 : pick === "away" ? 2 : 3;
        const byteIdx = Math.floor((i - 1) / 4);
        const shift = 6 - ((i - 1) % 4) * 2;
        bytes[byteIdx] |= bits << shift;
    }
    return bytes;
}

function decodeGS(bytes: number[]): PicksStore {
    const picks: PicksStore = {};
    for (let i = 1; i <= 72; i++) {
        const byteIdx = Math.floor((i - 1) / 4);
        const shift = 6 - ((i - 1) % 4) * 2;
        const bits = (bytes[byteIdx] >> shift) & 3;
        if (bits === 0) picks[String(i)] = { selection: "home", timestamp: 0 };
        else if (bits === 1) picks[String(i)] = { selection: "draw", timestamp: 0 };
        else if (bits === 2) picks[String(i)] = { selection: "away", timestamp: 0 };
    }
    return picks;
}

function encodeKO(kp: KnockoutStore): { mask: number; data: number[] } {
    const data = Array(4).fill(0);
    let mask = 0;
    for (let i = 73; i <= FINAL_MATCH_ID; i++) {
        const pick = kp[String(i)]?.selection;
        if (pick == null) continue;
        const idx = i - 73;
        mask |= 1 << idx;
        if (pick === "away") { const bi = Math.floor(idx / 8); data[bi] |= 1 << (7 - (idx % 8)); }
    }
    return { mask, data };
}

function decodeKO(mask: number, data: number[]): KnockoutStore {
    const picks: KnockoutStore = {};
    for (let i = 73; i <= FINAL_MATCH_ID; i++) {
        const idx = i - 73;
        if (!(mask & (1 << idx))) continue;
        const bi = Math.floor(idx / 8);
        const bit = (data[bi] >> (7 - (idx % 8))) & 1;
        picks[String(i)] = { selection: bit === 1 ? "away" : "home", timestamp: 0 };
    }
    return picks;
}

export interface UnifiedPicks { name: string; gs: PicksStore; ko: KnockoutStore; }

export function encodePicks(name: string, gsPicks: PicksStore, koPicks: KnockoutStore): string {
    try {
        const e = new TextEncoder();
        const nb = Array.from(e.encode(name));
        if (nb.length > 255) throw new Error("Name too long");
        const gs = encodeGS(gsPicks);
        const { mask, data: kd } = encodeKO(koPicks);
        // Split 32-bit mask into 4 bytes (was a bug: stored as 1 byte, losing top 24 bits)
        const maskBytes = [(mask >>> 24) & 0xFF, (mask >>> 16) & 0xFF, (mask >>> 8) & 0xFF, mask & 0xFF];
        const bytes = new Uint8Array([nb.length, ...nb, ...gs, ...maskBytes, ...kd]);
        const obfuscated = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) obfuscated[i] = bytes[i] ^ XOR_KEY[i % XOR_KEY.length];
        let bin = "";
        for (let i = 0; i < obfuscated.length; i++) bin += String.fromCharCode(obfuscated[i]);
        // Use URL-safe base64 (no + or / in query params)
        return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    } catch (err) {
        console.error("[pickEncoding] encode failed:", { error: err, name });
        throw err;
    }
}

export function decodePicks(encoded: string): UnifiedPicks | null {
    try {
        // Convert URL-safe base64 back to standard
        let raw = encoded.trim();
        raw = raw.replace(/ /g, "+").replace(/-/g, "+").replace(/_/g, "/");
        while (raw.length % 4) raw += "=";
        raw = atob(raw);
        const bytes = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
        const deobfuscated = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) deobfuscated[i] = bytes[i] ^ XOR_KEY[i % XOR_KEY.length];
        const nameLen = deobfuscated[0];
        if (typeof nameLen !== "number" || nameLen < 0 || nameLen > 255 || !Number.isFinite(nameLen)) return null;
        if (deobfuscated.length < 1 + nameLen + 18) return null;
        const name = new TextDecoder().decode(deobfuscated.slice(1, 1 + nameLen));
        const gs = decodeGS(Array.from(deobfuscated.slice(1 + nameLen, 1 + nameLen + 18)));
        let ko: KnockoutStore = {};
        // 4-byte mask + 4-byte data = 8 bytes for KO
        if (deobfuscated.length >= 1 + nameLen + 26) {
            const mask = (deobfuscated[1 + nameLen + 18] << 24) | (deobfuscated[1 + nameLen + 19] << 16) | (deobfuscated[1 + nameLen + 20] << 8) | deobfuscated[1 + nameLen + 21];
            ko = decodeKO(mask, Array.from(deobfuscated.slice(1 + nameLen + 22, 1 + nameLen + 26)));
        }
        return { name, gs, ko };
    } catch (e) {
        console.error("[pickEncoding] decode failed:", { error: e, encoded: encoded.substring(0, 30) });
        return null;
    }
}

export function encodeGSPicks(name: string, picks: PicksStore): string { return encodePicks(name, picks, {}); }
export function decodeGSPicks(encoded: string): { name: string; picks: PicksStore } | null {
    const r = decodePicks(encoded); return r ? { name: r.name, picks: r.gs } : null;
}
