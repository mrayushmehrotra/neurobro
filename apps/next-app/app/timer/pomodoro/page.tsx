
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconPlayerPlay, IconPlayerPause, IconRotate, IconPlayerSkipForward } from "@tabler/icons-react";
import ArrowBackUpIcon from "@/components/ui/arrow-back-up-icon";

// ── Config ─────────────────────────────────────────────────────────────────────
type SessionType = "focus" | "short" | "long";

const SESSION_CONFIG: Record<SessionType, { label: string; emoji: string; defaultMin: number; color: string; bg: string; border: string; ring: string }> = {
    focus: { label: "Focus", emoji: "🍅", defaultMin: 25, color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)", ring: "rgba(248,113,113,0.5)" },
    short: { label: "Short Break", emoji: "☕", defaultMin: 5, color: "#34d399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)", ring: "rgba(52,211,153,0.5)" },
    long: { label: "Long Break", emoji: "🌿", defaultMin: 15, color: "#38bdf8", bg: "rgba(56,189,248,0.12)", border: "rgba(56,189,248,0.3)", ring: "rgba(56,189,248,0.5)" },
};

// After every 4 focus sessions → long break, otherwise short break
function nextSession(type: SessionType, completedFocus: number): SessionType {
    if (type !== "focus") return "focus";
    return completedFocus > 0 && completedFocus % 4 === 0 ? "long" : "short";
}

function pad(n: number) { return String(n).padStart(2, "0"); }
function fmtCountdown(ms: number) {
    const m = Math.floor(ms / 60_000);
    const s = Math.floor((ms % 60_000) / 1000);
    return `${pad(m)}:${pad(s)}`;
}

const POMODORO_SEQUENCE: SessionType[] = ["focus", "short", "focus", "short", "focus", "short", "focus", "long"];

// ── Component ─────────────────────────────────────────────────────────────────
export default function PomodoroPage() {
    const [durations, setDurations] = useState({ focus: 25, short: 5, long: 15 });
    const [sessionType, setSessionType] = useState<SessionType>("focus");
    const [completedFocus, setCompletedFocus] = useState(0);
    const [totalSessions, setTotalSessions] = useState(0);
    const [remaining, setRemaining] = useState(durations.focus * 60_000);
    const [running, setRunning] = useState(false);
    const [editingType, setEditingType] = useState<SessionType | null>(null);
    const [justFinished, setJustFinished] = useState(false);
    const startRef = useRef<number | null>(null);
    const accRef = useRef(0);
    const rafRef = useRef<number | null>(null);
    const yayRef = useRef<HTMLAudioElement | null>(null);

    // Initialise audio once on client
    useEffect(() => {
        yayRef.current = new Audio("/yay.mp3");
        yayRef.current.volume = 0.8;
    }, []);

    // Play yay! whenever a session completes
    useEffect(() => {
        if (justFinished && yayRef.current) {
            yayRef.current.currentTime = 0;
            yayRef.current.play().catch(() => { }); // swallow autoplay policy errors
        }
    }, [justFinished]);

    const cfg = SESSION_CONFIG[sessionType];
    const totalMs = durations[sessionType] * 60_000;

    // Reset acc when session changes
    const initSession = useCallback((type: SessionType, dur: typeof durations) => {
        setRunning(false);
        setSessionType(type);
        setRemaining(dur[type] * 60_000);
        setJustFinished(false);
        accRef.current = 0;
        startRef.current = null;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }, []);

    // rAF timer
    useEffect(() => {
        if (running) {
            startRef.current = Date.now();
            const tick = () => {
                const spent = accRef.current + (Date.now() - (startRef.current ?? Date.now()));
                const left = Math.max(0, totalMs - spent);
                setRemaining(left);
                if (left <= 0) {
                    // session done
                    setRunning(false);
                    setJustFinished(true);
                    if (sessionType === "focus") {
                        setCompletedFocus((n) => n + 1);
                    }
                    setTotalSessions((n) => n + 1);
                    accRef.current = totalMs;
                    return;
                }
                rafRef.current = requestAnimationFrame(tick);
            };
            rafRef.current = requestAnimationFrame(tick);
        } else {
            if (startRef.current !== null) {
                accRef.current += Date.now() - startRef.current;
                startRef.current = null;
            }
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        }
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [running, totalMs, sessionType]);

    const handleToggle = () => {
        if (justFinished) return;
        setRunning((r) => !r);
    };

    const handleSkip = useCallback(() => {
        const next = nextSession(sessionType, completedFocus + (sessionType === "focus" ? 1 : 0));
        initSession(next, durations);
    }, [sessionType, completedFocus, durations, initSession]);

    const handleReset = () => initSession(sessionType, durations);

    const handleNextAfterFinish = useCallback(() => {
        const next = nextSession(sessionType, completedFocus);
        initSession(next, durations);
    }, [sessionType, completedFocus, durations, initSession]);

    const handleManualSession = (type: SessionType) => {
        if (type !== sessionType) initSession(type, durations);
    };

    const handleDurationChange = (type: SessionType, val: number) => {
        const clamped = Math.max(1, Math.min(60, val));
        const newDur = { ...durations, [type]: clamped };
        setDurations(newDur);
        if (type === sessionType && !running) {
            setRemaining(clamped * 60_000);
            accRef.current = 0;
        }
    };

    // Ring progress (SVG arc)
    const radius = 110;
    const circumference = 2 * Math.PI * radius;
    const progress = totalMs > 0 ? 1 - remaining / totalMs : 0;
    const strokeOffset = circumference * (1 - progress);

    // Sequence dots
    const seqIndex = totalSessions % POMODORO_SEQUENCE.length;

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "var(--nb-bg)" }}>
            {/* Ambient orb — changes with session */}
            <div
                className="nb-orb w-[500px] h-[500px] -top-40 -right-40"
                style={{ background: cfg.color, opacity: 0.07, transition: "background 0.6s ease" }}
            />

            {/* Topbar */}
            <div className="nb-topbar">
                <div className="flex items-center gap-2">
                    <Link href="/"
                        className="rounded-lg flex items-center justify-center transition-all hover:scale-110"
                        style={{ color: "rgba(255,255,255,0.55)" }}>
                        <ArrowBackUpIcon size={22} />
                    </Link>
                    <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
                    <h1 className="font-bold text-base">🍅 Pomodoro</h1>
                </div>
                {/* Session stats */}
                <div className="flex items-center gap-3">
                    <div className="nb-stat">
                        <span className="nb-stat-value text-white">{completedFocus}</span>
                        <span className="nb-stat-label">sessions</span>
                    </div>
                </div>
            </div>

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-6 sm:gap-8 px-4 sm:px-6 pb-8">

                {/* ── Session selector tabs ── */}
                <div className="flex items-center gap-1.5 p-1 rounded-2xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    {(["focus", "short", "long"] as SessionType[]).map((type) => {
                        const c = SESSION_CONFIG[type];
                        const isActive = sessionType === type;
                        return (
                            <button
                                key={type}
                                onClick={() => handleManualSession(type)}
                                className="px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200"
                                style={
                                    isActive
                                        ? { background: c.bg, border: `1px solid ${c.border}`, color: c.color }
                                        : { color: "rgba(255,255,255,0.4)", background: "transparent", border: "1px solid transparent" }
                                }
                            >
                                {c.emoji} {c.label}
                            </button>
                        );
                    })}
                </div>

                {/* ── Sequence progress dots ── */}
                <div className="flex items-center gap-1.5">
                    {POMODORO_SEQUENCE.map((type, i) => {
                        const c = SESSION_CONFIG[type];
                        const isDone = i < seqIndex;
                        const isCurrent = i === seqIndex;
                        return (
                            <div
                                key={i}
                                className="rounded-full transition-all duration-300"
                                style={{
                                    width: isCurrent ? "20px" : "8px",
                                    height: "8px",
                                    background: isDone ? c.color : isCurrent ? cfg.color : "rgba(255,255,255,0.12)",
                                    opacity: isDone ? 0.7 : 1,
                                }}
                            />
                        );
                    })}
                </div>

                {/* ── Ring clock ── */}
                <div className="relative animate-nb-scale-in">
                    <svg width="260" height="260" viewBox="0 0 260 260" className="drop-shadow-2xl">
                        {/* BG track */}
                        <circle cx="130" cy="130" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
                        {/* Progress arc */}
                        <circle
                            cx="130" cy="130" r={radius}
                            fill="none"
                            stroke={cfg.color}
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeOffset}
                            transform="rotate(-90 130 130)"
                            style={{ transition: "stroke-dashoffset 0.5s linear, stroke 0.6s ease" }}
                        />
                        {/* Glow ring */}
                        <circle
                            cx="130" cy="130" r={radius}
                            fill="none"
                            stroke={cfg.ring}
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeOffset}
                            transform="rotate(-90 130 130)"
                            style={{ filter: "blur(6px)", transition: "stroke-dashoffset 0.5s linear" }}
                        />
                    </svg>

                    {/* Center content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                        <span className="text-5xl sm:text-6xl font-mono font-bold text-white tracking-wider">
                            {fmtCountdown(remaining)}
                        </span>
                        <span className="text-sm font-medium" style={{ color: cfg.color }}>
                            {cfg.emoji} {cfg.label}
                        </span>
                        {running && (
                            <span className="text-xs animate-pulse mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                                Stay focused…
                            </span>
                        )}
                    </div>
                </div>

                {/* ── Finished state ── */}
                {justFinished && (
                    <div className="text-center space-y-3 animate-nb-bounce-in">
                        <p className="text-2xl font-bold" style={{ color: cfg.color }}>
                            {sessionType === "focus" ? "🎉 Session Complete!" : "⚡ Break Over!"}
                        </p>
                        <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                            {sessionType === "focus"
                                ? `Great work! ${completedFocus} session${completedFocus !== 1 ? "s" : ""} done.`
                                : "Ready to get back to it?"}
                        </p>
                        <button onClick={handleNextAfterFinish} className="nb-btn-primary">
                            {nextSession(sessionType, completedFocus) === "focus" ? "🍅 Start Focus" : nextSession(sessionType, completedFocus) === "short" ? "☕ Short Break" : "🌿 Long Break"}
                        </button>
                    </div>
                )}

                {/* ── Controls ── */}
                {!justFinished && (
                    <div className="flex items-center gap-4">
                        {/* Reset */}
                        <button
                            onClick={handleReset}
                            className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90"
                            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
                        >
                            <IconRotate size={18} className="text-white/60" />
                        </button>

                        {/* Play / Pause — large */}
                        <button
                            onClick={handleToggle}
                            className="w-20 h-20 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                            style={{
                                background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)`,
                                boxShadow: `0 0 40px ${cfg.ring}`,
                                color: "#000",
                            }}
                        >
                            {running
                                ? <IconPlayerPause size={30} />
                                : <IconPlayerPlay size={30} className="ml-1" />
                            }
                        </button>

                        {/* Skip */}
                        <button
                            onClick={handleSkip}
                            className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90"
                            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
                        >
                            <IconPlayerSkipForward size={18} className="text-white/60" />
                        </button>
                    </div>
                )}

                {/* ── Duration settings ── */}
                <div className="w-full max-w-sm">
                    <p className="text-xs font-semibold uppercase tracking-widest text-center mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>
                        Duration Settings (minutes) <br />
                        double tap to edit the time
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                        {(["focus", "short", "long"] as SessionType[]).map((type) => {
                            const c = SESSION_CONFIG[type];
                            const isEditing = editingType === type;
                            return (
                                <div key={type} className="nb-glass rounded-xl p-3 text-center"
                                    style={{ border: `1px solid ${type === sessionType ? c.border : "rgba(255,255,255,0.08)"}` }}>
                                    <p className="text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>{c.emoji} {c.label.split(" ")[0]}</p>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            autoFocus
                                            defaultValue={durations[type]}
                                            onBlur={(e) => { handleDurationChange(type, parseInt(e.target.value) || durations[type]); setEditingType(null); }}
                                            onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                                            className="w-full text-center text-lg font-mono font-bold rounded-lg py-0.5 outline-none"
                                            style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color }}
                                            min={1} max={60}
                                        />
                                    ) : (
                                        <button
                                            onClick={() => { if (!running) setEditingType(type); }}
                                            className="text-xl font-mono font-bold transition-all hover:scale-110"
                                            style={{ color: type === sessionType ? c.color : "rgba(255,255,255,0.7)" }}
                                        >
                                            {durations[type]}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {!running && <p className="text-center text-xs mt-2" style={{ color: "rgba(255,255,255,0.2)" }}>Tap a number to edit</p>}
                </div>
            </div>
        </div>
    );
}
