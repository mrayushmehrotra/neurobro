

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameShell from "@/components/GameShell";

const ROUND_OPTIONS = [3, 5, 10];
const MIN_DELAY = 1500;
const MAX_DELAY = 5000;

type Phase = "select" | "waiting" | "ready" | "result" | "done";

interface RoundResult { round: number; ms: number | null; tooEarly: boolean; }

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

const FLASH_GRADIENTS = [
    { bg: "#f5a623", shadow: "rgba(245,166,35,0.6)" },
    { bg: "#8b5cf6", shadow: "rgba(139,92,246,0.6)" },
    { bg: "#10b981", shadow: "rgba(16,185,129,0.6)" },
    { bg: "#f43f5e", shadow: "rgba(244,63,94,0.6)" },
    { bg: "#38bdf8", shadow: "rgba(56,189,248,0.6)" },
    { bg: "#f97316", shadow: "rgba(249,115,22,0.6)" },
    { bg: "#a3e635", shadow: "rgba(163,230,53,0.6)" },
];

export default function ReactionGame() {
    const [phase, setPhase] = useState<Phase>("select");
    const [totalRounds, setTotalRounds] = useState(5);
    const [currentRound, setCurrentRound] = useState(1);
    const [results, setResults] = useState<RoundResult[]>([]);
    const [reactionStart, setReactionStart] = useState(0);
    const [lastResult, setLastResult] = useState<RoundResult | null>(null);
    const [flash, setFlash] = useState(FLASH_GRADIENTS[0]);
    const [bestAvg, setBestAvg] = useState<number | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const s = localStorage.getItem("nb_reaction_best_v2");
        if (s) setBestAvg(Number(s));
    }, []);

    const clearTimer = () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };

    const beginRound = useCallback((roundNum: number) => {
        setPhase("waiting");
        setLastResult(null);
        setFlash(FLASH_GRADIENTS[Math.floor(Math.random() * FLASH_GRADIENTS.length)]);
        clearTimer();
        timeoutRef.current = setTimeout(() => {
            setReactionStart(Date.now());
            setPhase("ready");
        }, randDelay());
    }, []);

    const startGame = useCallback((rounds: number) => {
        clearTimer();
        setTotalRounds(rounds);
        setCurrentRound(1);
        setResults([]);
        setLastResult(null);
        beginRound(1);
    }, [beginRound]);

    const handleTap = useCallback(() => {
        if (phase === "waiting") {
            clearTimer();
            setLastResult({ round: currentRound, ms: null, tooEarly: true });
            setPhase("result");
            return;
        }
        if (phase === "ready") {
            const ms = Date.now() - reactionStart;
            const result: RoundResult = { round: currentRound, ms, tooEarly: false };
            setLastResult(result);
            const newResults = [...results, result];
            setResults(newResults);
            if (currentRound >= totalRounds) {
                const valid = newResults.filter((r) => !r.tooEarly && r.ms != null).map((r) => r.ms as number);
                const average = avg(valid);
                setBestAvg((prev) => {
                    const nb = prev === null ? average : Math.min(prev, average);
                    localStorage.setItem("nb_reaction_best_v2", String(nb));
                    return nb;
                });
                setPhase("done");
            } else {
                setPhase("result");
            }
        }
    }, [phase, currentRound, reactionStart, results, totalRounds]);

    const goNext = useCallback(() => {
        const next = currentRound + 1;
        setCurrentRound(next);
        beginRound(next);
    }, [currentRound, beginRound]);

    const retry = useCallback(() => beginRound(currentRound), [currentRound, beginRound]);

    const validTimes = results.filter((r) => !r.tooEarly && r.ms != null).map((r) => r.ms as number);
    const average = avg(validTimes);
    const best = validTimes.length > 0 ? Math.min(...validTimes) : null;
    const worst = validTimes.length > 0 ? Math.max(...validTimes) : null;
    const isClickZone = phase === "waiting" || phase === "ready";

    return (
        <GameShell
            title="Reaction Training"
            emoji="⚡"
            accentColor="rgba(16,185,129,0.15)"
            badge={
                phase !== "select" && phase !== "done" ? (
                    <span className="nb-badge" style={{ color: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.1)" }}>
                        {Math.min(currentRound, totalRounds)}/{totalRounds}
                    </span>
                ) : undefined
            }
            headerRight={
                phase !== "select" ? (
                    <button onClick={() => { clearTimer(); setPhase("select"); }} className="nb-btn-ghost text-xs px-3 py-1.5">
                        Quit
                    </button>
                ) : undefined
            }
        >
            {/* ── Full-screen flash overlay ── */}
            {phase === "ready" && (
                <div
                    className="fixed inset-0 z-0 transition-all duration-100"
                    style={{ background: flash.bg, opacity: 0.85 }}
                />
            )}

            <div
                className={`relative z-10 w-full flex flex-col items-center justify-center min-h-[60vh] gap-6 sm:gap-8 ${isClickZone ? "cursor-pointer select-none" : ""}`}
                onClick={isClickZone ? handleTap : undefined}
            >

                {/* ── Select ── */}
                {phase === "select" && (
                    <div className="w-full max-w-md space-y-8 animate-nb-scale-in text-center" onClick={(e) => e.stopPropagation()}>
                        <div>
                            <div className="text-7xl mb-4 animate-nb-float">⚡</div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Reaction Training</h2>
                            <p className="text-sm sm:text-base" style={{ color: "rgba(255,255,255,0.45)" }}>
                                Wait for the screen to flash, then tap as fast as you can.
                            </p>
                        </div>

                        {bestAvg && (
                            <div className="nb-glass rounded-2xl p-5 inline-block mx-auto">
                                <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Your best average</p>
                                <p className="text-4xl font-mono font-bold" style={{ color: getBand(bestAvg).color }}>{bestAvg}ms</p>
                                <p className="text-sm font-semibold mt-1" style={{ color: getBand(bestAvg).color }}>
                                    {getBand(bestAvg).emoji} {getBand(bestAvg).label}
                                </p>
                            </div>
                        )}

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>Choose rounds</p>
                            <div className="flex gap-3 justify-center">
                                {ROUND_OPTIONS.map((r) => (
                                    <button key={r} onClick={() => startGame(r)}
                                        className="nb-btn-ghost flex flex-col items-center gap-1 w-24 py-4 rounded-2xl"
                                        style={{ border: "1px solid rgba(245,166,35,0.25)" }}>
                                        <span className="text-2xl font-bold font-mono nb-gradient-text">{r}</span>
                                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>rounds</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Waiting ── */}
                {phase === "waiting" && (
                    <div className="text-center space-y-4 pointer-events-none animate-nb-scale-in">
                        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full mx-auto flex items-center justify-center"
                            style={{ background: "rgba(255,255,255,0.06)", border: "2px solid rgba(255,255,255,0.1)" }}>
                            <span className="text-6xl sm:text-7xl animate-pulse">⏳</span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>Wait…</p>
                        <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Don&apos;t click yet! Tap when you see the flash.</p>
                    </div>
                )}

                {/* ── Ready ── */}
                {phase === "ready" && (
                    <div className="text-center space-y-4 pointer-events-none animate-nb-scale-in">
                        <div
                            className="w-44 h-44 sm:w-56 sm:h-56 rounded-full mx-auto flex items-center justify-center"
                            style={{ background: "rgba(255,255,255,0.2)", border: "4px solid rgba(255,255,255,0.5)", boxShadow: `0 0 60px ${flash.shadow}` }}
                        >
                            <span className="text-8xl">👆</span>
                        </div>
                        <p className="text-4xl sm:text-5xl font-bold text-white drop-shadow-xl">TAP NOW!</p>
                    </div>
                )}

                {/* ── Result ── */}
                {phase === "result" && lastResult && (
                    <div className="text-center space-y-5 animate-nb-bounce-in w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
                        {lastResult.tooEarly ? (
                            <>
                                <div className="text-6xl">😅</div>
                                <h3 className="text-2xl font-bold text-red-400">Too Early!</h3>
                                <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                                    You clicked before the flash. This round won&apos;t count.
                                </p>
                                <button onClick={retry} className="nb-btn-ghost mt-2 w-full justify-center py-3">
                                    ↺ Retry Round {currentRound}
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="text-6xl">⚡</div>
                                <div>
                                    <p className="text-6xl font-mono font-bold" style={{ color: getBand(lastResult.ms!).color }}>
                                        {lastResult.ms}ms
                                    </p>
                                    <p className="text-base font-semibold mt-1" style={{ color: getBand(lastResult.ms!).color }}>
                                        {getBand(lastResult.ms!).emoji} {getBand(lastResult.ms!).label}
                                    </p>
                                </div>

                                {/* mini history */}
                                {results.length > 0 && (
                                    <div className="flex gap-1.5 flex-wrap justify-center">
                                        {results.map((r, i) => (
                                            <span key={i} className="text-xs font-mono px-2 py-1 rounded-lg"
                                                style={{
                                                    background: r.tooEarly ? "rgba(248,113,113,0.15)" : "rgba(255,255,255,0.06)",
                                                    border: "1px solid rgba(255,255,255,0.08)",
                                                    color: r.tooEarly ? "#f87171" : "rgba(255,255,255,0.6)"
                                                }}>
                                                {r.tooEarly ? "early" : `${r.ms}ms`}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <button onClick={goNext} className="nb-btn-primary w-full justify-center py-3">
                                    Next Round →
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* ── Done ── */}
                {phase === "done" && (
                    <div className="w-full max-w-sm text-center space-y-6 animate-nb-bounce-in" onClick={(e) => e.stopPropagation()}>
                        <div>
                            <div className="text-6xl mb-2">🏁</div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white">Training Complete!</h2>
                        </div>

                        {/* Average highlight */}
                        <div className="nb-glass rounded-2xl p-5 text-center">
                            <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Average Reaction</p>
                            <p className="text-5xl font-mono font-bold mb-1" style={{ color: getBand(average).color }}>
                                {average}ms
                            </p>
                            <p className="text-sm font-semibold" style={{ color: getBand(average).color }}>
                                {getBand(average).emoji} {getBand(average).label}
                            </p>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-2.5">
                            {[
                                { label: "Best", value: `${best ?? "—"}ms`, color: "#34d399" },
                                { label: "Worst", value: `${worst ?? "—"}ms`, color: "#f87171" },
                                { label: "Valid rounds", value: `${validTimes.length}/${totalRounds}`, color: "white" },
                                { label: "Too early", value: `${results.filter((r) => r.tooEarly).length}`, color: results.filter((r) => r.tooEarly).length > 0 ? "#f87171" : "#34d399" },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="nb-stat">
                                    <span className="nb-stat-value" style={{ color, fontSize: "1.1rem" }}>{value}</span>
                                    <span className="nb-stat-label">{label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Per-round breakdown */}
                        <div className="flex gap-1.5 flex-wrap justify-center">
                            {results.map((r, i) => (
                                <div key={i} className="flex flex-col items-center gap-0.5">
                                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>R{i + 1}</span>
                                    <span className="text-xs font-mono font-bold"
                                        style={{ color: r.tooEarly ? "#f87171" : getBand(r.ms!).color }}>
                                        {r.tooEarly ? "early" : `${r.ms}ms`}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {bestAvg != null && average <= bestAvg && validTimes.length === totalRounds && (
                            <p className="text-emerald-400 font-semibold">✨ New Personal Best!</p>
                        )}

                        <div className="flex gap-3 justify-center">
                            <button onClick={() => startGame(totalRounds)} className="nb-btn-primary">Play Again</button>
                            <button onClick={() => setPhase("select")} className="nb-btn-ghost">Change Rounds</button>
                        </div>
                    </div>
                )}
            </div>
        </GameShell>
    );
}
