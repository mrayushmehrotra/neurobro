"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameShell from "@/components/GameShell";
import { IconEye, IconTarget, IconFocus, IconFlame } from "@tabler/icons-react";

type Phase = "select" | "playing" | "result" | "done";

interface Target {
    id: number;
    x: number;
    y: number;
    size: number;
}

interface RoundResult {
    hits: number;
    misses: number;
    accuracy: number;
}

const GAME_MODES = [
    { id: "tracking", label: "Tracking", emoji: "🎯", description: "Follow the moving target", difficulty: "Easy" },
    { id: "peripheral", label: "Peripheral", emoji: "👁️", description: "Click targets without looking away", difficulty: "Medium" },
    { id: "reflex", label: "Reflex", emoji: "⚡", description: "Click targets as they appear", difficulty: "Hard" },
];

const ROUND_DURATION = 10000;
const TARGET_DURATION = 1500;
const SPAWN_INTERVAL = 800;

export default function EyeTrainingGame() {
    const [phase, setPhase] = useState<Phase>("select");
    const [mode, setMode] = useState<string | null>(null);
    const [round, setRound] = useState(1);
    const [totalRounds] = useState(3);
    const [targets, setTargets] = useState<Target[]>([]);
    const [hits, setHits] = useState(0);
    const [misses, setMisses] = useState(0);
    const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
    const [results, setResults] = useState<RoundResult[]>([]);
    const [bestScore, setBestScore] = useState<number | null>(null);
    const [activeTarget, setActiveTarget] = useState<number | null>(null);
    const [isPenalty, setIsPenalty] = useState(false);

    const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const s = localStorage.getItem("nb_eye_best_v2");
        if (s) setBestScore(Number(s));
    }, []);

    const clearAll = useCallback(() => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        if (spawnRef.current) clearInterval(spawnRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }, []);

    const spawnTarget = useCallback(() => {
        const newTarget: Target = {
            id: Date.now(),
            x: 10 + Math.random() * 80,
            y: 10 + Math.random() * 80,
            size: mode === "tracking" ? 60 : mode === "peripheral" ? 40 : 35,
        };
        setTargets((prev) => [...prev.slice(-4), newTarget]);
        setActiveTarget(newTarget.id);

        if (mode === "reflex") {
            timeoutRef.current = setTimeout(() => {
                setTargets((prev) => prev.filter((t) => t.id !== newTarget.id));
                setActiveTarget(null);
            }, TARGET_DURATION);
        }
    }, [mode]);

    const startGame = useCallback((selectedMode: string) => {
        setMode(selectedMode);
        setRound(1);
        setHits(0);
        setMisses(0);
        setTimeLeft(ROUND_DURATION);
        setResults([]);
        setPhase("playing");
        setTargets([]);
        setActiveTarget(null);

        let elapsed = 0;
        gameLoopRef.current = setInterval(() => {
            elapsed += 100;
            setTimeLeft((prev) => Math.max(0, prev - 100));
            if (elapsed >= ROUND_DURATION) {
                clearAll();
                const accuracy = hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0;
                setResults((prev) => [...prev, { hits, misses, accuracy }]);
                setPhase("result");
            }
        }, 100);

        if (selectedMode === "tracking") {
            const moveTarget = () => {
                setTargets((prev) => prev.map((t) => ({
                    ...t,
                    x: 10 + Math.random() * 80,
                    y: 10 + Math.random() * 80,
                })));
            };
            gameLoopRef.current = setInterval(moveTarget, 500);
        }

        spawnRef.current = setInterval(spawnTarget, SPAWN_INTERVAL);
    }, [hits, misses, clearAll, spawnTarget]);

    const handleClick = useCallback((targetId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (phase !== "playing" || !mode) return;

        if (mode === "peripheral" && activeTarget !== null && targetId !== activeTarget) {
            setIsPenalty(true);
            setMisses((prev) => prev + 1);
            setTimeout(() => setIsPenalty(false), 300);
            return;
        }

        if (targets.find((t) => t.id === targetId)) {
            setHits((prev) => prev + 1);
            setTargets((prev) => prev.filter((t) => t.id !== targetId));
            setActiveTarget(null);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }
    }, [phase, mode, targets, activeTarget]);

    const handleMiss = useCallback(() => {
        if (phase !== "playing") return;
        setMisses((prev) => prev + 1);
        setIsPenalty(true);
        setTimeout(() => setIsPenalty(false), 300);
    }, [phase]);

    const nextRound = useCallback(() => {
        if (round >= totalRounds) {
            const totalHits = results.reduce((a, r) => a + r.hits, 0) + hits;
            const totalMisses = results.reduce((a, r) => a + r.misses, 0) + misses;
            const avgAccuracy = Math.round((totalHits / (totalHits + totalMisses)) * 100);
            const score = totalHits * 10 - totalMisses * 5;

            if (bestScore === null || score > bestScore) {
                setBestScore(score);
                localStorage.setItem("nb_eye_best_v2", String(score));
            }

            setPhase("done");
        } else {
            setRound((prev) => prev + 1);
            setHits(0);
            setMisses(0);
            setTimeLeft(ROUND_DURATION);
            setTargets([]);
            setActiveTarget(null);

            let elapsed = 0;
            gameLoopRef.current = setInterval(() => {
                elapsed += 100;
                setTimeLeft((prev) => Math.max(0, prev - 100));
                if (elapsed >= ROUND_DURATION) {
                    clearAll();
                    const accuracy = hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0;
                    setResults((prev) => [...prev, { hits, misses, accuracy }]);
                    setPhase("result");
                }
            }, 100);

            if (mode === "tracking") {
                gameLoopRef.current = setInterval(() => {
                    setTargets((prev) => prev.map((t) => ({
                        ...t,
                        x: 10 + Math.random() * 80,
                        y: 10 + Math.random() * 80,
                    })));
                }, 500);
            }

            spawnRef.current = setInterval(spawnTarget, SPAWN_INTERVAL);
        }
    }, [round, totalRounds, results, hits, misses, bestScore, clearAll, spawnTarget, mode]);

    useEffect(() => {
        return () => clearAll();
    }, [clearAll]);

    const getAccuracyColor = (acc: number) => {
        if (acc >= 90) return "#34d399";
        if (acc >= 70) return "#38bdf8";
        if (acc >= 50) return "#f5a623";
        return "#f87171";
    };

    return (
        <GameShell
            title="Eye Training"
            emoji="👁️"
            accentColor="rgba(251,113,133,0.15)"
            badge={
                phase !== "select" && phase !== "done" ? (
                    <span className="nb-badge" style={{ color: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.1)" }}>
                        {round}/{totalRounds}
                    </span>
                ) : undefined
            }
            headerRight={
                phase !== "select" ? (
                    <button
                        onClick={() => { clearAll(); setPhase("select"); }}
                        className="nb-btn-ghost text-xs px-3 py-1.5"
                    >
                        Quit
                    </button>
                ) : undefined
            }
        >
            <div
                className={`relative w-full min-h-[60vh] flex flex-col items-center justify-center ${phase === "playing" ? "cursor-crosshair" : ""}`}
                onClick={phase === "playing" && mode !== "peripheral" ? handleMiss : undefined}
            >
                {phase === "select" && (
                    <div className="w-full max-w-md space-y-8 animate-nb-scale-in text-center">
                        <div>
                            <div className="text-7xl mb-4 animate-nb-float">👁️</div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Eye Training</h2>
                            <p className="text-sm sm:text-base" style={{ color: "rgba(255,255,255,0.45)" }}>
                                Train your visual tracking like professional athletes. Improve focus and reaction speed.
                            </p>
                        </div>

                        {bestScore && (
                            <div className="nb-glass rounded-2xl p-5 inline-block mx-auto">
                                <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Your best score</p>
                                <p className="text-4xl font-mono font-bold text-rose-400">{bestScore}</p>
                            </div>
                        )}

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>Choose mode</p>
                            <div className="space-y-3">
                                {GAME_MODES.map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => startGame(m.id)}
                                        className="nb-select-card w-full flex items-center gap-4 p-4 text-left"
                                    >
                                        <div
                                            className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
                                            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                                        >
                                            {m.emoji}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-semibold text-white">{m.label}</span>
                                                <span
                                                    className="text-xs px-2 py-0.5 rounded-full"
                                                    style={{ background: "rgba(251,113,133,0.1)", color: "#fb7185" }}
                                                >
                                                    {m.difficulty}
                                                </span>
                                            </div>
                                            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{m.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {phase === "playing" && (
                    <div className="relative w-full max-w-lg h-96 animate-nb-scale-in">
                        <div
                            className="absolute top-2 left-2 right-2 flex justify-between items-center"
                        >
                            <div className="nb-stat">
                                <span className="nb-stat-value text-emerald-400 text-lg">{hits}</span>
                                <span className="nb-stat-label">Hits</span>
                            </div>
                            <div
                                className={`text-2xl font-mono font-bold ${timeLeft < 3000 ? "text-red-400 animate-pulse" : "text-white"}`}
                            >
                                {Math.ceil(timeLeft / 1000)}s
                            </div>
                            <div className="nb-stat">
                                <span className="nb-stat-value text-red-400 text-lg">{misses}</span>
                                <span className="nb-stat-label">Misses</span>
                            </div>
                        </div>

                        <div
                            className={`absolute inset-0 rounded-2xl transition-all duration-200 ${isPenalty ? "ring-4 ring-red-500/50" : ""}`}
                            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}
                        >
                            {targets.map((target) => (
                                <div
                                    key={target.id}
                                    onClick={(e) => handleClick(target.id, e)}
                                    className="absolute cursor-pointer transition-transform hover:scale-110"
                                    style={{
                                        left: `${target.x}%`,
                                        top: `${target.y}%`,
                                        width: target.size,
                                        height: target.size,
                                        transform: "translate(-50%, -50%)",
                                        borderRadius: "50%",
                                        background: activeTarget === target.id
                                            ? "radial-gradient(circle, #fb7185 0%, #fb7185 40%, transparent 70%)"
                                            : "radial-gradient(circle, #f472b6 0%, #f472b6 40%, transparent 70%)",
                                        boxShadow: activeTarget === target.id
                                            ? "0 0 30px rgba(251,113,133,0.8)"
                                            : "0 0 20px rgba(244,114,182,0.5)",
                                    }}
                                />
                            ))}

                            {mode === "tracking" && targets.length > 0 && (
                                <div
                                    className="absolute pointer-events-none text-white/30 text-xs"
                                    style={{
                                        left: `${targets[0].x}%`,
                                        top: `${targets[0].y - 8}%`,
                                        transform: "translate(-50%, -100%)",
                                    }}
                                >
                                    Follow this!
                                </div>
                            )}
                        </div>

                        <div className="absolute bottom-4 left-0 right-0 text-center">
                            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                                {mode === "tracking" && "Follow the moving target with your eyes"}
                                {mode === "peripheral" && "Click the highlighted target only!"}
                                {mode === "reflex" && "Click targets before they disappear"}
                            </p>
                        </div>
                    </div>
                )}

                {phase === "result" && (
                    <div className="w-full max-w-sm text-center space-y-5 animate-nb-bounce-in">
                        <div className="text-6xl">📊</div>
                        <h3 className="text-2xl font-bold text-white">Round {round} Complete!</h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="nb-stat">
                                <span className="nb-stat-value text-emerald-400 text-xl">{hits}</span>
                                <span className="nb-stat-label">Hits</span>
                            </div>
                            <div className="nb-stat">
                                <span className="nb-stat-value text-red-400 text-xl">{misses}</span>
                                <span className="nb-stat-label">Misses</span>
                            </div>
                        </div>

                        <div
                            className="nb-glass rounded-xl p-4"
                            style={{ border: `1px solid ${getAccuracyColor(results[round - 1]?.accuracy || 0)}` }}
                        >
                            <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Accuracy</p>
                            <p className="text-3xl font-mono font-bold" style={{ color: getAccuracyColor(results[round - 1]?.accuracy || 0) }}>
                                {results[round - 1]?.accuracy || 0}%
                            </p>
                        </div>

                        <button onClick={nextRound} className="nb-btn-primary w-full justify-center py-3">
                            {round >= totalRounds ? "View Results" : "Next Round →"}
                        </button>
                    </div>
                )}

                {phase === "done" && (
                    <div className="w-full max-w-sm text-center space-y-6 animate-nb-bounce-in">
                        <div>
                            <div className="text-6xl mb-2">🏁</div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white">Training Complete!</h2>
                        </div>

                        <div className="nb-glass rounded-2xl p-5 text-center">
                            <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Final Score</p>
                            <p className="text-5xl font-mono font-bold text-rose-400">
                                {results.reduce((a, r) => a + r.hits, 0) * 10 - results.reduce((a, r) => a + r.misses, 0) * 5}
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {results.map((r, i) => (
                                <div key={i} className="nb-stat flex-col py-2">
                                    <span className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>R{i + 1}</span>
                                    <span className="nb-stat-value text-sm" style={{ color: getAccuracyColor(r.accuracy) }}>
                                        {r.accuracy}%
                                    </span>
                                </div>
                            ))}
                        </div>

                        {bestScore && (
                            <p className="text-emerald-400 font-semibold">✨ Best Score: {bestScore}</p>
                        )}

                        <div className="space-y-3">
                            <button onClick={() => { setPhase("select"); }} className="nb-btn-primary w-full">
                                Play Again
                            </button>
                            <button onClick={() => setPhase("select")} className="nb-btn-ghost w-full">
                                Change Mode
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </GameShell>
    );
}