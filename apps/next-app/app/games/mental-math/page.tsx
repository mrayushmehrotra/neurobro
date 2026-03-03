"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameShell from "@/components/GameShell";
import { GameTimerHandle } from "@/components/GameTimer";

export const dynamic = "force-dynamic";

type Op = "+" | "−" | "×" | "÷";
type Difficulty = "easy" | "medium" | "hard";
type Phase = "select" | "playing" | "done";
type OpMode = "all" | "add-sub" | "mul-div";
type Digits = 1 | 2 | 3 | 4 | 5;

const DIFFICULTY = {
    easy: { label: "Easy", emoji: "🌱", seconds: 90, color: "#34d399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.25)", desc: "90 sec" },
    medium: { label: "Medium", emoji: "🔥", seconds: 60, color: "#f5a623", bg: "rgba(245,166,35,0.12)", border: "rgba(245,166,35,0.25)", desc: "60 sec" },
    hard: { label: "Hard", emoji: "💀", seconds: 45, color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.25)", desc: "45 sec" },
};

const OP_MODES: { key: OpMode; label: string; emoji: string; ops: Op[]; desc: string }[] = [
    { key: "all", label: "All", emoji: "🔀", ops: ["+", "−", "×", "÷"], desc: "+ − × ÷" },
    { key: "add-sub", label: "+ / −", emoji: "➕", ops: ["+", "−"], desc: "+ −" },
    { key: "mul-div", label: "× / ÷", emoji: "✖️", ops: ["×", "÷"], desc: "× ÷" },
];

const DIGIT_OPTIONS: { value: Digits; label: string; range: string }[] = [
    { value: 1, label: "1", range: "1–9" },
    { value: 2, label: "2", range: "10–99" },
    { value: 3, label: "3", range: "100–999" },
    { value: 4, label: "4", range: "1K–9K" },
    { value: 5, label: "5", range: "10K–99K" },
];

/* ─── helpers ─────────────────────────────────────────────────── */
function randInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function maxForDigits(d: Digits) { return Math.pow(10, d) - 1; }
function minForDigits(d: Digits) { return d === 1 ? 1 : Math.pow(10, d - 1); }

function makeQuestion(diff: Difficulty, streak: number, opMode: OpMode, digits: Digits) {
    const modeEntry = OP_MODES.find((m) => m.key === opMode)!;
    const availableOps = diff === "easy"
        ? modeEntry.ops.filter((o) => o !== "÷")
        : modeEntry.ops;
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

/* ─── Number Pad ──────────────────────────────────────────────── */
function NumPad({ onPress }: { onPress: (v: string) => void }) {
    const keys = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "−", "0", "⌫"];
    return (
        <div className="grid grid-cols-3 gap-2 w-full max-w-[260px]">
            {keys.map((k) => (
                <button
                    key={k}
                    type="button"
                    onPointerDown={(e) => { e.preventDefault(); onPress(k); }}
                    className="h-12 rounded-xl font-mono font-bold text-lg active:scale-95 transition-transform select-none"
                    style={{
                        background: k === "⌫" ? "rgba(248,113,113,0.12)" : k === "−" ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.06)",
                        border: `1px solid ${k === "⌫" ? "rgba(248,113,113,0.25)" : k === "−" ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.1)"}`,
                        color: k === "⌫" ? "#f87171" : k === "−" ? "#a78bfa" : "white",
                    }}
                >
                    {k}
                </button>
            ))}
        </div>
    );
}

/* ─── Main Component ──────────────────────────────────────────── */
export default function MentalMathGame() {
    const [phase, setPhase] = useState<Phase>("select");
    const [diff, setDiff] = useState<Difficulty>("medium");
    const [opMode, setOpMode] = useState<OpMode>("all");
    const [digits, setDigits] = useState<Digits>(1);

    const [question, setQuestion] = useState(() => makeQuestion("medium", 0, "all", 1));
    const [input, setInput] = useState("");
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [total, setTotal] = useState(0);
    const [wrong, setWrong] = useState(0);
    const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
    const [highScores, setHighScores] = useState<Record<Difficulty, number>>({ easy: 0, medium: 0, hard: 0 });
    const [isMobile, setIsMobile] = useState(false);

    const timerRef = useRef<GameTimerHandle>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const scoreRef = useRef(0);
    const streakRef = useRef(0);
    const totalRef = useRef(0);
    const wrongRef = useRef(0);

    useEffect(() => {
        try { const s = localStorage.getItem("nb_math_hs_v2"); if (s) setHighScores(JSON.parse(s)); } catch { }
        // detect touch device for numpad
        setIsMobile("ontouchstart" in window || navigator.maxTouchPoints > 0);
    }, []);

    const nextQ = useCallback((newStreak: number, d: Difficulty, om: OpMode, dg: Digits) => {
        setQuestion(makeQuestion(d, newStreak, om, dg));
        setInput("");
        setFeedback(null);
        if (!isMobile) setTimeout(() => inputRef.current?.focus(), 10);
    }, [isMobile]);

    const handleExpire = useCallback(() => {
        setPhase("done");
        setHighScores((prev) => {
            const nb = Math.max(prev[diff], scoreRef.current);
            const upd = { ...prev, [diff]: nb };
            localStorage.setItem("nb_math_hs_v2", JSON.stringify(upd));
            return upd;
        });
    }, [diff]);

    const startGame = useCallback((d: Difficulty, om: OpMode, dg: Digits) => {
        setDiff(d); setOpMode(om); setDigits(dg);
        setScore(0); setStreak(0); setTotal(0); setWrong(0); setFeedback(null);
        scoreRef.current = 0; streakRef.current = 0; totalRef.current = 0; wrongRef.current = 0;
        setQuestion(makeQuestion(d, 0, om, dg)); setInput("");
        timerRef.current?.reset();
        setPhase("playing");
        if (!isMobile) setTimeout(() => inputRef.current?.focus(), 100);
    }, [isMobile]);

    const submitAnswer = useCallback((rawInput: string) => {
        if (phase !== "playing") return;
        const trimmed = rawInput.trim();
        if (!trimmed || isNaN(Number(trimmed))) return;
        const val = Number(trimmed);

        totalRef.current++; setTotal(totalRef.current);

        if (val === question.answer) {
            streakRef.current++;
            const bonus = Math.floor(streakRef.current / 5);
            scoreRef.current += 1 + bonus;
            setScore(scoreRef.current); setStreak(streakRef.current);
            setFeedback("correct");
            setTimeout(() => nextQ(streakRef.current, diff, opMode, digits), 250);
        } else {
            streakRef.current = 0; wrongRef.current++;
            setStreak(0); setWrong(wrongRef.current);
            setFeedback("wrong");
            setInput("");
            setTimeout(() => { setFeedback(null); if (!isMobile) inputRef.current?.focus(); }, 600);
        }
    }, [phase, question.answer, diff, opMode, digits, nextQ, isMobile]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        submitAnswer(input);
    }, [input, submitAnswer]);

    // Number pad handler
    const handlePad = useCallback((key: string) => {
        if (feedback === "correct") return;
        if (key === "⌫") {
            setInput((v) => v.slice(0, -1));
            return;
        }
        if (key === "−") {
            // toggle negative (only at start)
            setInput((v) => v.startsWith("-") ? v.slice(1) : "-" + v);
            return;
        }
        const next = input + key;
        setInput(next);
        // auto-submit if digits match expected answer length
        const expectedLen = String(question.answer).replace("-", "").length;
        const actualNum = next.replace("-", "");
        if (actualNum.length >= expectedLen && actualNum.length >= 1) {
            setTimeout(() => submitAnswer(next), 80);
        }
    }, [input, feedback, question.answer, submitAnswer]);

    const accuracy = total > 0 ? Math.round(((total - wrong) / total) * 100) : 100;
    const cfg = DIFFICULTY[diff];
    const currentOpMode = OP_MODES.find((m) => m.key === opMode)!;

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
                        Change
                    </button>
                ) : undefined
            }
        >

            {/* ══════════════════════════════════════════
                SELECT SCREEN
            ══════════════════════════════════════════ */}
            {phase === "select" && (
                <div className="w-full max-w-lg animate-nb-scale-in flex flex-col gap-5 pb-4">

                    {/* Header — compact on mobile */}
                    <div className="text-center">
                        <div className="text-4xl sm:text-6xl mb-2 animate-nb-float">🧮</div>
                        <h2 className="text-xl sm:text-3xl font-bold text-white mb-1">Mental Math</h2>
                        <p className="text-xs sm:text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                            Beat the clock — how many can you get?
                        </p>
                    </div>

                    {/* ── Operations ── */}
                    <div className="space-y-2">
                        <p className="text-[10px] sm:text-xs uppercase tracking-widest font-semibold px-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                            Operations
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                            {OP_MODES.map((m) => {
                                const active = opMode === m.key;
                                return (
                                    <button
                                        key={m.key}
                                        onClick={() => setOpMode(m.key)}
                                        className="flex flex-col items-center gap-1 py-3 px-1 rounded-xl transition-all duration-200 active:scale-95"
                                        style={{
                                            background: active ? "rgba(139,92,246,0.18)" : "rgba(255,255,255,0.04)",
                                            border: `1px solid ${active ? "rgba(139,92,246,0.45)" : "rgba(255,255,255,0.08)"}`,
                                            boxShadow: active ? "0 0 14px rgba(139,92,246,0.2)" : "none",
                                        }}
                                    >
                                        <span className="text-lg sm:text-xl">{m.emoji}</span>
                                        <span className="text-[11px] sm:text-xs font-semibold leading-tight text-center" style={{ color: active ? "#a78bfa" : "rgba(255,255,255,0.65)" }}>
                                            {m.label}
                                        </span>
                                        <span className="text-[9px] font-mono hidden sm:block" style={{ color: "rgba(255,255,255,0.3)" }}>{m.desc}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Digit Range ── */}
                    <div className="space-y-2">
                        <p className="text-[10px] sm:text-xs uppercase tracking-widest font-semibold px-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                            Number Size (digits)
                        </p>
                        <div className="flex gap-2">
                            {DIGIT_OPTIONS.map((d) => {
                                const active = digits === d.value;
                                return (
                                    <button
                                        key={d.value}
                                        onClick={() => setDigits(d.value)}
                                        className="flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-xl transition-all duration-200 active:scale-95"
                                        style={{
                                            background: active ? "rgba(245,166,35,0.15)" : "rgba(255,255,255,0.04)",
                                            border: `1px solid ${active ? "rgba(245,166,35,0.45)" : "rgba(255,255,255,0.08)"}`,
                                            boxShadow: active ? "0 0 12px rgba(245,166,35,0.18)" : "none",
                                        }}
                                    >
                                        <span className="text-sm sm:text-base font-bold font-mono" style={{ color: active ? "#f5a623" : "rgba(255,255,255,0.6)" }}>
                                            {d.label}
                                        </span>
                                        <span className="text-[8px] sm:text-[9px] leading-tight text-center hidden sm:block" style={{ color: "rgba(255,255,255,0.3)" }}>
                                            {d.range}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        {/* Range hint below on mobile */}
                        <p className="text-[10px] text-center sm:hidden" style={{ color: "rgba(255,255,255,0.3)" }}>
                            Range: {DIGIT_OPTIONS.find(d => d.value === digits)?.range}
                        </p>
                    </div>

                    {/* ── Difficulty → starts game ── */}
                    <div className="space-y-2">
                        <p className="text-[10px] sm:text-xs uppercase tracking-widest font-semibold px-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                            Difficulty & Time
                        </p>
                        <div className="flex flex-col gap-2">
                            {(["easy", "medium", "hard"] as Difficulty[]).map((d) => {
                                const c = DIFFICULTY[d];
                                return (
                                    <button key={d} onClick={() => startGame(d, opMode, digits)}
                                        className="nb-select-card group flex items-center gap-3 w-full active:scale-[0.98]"
                                        style={{ border: `1px solid ${c.border}` }}>
                                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0"
                                            style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                                            {c.emoji}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <div className="font-bold text-sm" style={{ color: c.color }}>{c.label}</div>
                                            <div className="text-[10px] sm:text-xs mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.35)" }}>
                                                {currentOpMode.desc} · {digits}D · {c.desc}
                                            </div>
                                        </div>
                                        {highScores[d] > 0 && (
                                            <div className="text-right flex-shrink-0">
                                                <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>Best</div>
                                                <div className="font-mono font-bold text-sm" style={{ color: c.color }}>{highScores[d]}</div>
                                            </div>
                                        )}
                                        <span className="text-white/20 group-hover:text-white/60 transition-colors flex-shrink-0 text-sm">→</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════
                PLAYING SCREEN
            ══════════════════════════════════════════ */}
            {phase === "playing" && (
                <div className="w-full max-w-sm flex flex-col items-center gap-4 sm:gap-6 animate-nb-scale-in">

                    {/* Config pills */}
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                        <span className="nb-badge text-[10px] sm:text-xs" style={{ background: "rgba(139,92,246,0.12)", borderColor: "rgba(139,92,246,0.25)", color: "#a78bfa" }}>
                            {currentOpMode.emoji} {currentOpMode.desc}
                        </span>
                        <span className="nb-badge text-[10px] sm:text-xs" style={{ background: "rgba(245,166,35,0.1)", borderColor: "rgba(245,166,35,0.2)", color: "#f5a623" }}>
                            {digits === 1 ? "1-digit" : `${digits}-digit`}
                        </span>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="nb-stat">
                            <span className="nb-stat-value text-xl sm:text-2xl" style={{ color: cfg.color }}>{score}</span>
                            <span className="nb-stat-label text-[10px] sm:text-xs">score</span>
                        </div>
                        <div className="nb-stat">
                            <span className="nb-stat-value text-xl sm:text-2xl text-amber-400">{streak > 0 ? `🔥${streak}` : "0"}</span>
                            <span className="nb-stat-label text-[10px] sm:text-xs">streak</span>
                        </div>
                        <div className="nb-stat">
                            <span className={`nb-stat-value text-xl sm:text-2xl ${accuracy >= 80 ? "text-emerald-400" : accuracy >= 60 ? "text-amber-400" : "text-red-400"}`}>
                                {accuracy}%
                            </span>
                            <span className="nb-stat-label text-[10px] sm:text-xs">accuracy</span>
                        </div>
                    </div>

                    {/* Question */}
                    <div className="text-center">
                        <div className={`text-4xl sm:text-5xl lg:text-6xl font-bold font-mono tracking-wide transition-all duration-200
                            ${feedback === "correct" ? "text-emerald-400 scale-110" : feedback === "wrong" ? "text-red-400 scale-95" : "text-white"}`}>
                            {question.display} <span style={{ color: "rgba(255,255,255,0.3)" }}>=</span> ?
                        </div>

                        {/* Feedback */}
                        <div className="h-6 mt-2 flex items-center justify-center">
                            {feedback === "wrong" && (
                                <p className="text-red-400 text-xs sm:text-sm animate-nb-slide-up">
                                    ✗ Answer was <span className="font-mono font-bold">{question.answer}</span>
                                </p>
                            )}
                            {feedback === "correct" && streak > 0 && streak % 5 === 0 && (
                                <p className="text-amber-400 text-xs sm:text-sm animate-nb-pop font-semibold">🔥 Streak bonus +1!</p>
                            )}
                        </div>
                    </div>

                    {/* ── Answer area ── */}
                    {isMobile ? (
                        /* Mobile: display + pad */
                        <div className="w-full flex flex-col items-center gap-3">
                            {/* Display */}
                            <div
                                className="w-full max-w-[260px] h-14 rounded-2xl flex items-center justify-center font-mono font-bold text-3xl transition-all duration-200"
                                style={{
                                    background: feedback === "wrong" ? "rgba(248,113,113,0.12)" : feedback === "correct" ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.06)",
                                    border: `2px solid ${feedback === "wrong" ? "rgba(248,113,113,0.5)" : feedback === "correct" ? "rgba(52,211,153,0.5)" : "rgba(255,255,255,0.15)"}`,
                                    color: "white",
                                }}
                            >
                                {input || <span style={{ color: "rgba(255,255,255,0.2)" }}>?</span>}
                            </div>

                            {/* Submit on mobile */}
                            {input && (
                                <button
                                    type="button"
                                    onClick={() => submitAnswer(input)}
                                    className="nb-btn-primary w-full max-w-[260px] py-3 text-base"
                                >
                                    Submit ↵
                                </button>
                            )}

                            {/* Number pad */}
                            <NumPad onPress={handlePad} />
                        </div>
                    ) : (
                        /* Desktop: text input */
                        <form onSubmit={handleSubmit} className="flex items-center gap-3 w-full max-w-xs">
                            <input
                                ref={inputRef}
                                type="number"
                                inputMode="numeric"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-1 text-center text-2xl sm:text-3xl font-mono font-bold px-4 py-3 rounded-2xl outline-none transition-all duration-200"
                                style={{
                                    background: feedback === "wrong" ? "rgba(248,113,113,0.12)" : feedback === "correct" ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.06)",
                                    border: `2px solid ${feedback === "wrong" ? "rgba(248,113,113,0.5)" : feedback === "correct" ? "rgba(52,211,153,0.5)" : "rgba(255,255,255,0.12)"}`,
                                    color: "white",
                                }}
                                placeholder="?"
                                autoFocus
                                autoComplete="off"
                            />
                            <button type="submit" className="nb-btn-primary px-5 py-3.5 text-lg">↵</button>
                        </form>
                    )}

                    {!isMobile && (
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>Type your answer and press Enter</p>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════
                DONE SCREEN
            ══════════════════════════════════════════ */}
            {phase === "done" && (
                <div className="w-full max-w-sm text-center flex flex-col gap-5 animate-nb-bounce-in">
                    <div>
                        <div className="text-5xl sm:text-6xl mb-2">⏰</div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">Time&apos;s Up!</h2>
                        <p className="text-xs sm:text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                            {cfg.emoji} {cfg.label} · {currentOpMode.desc} · {digits}D
                        </p>
                    </div>

                    <div className="nb-glass rounded-2xl p-4 sm:p-5 space-y-3">
                        {[
                            { label: "Final Score", value: String(score), color: cfg.color },
                            { label: "High Score", value: String(highScores[diff]), color: "white" },
                            { label: "Answered", value: String(total), color: "white" },
                            { label: "Wrong", value: String(wrong), color: wrong > 0 ? "#f87171" : "#34d399" },
                            { label: "Accuracy", value: `${accuracy}%`, color: accuracy >= 80 ? "#34d399" : accuracy >= 60 ? "#f5a623" : "#f87171" },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</span>
                                <span className="font-mono font-bold text-sm sm:text-base" style={{ color }}>{value}</span>
                            </div>
                        ))}
                        {score >= highScores[diff] && score > 0 && (
                            <div className="pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                                <span className="text-emerald-400 text-xs sm:text-sm font-semibold">✨ New High Score!</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 justify-center">
                        <button onClick={() => startGame(diff, opMode, digits)} className="nb-btn-primary flex-1 max-w-[140px]">Play Again</button>
                        <button onClick={() => setPhase("select")} className="nb-btn-ghost flex-1 max-w-[140px]">Change Mode</button>
                    </div>
                </div>
            )}
        </GameShell>
    );
}
