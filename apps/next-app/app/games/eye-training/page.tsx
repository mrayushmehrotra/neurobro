"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameShell from "@/components/GameShell";

type Phase = "select" | "playing";

interface Target {
    id: number;
    x: number;
    y: number;
    size: number;
}

const GAME_MODES = [
    { id: "tracking", label: "Tracking", emoji: "🎯", description: "Follow the moving target", difficulty: "Easy" },
    { id: "peripheral", label: "Peripheral", emoji: "👁️", description: "Hold focus while dots appear around your vision", difficulty: "Medium" },
    { id: "reflex", label: "Reflex", emoji: "⚡", description: "Observe short-lived dots without clicking", difficulty: "Hard" },
];

const TARGET_DURATION = 1500;
const SPAWN_INTERVAL = 800;

export default function EyeTrainingGame() {
    const [phase, setPhase] = useState<Phase>("select");
    const [mode, setMode] = useState<string | null>(null);
    const [targets, setTargets] = useState<Target[]>([]);
    const [activeTarget, setActiveTarget] = useState<number | null>(null);

    const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        setPhase("playing");
        setTargets([]);
        setActiveTarget(null);

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
    }, [clearAll, spawnTarget]);

    useEffect(() => {
        return () => clearAll();
    }, [clearAll]);

    return (
        <GameShell
            title="Eye Training"
            emoji="👁️"
            accentColor="rgba(251,113,133,0.15)"
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
                className="relative w-full min-h-[60vh] flex flex-col items-center justify-center"
            >
                {phase === "select" && (
                    <div className="w-full max-w-md space-y-8 animate-nb-scale-in text-center">
                        <div>
                            <div className="text-7xl mb-4 animate-nb-float">👁️</div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Eye Training</h2>
                            <p className="text-sm sm:text-base" style={{ color: "rgba(255,255,255,0.45)" }}>
                                Watch the moving dots and keep your eyes focused. No clicking and no score.
                            </p>
                        </div>

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
                            className="absolute inset-0 rounded-2xl transition-all duration-200"
                            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}
                        >
                            {targets.map((target) => (
                                <div
                                    key={target.id}
                                    className="absolute transition-transform"
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
                                {mode === "peripheral" && "Keep your gaze steady while dots appear around your vision"}
                                {mode === "reflex" && "Observe each dot before it disappears"}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </GameShell>
    );
}
