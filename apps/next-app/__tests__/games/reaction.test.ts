/**
 * Unit tests for Reaction Training game logic.
 * Mirrors the logic in app/games/reaction/page.tsx.
 */

const MIN_DELAY = 1500;
const MAX_DELAY = 5000;

function randDelay() { return MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY); }
function avg(arr: number[]) { return arr.length === 0 ? 0 : Math.round(arr.reduce((a, b) => a + b, 0) / arr.length); }

function getBand(ms: number) {
    if (ms < 150) return { label: "Superhuman", color: "#c084fc", emoji: "🏆" };
    if (ms < 200) return { label: "Elite", color: "#f5a623", emoji: "⚡" };
    if (ms < 250) return { label: "Excellent", color: "#34d399", emoji: "🔥" };
    if (ms < 300) return { label: "Good", color: "#38bdf8", emoji: "✅" };
    if (ms < 400) return { label: "Average", color: "rgba(255,255,255,0.6)", emoji: "👍" };
    return { label: "Keep Going", color: "rgba(255,255,255,0.4)", emoji: "💪" };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("avg calculation", () => {
    test("calculates the correct rounded average", () => {
        expect(avg([200, 300, 400])).toBe(300);
        expect(avg([150, 250])).toBe(200);
        expect(avg([100, 101])).toBe(101); // rounded 100.5
        expect(avg([100, 102])).toBe(101);
    });

    test("returns 0 for empty array", () => {
        expect(avg([])).toBe(0);
    });
});

describe("getBand classification", () => {
    test("classifies reaction times correctly", () => {
        expect(getBand(140).label).toBe("Superhuman");
        expect(getBand(190).label).toBe("Elite");
        expect(getBand(240).label).toBe("Excellent");
        expect(getBand(290).label).toBe("Good");
        expect(getBand(350).label).toBe("Average");
        expect(getBand(500).label).toBe("Keep Going");
    });
});

describe("randDelay helper", () => {
    test("returns a value within the delay range", () => {
        for (let i = 0; i < 100; i++) {
            const delay = randDelay();
            expect(delay).toBeGreaterThanOrEqual(MIN_DELAY);
            expect(delay).toBeLessThanOrEqual(MAX_DELAY);
        }
    });
});
