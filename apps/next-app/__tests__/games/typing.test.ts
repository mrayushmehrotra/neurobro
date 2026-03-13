/**
 * Unit tests for Typing Speed game logic.
 * Mirrors the logic in app/games/typing/page.tsx.
 */

// ── Helpers (mirror of page logic) ───────────────────────────────────────────
const WORD_POOL =
    "the be to of and a in that have it for not on with he as you do at this " +
    "but his by from they we say her she or an will my one all would there their " +
    "what so up out if about who get which go me when make can like time no just " +
    "him know take people into year your some could them see other than then now look"
        .split(" ");

function generateWords(n: number): string[] {
    const result: string[] = [];
    const pool = [...WORD_POOL];
    while (result.length < n) {
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        result.push(...pool.slice(0, Math.min(pool.length, n - result.length)));
    }
    return result;
}

function computeStats(typedStr: string, targetText: string, elapsedMs: number) {
    let correct = 0, wrong = 0;
    for (let i = 0; i < typedStr.length; i++) {
        if (i < targetText.length && typedStr[i] === targetText[i]) correct++;
        else wrong++;
    }
    const minutes = Math.max(elapsedMs / 60000, 0.00001);
    const wpm = Math.round((correct / 5) / minutes);
    const accuracy =
        typedStr.length > 0 ? Math.round((correct / typedStr.length) * 100) : 100;
    return { wpm, accuracy, correct, wrong };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("generateWords", () => {
    test("generates exactly n words", () => {
        expect(generateWords(10)).toHaveLength(10);
        expect(generateWords(50)).toHaveLength(50);
        expect(generateWords(250)).toHaveLength(250);
    });

    test("all words are non-empty strings", () => {
        const words = generateWords(100);
        words.forEach((w) => {
            expect(typeof w).toBe("string");
            expect(w.length).toBeGreaterThan(0);
        });
    });

    test("all words come from the pool", () => {
        const words = generateWords(50);
        words.forEach((w) => {
            expect(WORD_POOL).toContain(w);
        });
    });

    test("generates different sequences each call (randomised)", () => {
        const a = generateWords(20).join(" ");
        const b = generateWords(20).join(" ");
        // With 20 words from a 50+ pool the chance of identical order is negligible
        expect(a).not.toBe(b);
    });

    test("handles n=1 correctly", () => {
        const words = generateWords(1);
        expect(words).toHaveLength(1);
        expect(WORD_POOL).toContain(words[0]);
    });
});

describe("computeStats", () => {
    const target = "hello world test";

    test("100% correct → accuracy 100, correct = typed length", () => {
        const stats = computeStats("hello world test", target, 60000);
        expect(stats.accuracy).toBe(100);
        expect(stats.correct).toBe(16);
        expect(stats.wrong).toBe(0);
    });

    test("WPM: 60 correct chars in 60 s = 12 wpm (60/5 = 12)", () => {
        // 60 correct chars / 5 / 1 minute = 12 wpm
        const target60 = "a".repeat(60);
        const stats = computeStats("a".repeat(60), target60, 60000);
        expect(stats.wpm).toBe(12);
    });

    test("WPM scales with time — same chars, half the time → double WPM", () => {
        const t = "hello world hello world hello";
        const slow = computeStats(t, t, 60000);
        const fast = computeStats(t, t, 30000);
        expect(fast.wpm).toBeCloseTo(slow.wpm * 2, 0);
    });

    test("entirely wrong input → 0% accuracy, 0 correct", () => {
        const stats = computeStats("xxxxx", target, 60000);
        expect(stats.accuracy).toBe(0);
        expect(stats.correct).toBe(0);
        expect(stats.wrong).toBe(5);
    });

    test("empty typed string → 100% accuracy (no mistakes yet)", () => {
        const stats = computeStats("", target, 60000);
        expect(stats.accuracy).toBe(100);
        expect(stats.wpm).toBe(0);
    });

    test("partially correct → correct accuracy calculation", () => {
        // "hello" — 3 right, 2 wrong
        const stats = computeStats("helXX", "hello", 60000);
        expect(stats.correct).toBe(3);
        expect(stats.wrong).toBe(2);
        expect(stats.accuracy).toBe(60);
    });

    test("WPM is always non-negative", () => {
        const stats = computeStats("wrong answer", target, 60000);
        expect(stats.wpm).toBeGreaterThanOrEqual(0);
    });
});
