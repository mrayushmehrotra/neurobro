/**
 * Unit tests for Schulte Table game logic.
 * Mirrors the logic in app/games/schulte/page.tsx.
 */

function buildGrid(size: number): number[] {
    const nums = Array.from({ length: size * size }, (_, i) => i + 1);
    for (let i = nums.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    return nums;
}

function fmtMs(ms: number) { return `${(ms / 1000).toFixed(2)}s`; }

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("buildGrid", () => {
    test("creates a grid with exactly size * size numbers", () => {
        expect(buildGrid(3)).toHaveLength(9);
        expect(buildGrid(4)).toHaveLength(16);
        expect(buildGrid(5)).toHaveLength(25);
    });

    test("contains all numbers from 1 to size * size", () => {
        const size = 3;
        const grid = buildGrid(size);
        const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9];

        expect(grid.sort((a, b) => a - b)).toEqual(expected);
    });

    test("grid is shuffled (probabilistic)", () => {
        const size = 5;
        const gridA = buildGrid(size).join(",");
        const gridB = buildGrid(size).join(",");
        expect(gridA).not.toBe(gridB);
    });
});

describe("fmtMs formatting", () => {
    test("formats milliseconds to seconds with 2 decimal places", () => {
        expect(fmtMs(1000)).toBe("1.00s");
        expect(fmtMs(1500)).toBe("1.50s");
        expect(fmtMs(1234)).toBe("1.23s");
        expect(fmtMs(0)).toBe("0.00s");
    });
});

describe("Schulte Progress helper", () => {
    test("calculates progress percentage correctly", () => {
        const size = 5; // 25 total
        const total = size * size;

        const calc = (next: number) => Math.round(((next - 1) / total) * 100);

        expect(calc(1)).toBe(0);
        expect(calc(26)).toBe(100);
        expect(calc(13)).toBe(48); // 12/25 * 100 = 48
    });
});
