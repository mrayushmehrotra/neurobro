/**
 * Unit tests for Mental Math game logic.
 *
 * These functions are extracted here to keep tests self-contained and fast.
 * They mirror the exact logic in app/games/mental-math/page.tsx.
 */

// ── Helpers ──────────────────────────────────────────────────────────────────
function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function maxForDigits(digits: 1 | 2 | 3 | 4 | 5): number {
    return Math.pow(10, digits) - 1;
}

function minForDigits(digits: 1 | 2 | 3 | 4 | 5): number {
    return digits === 1 ? 1 : Math.pow(10, digits - 1);
}

type Op = "+" | "−" | "×" | "÷";
type Difficulty = "easy" | "medium" | "hard";
type OpMode = "all" | "add-sub" | "mul-div";
type Digits = 1 | 2 | 3 | 4 | 5;

const OP_MODES: { key: OpMode; ops: Op[] }[] = [
    { key: "all", ops: ["+", "−", "×", "÷"] },
    { key: "add-sub", ops: ["+", "−"] },
    { key: "mul-div", ops: ["×", "÷"] },
];

function makeQuestion(diff: Difficulty, streak: number, opMode: OpMode, digits: Digits) {
    const modeEntry = OP_MODES.find((m) => m.key === opMode)!;
    const availableOps =
        diff === "easy" ? modeEntry.ops.filter((o) => o !== "÷") : modeEntry.ops;
    const ops = availableOps.length > 0 ? availableOps : modeEntry.ops;
    const op = ops[Math.floor(Math.random() * ops.length)];

    const lo = minForDigits(digits);
    const hi = maxForDigits(digits);
    const scale = Math.min(Math.floor(streak / 4) + 1, 3);
    const scaledHi = Math.min(hi, lo + Math.floor((hi - lo) * (0.4 + scale * 0.2)));
    const capB = digits >= 3 ? Math.min(scaledHi, 99) : scaledHi;

    let a: number, b: number, answer: number;
    switch (op) {
        case "+": a = randInt(lo, scaledHi); b = randInt(lo, scaledHi); answer = a + b; break;
        case "−": a = randInt(lo, scaledHi); b = randInt(lo, a); answer = a - b; break;
        case "×": a = randInt(lo, scaledHi); b = randInt(2, Math.max(2, capB)); answer = a * b; break;
        default: b = randInt(2, Math.max(2, capB)); answer = randInt(lo, scaledHi); a = b * answer; break;
    }
    return { a, b, op, answer, display: `${a} ${op} ${b}` };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("randInt", () => {
    test("returns a value within [min, max]", () => {
        for (let i = 0; i < 200; i++) {
            const v = randInt(5, 15);
            expect(v).toBeGreaterThanOrEqual(5);
            expect(v).toBeLessThanOrEqual(15);
        }
    });

    test("returns an integer", () => {
        for (let i = 0; i < 50; i++) {
            expect(Number.isInteger(randInt(0, 100))).toBe(true);
        }
    });

    test("can return exactly min and max", () => {
        const values = new Set(Array.from({ length: 10000 }, () => randInt(1, 2)));
        expect(values.has(1)).toBe(true);
        expect(values.has(2)).toBe(true);
    });
});

describe("minForDigits / maxForDigits", () => {
    const cases: [Digits, number, number][] = [
        [1, 1, 9],
        [2, 10, 99],
        [3, 100, 999],
        [4, 1000, 9999],
        [5, 10000, 99999],
    ];

    test.each(cases)("%i digit(s) → min=%i, max=%i", (d, expectedMin, expectedMax) => {
        expect(minForDigits(d)).toBe(expectedMin);
        expect(maxForDigits(d)).toBe(expectedMax);
    });
});

describe("makeQuestion", () => {
    const RUNS = 500;

    describe("arithmetic correctness", () => {
        test("addition answer is always a + b", () => {
            let checked = 0;
            for (let i = 0; i < RUNS; i++) {
                const q = makeQuestion("medium", 0, "add-sub", 1);
                if (q.op === "+") {
                    expect(q.answer).toBe(q.a + q.b);
                    checked++;
                }
            }
            expect(checked).toBeGreaterThan(0);
        });

        test("subtraction answer is always a − b (non-negative)", () => {
            let checked = 0;
            for (let i = 0; i < RUNS; i++) {
                const q = makeQuestion("medium", 0, "add-sub", 2);
                if (q.op === "−") {
                    expect(q.answer).toBe(q.a - q.b);
                    expect(q.answer).toBeGreaterThanOrEqual(0);
                    checked++;
                }
            }
            expect(checked).toBeGreaterThan(0);
        });

        test("multiplication answer is always a × b", () => {
            let checked = 0;
            for (let i = 0; i < RUNS; i++) {
                const q = makeQuestion("medium", 0, "mul-div", 1);
                if (q.op === "×") {
                    expect(q.answer).toBe(q.a * q.b);
                    checked++;
                }
            }
            expect(checked).toBeGreaterThan(0);
        });

        test("division: a ÷ b = answer (no remainder)", () => {
            let checked = 0;
            for (let i = 0; i < RUNS; i++) {
                const q = makeQuestion("hard", 0, "mul-div", 1);
                if (q.op === "÷") {
                    expect(q.a % q.b).toBe(0);
                    expect(q.answer).toBe(q.a / q.b);
                    checked++;
                }
            }
            expect(checked).toBeGreaterThan(0);
        });
    });

    describe("op mode filtering", () => {
        test("add-sub mode never produces × or ÷", () => {
            for (let i = 0; i < RUNS; i++) {
                const q = makeQuestion("hard", 0, "add-sub", 1);
                expect(["×", "÷"]).not.toContain(q.op);
            }
        });

        test("mul-div mode never produces + or −", () => {
            for (let i = 0; i < RUNS; i++) {
                const q = makeQuestion("hard", 0, "mul-div", 1);
                expect(["+", "−"]).not.toContain(q.op);
            }
        });

        test("easy difficulty never produces ÷", () => {
            for (let i = 0; i < RUNS; i++) {
                const q = makeQuestion("easy", 0, "all", 1);
                expect(q.op).not.toBe("÷");
            }
        });
    });

    describe("digit range", () => {
        test("1-digit: both operands ≥ 1 and ≤ 9 (for + and −)", () => {
            for (let i = 0; i < RUNS; i++) {
                const q = makeQuestion("medium", 0, "add-sub", 1);
                expect(q.a).toBeGreaterThanOrEqual(1);
                expect(q.a).toBeLessThanOrEqual(9);
            }
        });

        test("2-digit: lead operand ≥ 10", () => {
            let checked = 0;
            for (let i = 0; i < RUNS; i++) {
                const q = makeQuestion("medium", 0, "add-sub", 2);
                expect(q.a).toBeGreaterThanOrEqual(10);
                checked++;
            }
            expect(checked).toBe(RUNS);
        });
    });

    describe("display string", () => {
        test("display includes op symbol and both numbers", () => {
            for (let i = 0; i < 50; i++) {
                const q = makeQuestion("medium", 0, "all", 1);
                expect(q.display).toContain(String(q.a));
                expect(q.display).toContain(String(q.b));
                expect(q.display).toContain(q.op);
            }
        });
    });
});
