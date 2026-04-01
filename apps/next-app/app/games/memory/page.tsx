
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameShell from "@/components/GameShell";
import { GameTimerHandle } from "@/components/GameTimer";

// ── Emoji pool ──────────────────────────────────────────────────────────────
const EMOJI_POOL = [
    "🧠", "⚡", "🔥", "🎯", "💡", "🚀", "🌊", "🎲", "🦁", "🐬",
    "🌈", "🍀", "🎸", "🏆", "💎", "🌙", "🦋", "🍕", "🎭", "⚽",
    "🌺", "🦊", "🍓", "🎪", "🔮", "🧩", "🎨", "🦄", "🌴", "🍦",
    "🚂", "🎵", "🌸", "🦅", "🍉", "💫", "🏄", "🎠", "🌟", "🐉",
];

const GRID_OPTIONS = [
    { label: "4 × 4", cols: 4, pairs: 8 },
    { label: "5 × 5", cols: 5, pairs: 12 },
    { label: "6 × 6", cols: 6, pairs: 18 },
    { label: "7 × 7", cols: 7, pairs: 24 },
    { label: "8 × 8", cols: 8, pairs: 32 },
    { label: "9 × 9", cols: 9, pairs: 40 },
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

export default function MemoryGame() {
    const [phase, setPhase] = useState<"select" | "playing" | "done">("select");
    const [gridOpt, setGridOpt] = useState(GRID_OPTIONS[0]);
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedIds, setFlippedIds] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [matchedCount, setMatchedCount] = useState(0);
    const [running, setRunning] = useState(false);
    const [bestTimes, setBestTimes] = useState<Record<string, number>>({});
    const [finalTime, setFinalTime] = useState(0);
    const timerRef = useRef<GameTimerHandle>(null);
    const lockRef = useRef(false);

    useEffect(() => {
        try { const s = localStorage.getItem("nb_memory_best_v2"); if (s) setBestTimes(JSON.parse(s)); } catch { }
    }, []);

    const startGame = useCallback((opt: typeof GRID_OPTIONS[0]) => {
        setGridOpt(opt);
        setCards(buildDeck(opt.pairs));
        setFlippedIds([]);
        setMoves(0);
        setMatchedCount(0);
        setRunning(false);
        setFinalTime(0);
        timerRef.current?.reset();
        lockRef.current = false;
        setPhase("playing");
    }, []);

    const handleCardClick = useCallback((id: number) => {
        if (lockRef.current || phase !== "playing") return;
        const card = cards[id];
        if (card.matched || card.flipped) return;
        if (flippedIds.includes(id)) return;
        if (!running) setRunning(true);

        const newCards = cards.map((c) => (c.id === id ? { ...c, flipped: true } : c));
        setCards(newCards);
        const newFlipped = [...flippedIds, id];

        if (newFlipped.length === 2) {
            lockRef.current = true;
            setMoves((m) => m + 1);
            const [a, b] = newFlipped;

            if (newCards[a].emoji === newCards[b].emoji) {
                const afterMatch = newCards.map((c) =>
                    c.id === a || c.id === b ? { ...c, matched: true, flipped: false } : c
                );
                setCards(afterMatch);
                setFlippedIds([]);
                const newCount = matchedCount + 1;
                setMatchedCount(newCount);
                lockRef.current = false;

                if (newCount === gridOpt.pairs) {
                    setRunning(false);
                    const elapsed = timerRef.current?.getElapsed() ?? 0;
                    setFinalTime(elapsed);
                    setPhase("done");
                    setBestTimes((prev) => {
                        const key = gridOpt.label;
                        const nb = prev[key] == null ? elapsed : Math.min(prev[key], elapsed);
                        const upd = { ...prev, [key]: nb };
                        localStorage.setItem("nb_memory_best_v2", JSON.stringify(upd));
                        return upd;
                    });
                }
            } else {
                setFlippedIds([]);
                setTimeout(() => {
                    setCards((prev) =>
                        prev.map((c) => (c.id === a || c.id === b ? { ...c, flipped: false } : c))
                    );
                    lockRef.current = false;
                }, 900);
            }
            setFlippedIds([]);
        } else {
            setFlippedIds(newFlipped);
        }
    }, [cards, flippedIds, matchedCount, gridOpt, phase, running]);

    // card aesthetics
    const cardSize =
        gridOpt.cols <= 4 ? "w-[72px] h-[72px] sm:w-20 sm:h-20" :
            gridOpt.cols <= 5 ? "w-14 h-14 sm:w-16 sm:h-16" :
                gridOpt.cols <= 6 ? "w-12 h-12 sm:w-14 sm:h-14" :
                    gridOpt.cols <= 7 ? "w-10 h-10 sm:w-12 sm:h-12" :
                        gridOpt.cols <= 8 ? "w-9 h-9 sm:w-11 sm:h-11" : "w-8 h-8 sm:w-10 sm:h-10";

    const emojiSize =
        gridOpt.cols <= 4 ? "text-2xl sm:text-3xl" :
            gridOpt.cols <= 5 ? "text-xl sm:text-2xl" :
                gridOpt.cols <= 6 ? "text-lg sm:text-xl" :
                    gridOpt.cols <= 7 ? "text-base sm:text-lg" : "text-sm sm:text-base";

    const isNewBest = phase === "done" && bestTimes[gridOpt.label] === finalTime;

    return (
        <GameShell
            title="Memory Match"
            emoji="🃏"
            accentColor="rgba(245,166,35,0.2)"
            timerRef={timerRef}
            timerMode="up"
            timerRunning={running}
            badge={
                phase !== "select" ? (
                    <span className="nb-badge text-amber-400/80" style={{ background: "rgba(245,166,35,0.1)", borderColor: "rgba(245,166,35,0.2)" }}>
                        {gridOpt.label}
                    </span>
                ) : undefined
            }
            headerRight={
                phase !== "select" ? (
                    <button onClick={() => setPhase("select")} className="nb-btn-ghost text-xs px-3 py-1.5">
                        Change Grid
                    </button>
                ) : undefined
            }
        >

            {/* ── Grid Selector ── */}
            {phase === "select" && (
                <div className="w-full max-w-lg space-y-8 animate-nb-scale-in">
                    <div className="text-center">
                        <div className="text-6xl mb-4 animate-nb-float">🃏</div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Memory Match</h2>
                        <p className="text-sm sm:text-base" style={{ color: "rgba(255,255,255,0.45)" }}>
                            Choose your grid size — more pairs means more challenge!
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 nb-stagger">
                        {GRID_OPTIONS.map((opt) => {
                            const best = bestTimes[opt.label];
                            return (
                                <button key={opt.label} onClick={() => startGame(opt)}
                                    className="nb-select-card group relative overflow-hidden"
                                    style={{ border: "1px solid rgba(245,166,35,0.18)" }}>
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        style={{ background: "linear-gradient(135deg, rgba(245,166,35,0.08), transparent)" }} />
                                    <div className="relative">
                                        <div className="text-xl font-bold font-mono nb-gradient-text mb-1">{opt.label}</div>
                                        <div className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>{opt.pairs} pairs</div>
                                        {best ? (
                                            <div className="text-xs text-emerald-400 font-mono font-semibold">🏆 {fmtMs(best)}</div>
                                        ) : (
                                            <div className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>No record yet</div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Playing ── */}
            {phase === "playing" && (
                <div className="w-full flex flex-col items-center gap-4 sm:gap-6 animate-nb-scale-in">
                    {/* Stats row */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="nb-stat">
                            <span className="nb-stat-value text-white">{moves}</span>
                            <span className="nb-stat-label">moves</span>
                        </div>
                        <div className="nb-stat">
                            <span className="nb-stat-value text-emerald-400">
                                {matchedCount}<span className="text-white/20 text-sm">/{gridOpt.pairs}</span>
                            </span>
                            <span className="nb-stat-label">pairs</span>
                        </div>
                        {bestTimes[gridOpt.label] && (
                            <div className="nb-stat">
                                <span className="nb-stat-value text-amber-400 text-base">{fmtMs(bestTimes[gridOpt.label])}</span>
                                <span className="nb-stat-label">best</span>
                            </div>
                        )}
                    </div>

                    {/* Grid */}
                    <div className="grid gap-2 sm:gap-2.5"
                        style={{ gridTemplateColumns: `repeat(${gridOpt.cols}, minmax(0, 1fr))` }}>
                        {cards.map((card) => (
                            <button
                                key={card.id}
                                onClick={() => handleCardClick(card.id)}
                                className={`
                  ${cardSize} rounded-xl relative overflow-hidden
                  transition-all duration-200 font-bold
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50
                  ${card.matched
                                        ? "cursor-default scale-95"
                                        : card.flipped
                                            ? "scale-105"
                                            : "hover:scale-105 cursor-pointer"
                                    }
                `}
                                style={
                                    card.matched
                                        ? { background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }
                                        : card.flipped
                                            ? { background: "rgba(245,166,35,0.2)", border: "1px solid rgba(245,166,35,0.5)", boxShadow: "0 0 16px rgba(245,166,35,0.2)" }
                                            : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }
                                }
                            >
                                <span
                                    className={`absolute inset-0 flex items-center justify-center ${emojiSize}
                    transition-all duration-200
                    ${card.flipped || card.matched ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
                                >
                                    {card.emoji}
                                </span>
                                {!card.flipped && !card.matched && (
                                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                                        style={{ color: "rgba(255,255,255,0.12)" }}>?</span>
                                )}
                                {card.matched && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className={`${emojiSize}`}>{card.emoji}</span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    <button onClick={() => startGame(gridOpt)} className="nb-btn-ghost text-xs mt-2">
                        ↺ Restart
                    </button>
                </div>
            )}

            {/* ── Done ── */}
            {phase === "done" && (
                <div className="w-full max-w-sm text-center space-y-6 animate-nb-bounce-in">
                    <div>
                        <div className="text-6xl mb-3">🎉</div>
                        <h2 className="text-3xl font-bold nb-gradient-text">You Won!</h2>
                    </div>

                    <div className="nb-glass rounded-2xl p-5 space-y-3">
                        {[
                            { label: "Grid", value: gridOpt.label, color: "text-white" },
                            { label: "Time", value: fmtMs(finalTime), color: "text-amber-400" },
                            { label: "Moves", value: String(moves), color: "text-white" },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="flex items-center justify-between">
                                <span className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</span>
                                <span className={`font-mono font-bold text-lg ${color}`}>{value}</span>
                            </div>
                        ))}
                        {isNewBest && (
                            <div className="pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                                <span className="text-emerald-400 text-sm font-semibold">✨ New Personal Best!</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 justify-center">
                        <button onClick={() => startGame(gridOpt)} className="nb-btn-primary">Play Again</button>
                        <button onClick={() => setPhase("select")} className="nb-btn-ghost">Change Grid</button>
                    </div>
                </div>
            )}
        </GameShell>
    );
}
