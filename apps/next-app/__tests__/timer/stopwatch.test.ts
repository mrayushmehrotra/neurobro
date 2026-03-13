/**
 * Unit tests for Stopwatch helper functions.
 * Mirrors helpers in app/timer/stopwatch/page.tsx.
 */

function pad(n: number, len = 2): string {
    return String(n).padStart(len, "0");
}

function fmtMs(ms: number): string {
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    const s = Math.floor((ms % 60_000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`;
    return `${pad(m)}:${pad(s)}.${pad(cs)}`;
}

function fmtLap(ms: number): string {
    const m = Math.floor(ms / 60_000);
    const s = Math.floor((ms % 60_000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${pad(m)}:${pad(s)}.${pad(cs)}`;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("fmtMs — stopwatch display", () => {
    test("zero", () => {
        expect(fmtMs(0)).toBe("00:00.00");
    });

    test("1 second", () => {
        expect(fmtMs(1000)).toBe("00:01.00");
    });

    test("1 minute", () => {
        expect(fmtMs(60_000)).toBe("01:00.00");
    });

    test("sub-second centiseconds", () => {
        expect(fmtMs(550)).toBe("00:00.55");
    });

    test("mixed: 1m 23.45s", () => {
        expect(fmtMs(60_000 + 23_000 + 450)).toBe("01:23.45");
    });

    test("shows hours when >= 1 hour", () => {
        expect(fmtMs(3_600_000)).toBe("01:00:00.00");
    });

    test("does NOT show hours column when < 1 hour (only 2 colon-parts)", () => {
        // Output is "59:59.99" — 2-part (mm:ss.cs), not 3-part (hh:mm:ss.cs)
        expect(fmtMs(3_599_999).split(":")).toHaveLength(2);
    });

    test("10 ms shows as .01 centiseconds", () => {
        expect(fmtMs(10)).toBe("00:00.01");
    });
});

describe("fmtLap — lap time display", () => {
    test("formats like fmtMs but always mm:ss.cs", () => {
        expect(fmtLap(0)).toBe("00:00.00");
        expect(fmtLap(1000)).toBe("00:01.00");
        expect(fmtLap(60_000)).toBe("01:00.00");
        expect(fmtLap(5_000 + 250)).toBe("00:05.25");
    });

    test("does not include hours column even for long laps", () => {
        // > 1 hour lap — still mm:ss.cs
        expect(fmtLap(3_600_000).split(":")).toHaveLength(2);
    });
});

describe("pad helper", () => {
    test("default length 2, pads with zeros", () => {
        expect(pad(0)).toBe("00");
        expect(pad(1)).toBe("01");
        expect(pad(10)).toBe("10");
    });

    test("custom length", () => {
        expect(pad(5, 3)).toBe("005");
        expect(pad(42, 4)).toBe("0042");
    });

    test("does not truncate numbers longer than pad length", () => {
        expect(pad(123, 2)).toBe("123");
    });
});
