/**
 * Unit tests for Memory Match game logic.
 * Mirrors the logic in app/games/memory/page.tsx.
 */

const EMOJI_POOL = [
    "🧠", "⚡", "🔥", "🎯", "💡", "🚀", "🌊", "🎲", "🦁", "🐬",
    "🌈", "🍀", "🎸", "🏆", "💎", "🌙", "🦋", "🍕", "🎭", "⚽",
    "🌺", "🦊", "🍓", "🎪", "🔮", "🧩", "🎨", "🦄", "🌴", "🍦",
    "🚂", "🎵", "🌸", "🦅", "🍉", "💫", "🏄", "🎠", "🌟", "🐉",
];

interface Card { id: number; emoji: string; matched: boolean; flipped: boolean; }

function buildDeck(pairs: number): Card[] {
    const emojis = EMOJI_POOL.slice(0, pairs);
    const doubled = [...emojis, ...emojis];
    for (let i = doubled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [doubled[i], doubled[j]] = [doubled[j], doubled[i]];
    }
    return doubled.map((emoji, i) => ({ id: i, emoji, matched: false, flipped: false }));
}

function fmtMs(ms: number) { return `${(ms / 1000).toFixed(2)}s`; }

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("buildDeck", () => {
    test("creates a deck with exactly pairs * 2 cards", () => {
        expect(buildDeck(8)).toHaveLength(16);
        expect(buildDeck(12)).toHaveLength(24);
        expect(buildDeck(18)).toHaveLength(36);
    });

    test("contains exactly two of each emoji", () => {
        const pairs = 8;
        const deck = buildDeck(pairs);
        const counts: Record<string, number> = {};

        deck.forEach(card => {
            counts[card.emoji] = (counts[card.emoji] || 0) + 1;
        });

        Object.values(counts).forEach(count => {
            expect(count).toBe(2);
        });
        expect(Object.keys(counts)).toHaveLength(pairs);
    });

    test("cards have unique, sequential IDs", () => {
        const deck = buildDeck(8);
        deck.forEach((card, i) => {
            expect(card.id).toBe(i);
        });
    });

    test("deck is shuffled (probabilistic)", () => {
        const pairs = 12;
        const deckA = buildDeck(pairs).map(c => c.emoji).join("");
        const deckB = buildDeck(pairs).map(c => c.emoji).join("");
        expect(deckA).not.toBe(deckB);
    });

    test("initial state of cards is not matched and not flipped", () => {
        const deck = buildDeck(8);
        deck.forEach(card => {
            expect(card.matched).toBe(false);
            expect(card.flipped).toBe(false);
        });
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
