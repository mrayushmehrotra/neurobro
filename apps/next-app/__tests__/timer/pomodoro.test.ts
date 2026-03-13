/**
 * Unit tests for Pomodoro timer logic.
 * Mirrors the logic in app/timer/pomodoro/page.tsx.
 */

type SessionType = "focus" | "short" | "long";

function nextSession(type: SessionType, completedFocus: number): SessionType {
    if (type !== "focus") return "focus";
    return completedFocus > 0 && completedFocus % 4 === 0 ? "long" : "short";
}

function pad(n: number): string {
    return String(n).padStart(2, "0");
}

function fmtCountdown(ms: number): string {
    const m = Math.floor(ms / 60_000);
    const s = Math.floor((ms % 60_000) / 1000);
    return `${pad(m)}:${pad(s)}`;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("nextSession — session sequencing", () => {
    test("after focus with 1 completed session → short break", () => {
        expect(nextSession("focus", 1)).toBe("short");
    });

    test("after focus with 2 completed sessions → short break", () => {
        expect(nextSession("focus", 2)).toBe("short");
    });

    test("after focus with 3 completed sessions → short break", () => {
        expect(nextSession("focus", 3)).toBe("short");
    });

    test("after focus with 4 completed sessions → long break (milestone)", () => {
        expect(nextSession("focus", 4)).toBe("long");
    });

    test("after focus with 8 completed sessions → long break (2nd cycle)", () => {
        expect(nextSession("focus", 8)).toBe("long");
    });

    test("after focus with 12 completed sessions → long break (3rd cycle)", () => {
        expect(nextSession("focus", 12)).toBe("long");
    });

    test("after short break → always returns focus", () => {
        expect(nextSession("short", 0)).toBe("focus");
        expect(nextSession("short", 4)).toBe("focus");
        expect(nextSession("short", 10)).toBe("focus");
    });

    test("after long break → always returns focus", () => {
        expect(nextSession("long", 0)).toBe("focus");
        expect(nextSession("long", 4)).toBe("focus");
    });

    test("completedFocus=0 after focus → short (no completed sessions yet)", () => {
        expect(nextSession("focus", 0)).toBe("short");
    });

    test("standard 4-session cycle produces correct sequence", () => {
        const sequence: SessionType[] = [];
        let current: SessionType = "focus";
        let focused = 0;

        for (let round = 0; round < 8; round++) {
            sequence.push(current);
            if (current === "focus") focused++;
            current = nextSession(current, focused);
        }

        // focus, short, focus, short, focus, short, focus, long
        expect(sequence).toEqual([
            "focus", "short",
            "focus", "short",
            "focus", "short",
            "focus", "long",
        ]);
    });
});

describe("fmtCountdown — time formatting", () => {
    test("formats 0 ms as 00:00", () => {
        expect(fmtCountdown(0)).toBe("00:00");
    });

    test("formats 1 minute exactly as 01:00", () => {
        expect(fmtCountdown(60_000)).toBe("01:00");
    });

    test("formats 25 minutes as 25:00", () => {
        expect(fmtCountdown(25 * 60_000)).toBe("25:00");
    });

    test("formats 90 seconds as 01:30", () => {
        expect(fmtCountdown(90_000)).toBe("01:30");
    });

    test("formats 5 minutes 5 seconds as 05:05 (zero-padded)", () => {
        expect(fmtCountdown(5 * 60_000 + 5_000)).toBe("05:05");
    });

    test("ignores millisecond remainder", () => {
        expect(fmtCountdown(60_500)).toBe("01:00");
        expect(fmtCountdown(59_999)).toBe("00:59");
    });

    test("formats 1 hour correctly (60:00)", () => {
        expect(fmtCountdown(60 * 60_000)).toBe("60:00");
    });
});

describe("pad utility", () => {
    test("pads single digits with leading zero", () => {
        expect(pad(0)).toBe("00");
        expect(pad(5)).toBe("05");
        expect(pad(9)).toBe("09");
    });

    test("does not pad double digits", () => {
        expect(pad(10)).toBe("10");
        expect(pad(59)).toBe("59");
    });
});
