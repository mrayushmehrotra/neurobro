"use client";

import type { Metadata } from "next";
import { useCallback, useEffect, useRef, useState } from "react";
import GameShell from "@/components/GameShell";
import { GameTimerHandle } from "@/components/GameTimer";

export const dynamic = "force-dynamic";

type Op = "+" | "−" | "×" | "÷";
type Difficulty = "easy" | "medium" | "hard";
type Phase = "select" | "playing" | "done";

const DIFFICULTY = {
    easy: { label: "Easy", emoji: "🌱", seconds: 90, ops: ["+", "−"] as Op[], color: "#34d399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.25)", desc: "Addition & subtraction · 90s" },
    medium: { label: "Medium", emoji: "🔥", seconds: 60, ops: ["+", "−", "×"] as Op[], color: "#f5a623", bg: "rgba(245,166,35,0.12)", border: "rgba(245,166,35,0.25)", desc: "Add, subtract, multiply · 60s" },
    hard: { label: "Hard", emoji: "💀", seconds: 45, ops: ["+", "−", "×", "÷"] as Op[], color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.25)", desc: "All four operations · 45s" },
};

function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function makeQuestion(diff: Difficulty, streak: number) {
    const scale = Math.min(Math.floor(streak / 4) + 1, 6);
    const ops = DIFFICULTY[diff].ops;
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a: number, b: number, answer: number;

    switch (op) {
        case "+": a = randInt(1, 15 * scale); b = randInt(1, 15 * scale); answer = a + b; break;
        case "−": a = randInt(5, 20 * scale); b = randInt(1, a); answer = a - b; break;
        case "×": a = randInt(2, 4 + scale * 2); b = randInt(2, 4 + scale * 2); answer = a * b; break;
        default: b = randInt(2, 3 + scale); answer = randInt(2, 5 + scale); a = b * answer; break;
    }
    return { a, b, op, answer, display: `${a} ${op} ${b}` };
}

export default function MentalMathGame() {
    const [phase, setPhase] = useState<Phase>("select");
    const [diff, setDiff] = useState<Difficulty>("medium");
    const [question, setQuestion] = useState(() => makeQuestion("medium", 0));
    const [input, setInput] = useState("");
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [total, setTotal] = useState(0);
    const [wrong, setWrong] = useState(0);
    const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
    const [highScores, setHighScores] = useState<Record<Difficulty, number>>({ easy: 0, medium: 0, hard: 0 });
    const timerRef = useRef<GameTimerHandle>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const scoreRef = useRef(0);
    const streakRef = useRef(0);
    const totalRef = useRef(0);
    const wrongRef = useRef(0);

    useEffect(() => {
        try { const s = localStorage.getItem("nb_math_hs_v2"); if (s) setHighScores(JSON.parse(s)); } catch { }
    }, []);

    const nextQ = useCallback((newStreak: number, d: Difficulty) => {
        setQuestion(makeQuestion(d, newStreak));
        setInput("");
        setFeedback(null);
        setTimeout(() => inputRef.current?.focus(), 10);
    }, []);

    const handleExpire = useCallback(() => {
        setPhase("done");
        setHighScores((prev) => {
            const nb = Math.max(prev[diff], scoreRef.current);
            const upd = { ...prev, [diff]: nb };
            localStorage.setItem("nb_math_hs_v2", JSON.stringify(upd));
            return upd;
        });
    }, [diff]);

    const startGame = useCallback((d: Difficulty) => {
        setDiff(d); setScore(0); setStreak(0); setTotal(0); setWrong(0); setFeedback(null);
        scoreRef.current = 0; streakRef.current = 0; totalRef.current = 0; wrongRef.current = 0;
        setQuestion(makeQuestion(d, 0)); setInput("");
        timerRef.current?.reset();
        setPhase("playing");
        setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (phase !== "playing") return;
        const trimmed = input.trim();
        if (!trimmed || isNaN(Number(trimmed))) return;
        const val = Number(trimmed);

        totalRef.current++; setTotal(totalRef.current);

        if (val === question.answer) {
            streakRef.current++;
            const bonus = Math.floor(streakRef.current / 5);
            scoreRef.current += 1 + bonus;
            setScore(scoreRef.current); setStreak(streakRef.current);
            setFeedback("correct");
            setTimeout(() => nextQ(streakRef.current, diff), 250);
        } else {
            streakRef.current = 0; wrongRef.current++;
            setStreak(0); setWrong(wrongRef.current);
            setFeedback("wrong");
            setInput("");
            setTimeout(() => { setFeedback(null); inputRef.current?.focus(); }, 600);
        }
    }, [input, question.answer, phase, diff, nextQ]);

    const accuracy = total > 0 ? Math.round(((total - wrong) / total) * 100) : 100;
    const cfg = DIFFICULTY[diff];

    return (
        <GameShell
            title="Mental Math"
            emoji="➗"
            accentColor="rgba(139,92,246,0.2)"
            timerRef={timerRef}
            timerMode="down"
            timerInitialSeconds={cfg.seconds}
            timerRunning={phase === "playing"}
            onTimerExpire={handleExpire}
            badge={
                phase !== "select" ? (
                    <span className="nb-badge text-xs font-semibold" style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}>
                        {cfg.emoji} {cfg.label}
                    </span>
                ) : undefined
            }
            headerRight={
                phase !== "select" ? (
                    <button onClick={() => setPhase("select")} className="nb-btn-ghost text-xs px-3 py-1.5">
                        Change Mode
                    </button>
                ) : undefined
            }
        >
            {/* ── Difficulty Selector ── */}
            {phase === "select" && (
                <div className="w-full max-w-md space-y-8 animate-nb-scale-in">
                    <div className="text-center">
                        <div className="text-6xl mb-4 animate-nb-float">🧮</div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Mental Math</h2>
                        <p className="text-sm sm:text-base" style={{ color: "rgba(255,255,255,0.45)" }}>
                            Solve arithmetic problems against the clock. How many can you get?
                        </p>
                    </div>

                    <div className="space-y-3 nb-stagger">
                        {(["easy", "medium", "hard"] as Difficulty[]).map((d) => {
                            const c = DIFFICULTY[d];
                            return (
                                <button key={d} onClick={() => startGame(d)}
                                    className="nb-select-card group flex items-center gap-4"
                                    style={{ border: `1px solid ${c.border}` }}>
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                                        style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                                        {c.emoji}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="font-bold text-base" style={{ color: c.color }}>{c.label}</div>
                                        <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{c.desc}</div>
                                    </div>
                                    {highScores[d] > 0 && (
                                        <div className="text-right flex-shrink-0">
                                            <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Best</div>
                                            <div className="font-mono font-bold text-sm" style={{ color: c.color }}>{highScores[d]}</div>
                                        </div>
                                    )}
                                    <span className="text-white/20 group-hover:text-white/60 transition-colors flex-shrink-0">→</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Playing ── */}
            {phase === "playing" && (
                <div className="w-full max-w-lg flex flex-col items-center gap-6 sm:gap-8 animate-nb-scale-in">

                    {/* Stats */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="nb-stat">
                            <span className="nb-stat-value" style={{ color: cfg.color }}>{score}</span>
                            <span className="nb-stat-label">score</span>
                        </div>
                        <div className="nb-stat">
                            <span className="nb-stat-value text-amber-400">{streak > 0 ? `🔥${streak}` : "0"}</span>
                            <span className="nb-stat-label">streak</span>
                        </div>
                        <div className="nb-stat">
                            <span className={`nb-stat-value ${accuracy >= 80 ? "text-emerald-400" : accuracy >= 60 ? "text-amber-400" : "text-red-400"}`}>
                                {accuracy}%
                            </span>
                            <span className="nb-stat-label">accuracy</span>
                        </div>
                    </div>

                    {/* Question */}
                    <div className="text-center">
                        <div className={`text-5xl sm:text-6xl lg:text-7xl font-bold font-mono tracking-wide transition-all duration-200 ${feedback === "correct" ? "text-emerald-400 scale-110" : feedback === "wrong" ? "text-red-400 scale-95" : "text-white"
                            }`}>
                            {question.display} <span style={{ color: "rgba(255,255,255,0.3)" }}>=</span> ?
                        </div>

                        {/* Feedback */}
                        <div className="h-7 mt-3 flex items-center justify-center">
                            {feedback === "wrong" && (
                                <p className="text-red-400 text-sm animate-nb-slide-up">
                                    ✗ Answer was <span className="font-mono font-bold">{question.answer}</span>
                                </p>
                            )}
                            {feedback === "correct" && streak > 0 && streak % 5 === 0 && (
                                <p className="text-amber-400 text-sm animate-nb-pop font-semibold">🔥 Streak bonus +1!</p>
                            )}
                        </div>
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="flex items-center gap-3 w-full max-w-xs">
                        <input
                            ref={inputRef}
                            type="number"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className={`flex-1 text-center text-2xl sm:text-3xl font-mono font-bold px-4 py-3 rounded-2xl outline-none transition-all duration-200`}
                            style={{
                                background: feedback === "wrong"
                                    ? "rgba(248,113,113,0.12)"
                                    : feedback === "correct"
                                        ? "rgba(52,211,153,0.12)"
                                        : "rgba(255,255,255,0.06)",
                                border: `2px solid ${feedback === "wrong" ? "rgba(248,113,113,0.5)" : feedback === "correct" ? "rgba(52,211,153,0.5)" : "rgba(255,255,255,0.12)"}`,
                                color: "white",
                            }}
                            placeholder="?"
                            autoFocus
                            autoComplete="off"
                        />
                        <button type="submit" className="nb-btn-primary px-5 py-3.5 text-lg">↵</button>
                    </form>

                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>Type your answer and press Enter</p>
                </div>
            )}

            {/* ── Done ── */}
            {phase === "done" && (
                <div className="w-full max-w-sm text-center space-y-6 animate-nb-bounce-in">
                    <div>
                        <div className="text-6xl mb-3">⏰</div>
                        <h2 className="text-3xl font-bold text-white mb-1">Time&apos;s Up!</h2>
                        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                            {cfg.emoji} {cfg.label} Mode
                        </p>
                    </div>

                    <div className="nb-glass rounded-2xl p-5 space-y-3">
                        {[
                            { label: "Final Score", value: String(score), color: cfg.color },
                            { label: "High Score", value: String(highScores[diff]), color: "white" },
                            { label: "Answered", value: String(total), color: "white" },
                            { label: "Wrong", value: String(wrong), color: wrong > 0 ? "#f87171" : "#34d399" },
                            { label: "Accuracy", value: `${accuracy}%`, color: accuracy >= 80 ? "#34d399" : accuracy >= 60 ? "#f5a623" : "#f87171" },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="flex items-center justify-between">
                                <span className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</span>
                                <span className="font-mono font-bold text-base" style={{ color }}>{value}</span>
                            </div>
                        ))}
                        {score >= highScores[diff] && score > 0 && (
                            <div className="pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                                <span className="text-emerald-400 text-sm font-semibold">✨ New High Score!</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 justify-center">
                        <button onClick={() => startGame(diff)} className="nb-btn-primary">Play Again</button>
                        <button onClick={() => setPhase("select")} className="nb-btn-ghost">Change Mode</button>
                    </div>
                </div>
            )}
        </GameShell>
    );
}
