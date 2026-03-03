"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconPlayerPlay, IconPlayerPause, IconRotate, IconFlag } from "@tabler/icons-react";
import ArrowBackUpIcon from "@/components/ui/arrow-back-up-icon";

// ── helpers ──────────────────────────────────────────────────────────────────
function pad(n: number, len = 2) { return String(n).padStart(len, "0"); }

function fmtMs(ms: number) {
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    const s = Math.floor((ms % 60_000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`;
    return `${pad(m)}:${pad(s)}.${pad(cs)}`;
}

function fmtLap(ms: number) {
    const m = Math.floor(ms / 60_000);
    const s = Math.floor((ms % 60_000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${pad(m)}:${pad(s)}.${pad(cs)}`;
}

interface Lap { index: number; split: number; total: number; isBest: boolean; isWorst: boolean; }

// ── component ─────────────────────────────────────────────────────────────────
export default function StopwatchPage() {
    const [elapsed, setElapsed] = useState(0);
    const [running, setRunning] = useState(false);
    const [laps, setLaps] = useState<Lap[]>([]);
    const startRef = useRef<number | null>(null);
    const accRef = useRef(0);
    const rafRef = useRef<number | null>(null);
    const lapStartRef = useRef(0); // elapsed at last lap

    // rAF tick
    useEffect(() => {
        if (running) {
            startRef.current = Date.now();
            const tick = () => {
                setElapsed(accRef.current + (Date.now() - (startRef.current ?? Date.now())));
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
    }, [running]);

    const handleToggle = () => setRunning((r) => !r);

    const handleLap = useCallback(() => {
        if (!running) return;
        const currentElapsed = accRef.current + (Date.now() - (startRef.current ?? Date.now()));
        const split = currentElapsed - lapStartRef.current;
        lapStartRef.current = currentElapsed;

        setLaps((prev) => {
            const newLap: Lap = { index: prev.length + 1, split, total: currentElapsed, isBest: false, isWorst: false };
            const allLaps = [...prev, newLap];
            // mark best/worst splits
            if (allLaps.length >= 2) {
                const splits = allLaps.map((l) => l.split);
                const minS = Math.min(...splits);
                const maxS = Math.max(...splits);
                return allLaps.map((l) => ({ ...l, isBest: l.split === minS, isWorst: l.split === maxS }));
            }
            return allLaps;
        });
    }, [running]);

    const handleReset = () => {
        setRunning(false);
        setElapsed(0);
        setLaps([]);
        accRef.current = 0;
        startRef.current = null;
        lapStartRef.current = 0;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };

    const currentSplit = elapsed - lapStartRef.current;

    // Circular progress for the face (0-60s cycle)
    const secondsFraction = (elapsed % 60_000) / 60_000;
    const circumference = 2 * Math.PI * 110;
    const strokeDash = circumference * secondsFraction;

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "var(--nb-bg)" }}>
            {/* Ambient orb */}
            <div className="nb-orb w-96 h-96 bg-amber-500 -top-40 -right-32" style={{ opacity: 0.08 }} />

            {/* Topbar */}
            <div className="nb-topbar">
                <div className="flex items-center gap-2">
                    <Link href="/"
                        className="rounded-lg flex items-center justify-center transition-all hover:scale-110"
                        style={{ color: "rgba(255,255,255,0.55)" }}>
                        <ArrowBackUpIcon size={22} />
                    </Link>
                    <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
                    <h1 className="font-bold text-base">⏱️ Stopwatch</h1>
                </div>
                <div className="nb-glass px-3 py-1.5 rounded-xl">
                    <span className="font-mono font-bold text-amber-400 text-sm tracking-widest">
                        {fmtMs(elapsed)}
                    </span>
                </div>
            </div>

            <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-start justify-center gap-8 px-4 sm:px-6 py-8 max-w-4xl mx-auto w-full">

                {/* ── Left: Clock face + controls ── */}
                <div className="flex flex-col items-center gap-6 w-full lg:w-auto">

                    {/* SVG Clock face */}
                    <div className="relative">
                        <svg width="260" height="260" viewBox="0 0 260 260" className="drop-shadow-2xl">
                            {/* Track */}
                            <circle cx="130" cy="130" r="110" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                            {/* Progress arc */}
                            <circle
                                cx="130" cy="130" r="110"
                                fill="none"
                                stroke={running ? "#f5a623" : "rgba(245,166,35,0.3)"}
                                strokeWidth="10"
                                strokeLinecap="round"
                                strokeDasharray={`${strokeDash} ${circumference}`}
                                transform="rotate(-90 130 130)"
                                style={{ transition: "stroke-dasharray 0.05s linear" }}
                            />
                            {/* Tick marks */}
                            {Array.from({ length: 60 }, (_, i) => {
                                const angle = (i / 60) * 2 * Math.PI - Math.PI / 2;
                                const isMajor = i % 5 === 0;
                                const r1 = isMajor ? 96 : 100;
                                const r2 = 105;
                                const x1 = 130 + r1 * Math.cos(angle);
                                const y1 = 130 + r1 * Math.sin(angle);
                                const x2 = 130 + r2 * Math.cos(angle);
                                const y2 = 130 + r2 * Math.sin(angle);
                                return (
                                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                                        stroke={isMajor ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)"}
                                        strokeWidth={isMajor ? 2 : 1} />
                                );
                            })}
                            {/* Second hand */}
                            <line
                                x1="130" y1="130"
                                x2={130 + 80 * Math.cos(secondsFraction * 2 * Math.PI - Math.PI / 2)}
                                y2={130 + 80 * Math.sin(secondsFraction * 2 * Math.PI - Math.PI / 2)}
                                stroke="#f5a623" strokeWidth="2" strokeLinecap="round"
                                style={{ transition: "x2 0.05s linear, y2 0.05s linear" }}
                            />
                            {/* Center dot */}
                            <circle cx="130" cy="130" r="5" fill="#f5a623" />
                        </svg>

                        {/* Digital readout in center */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl sm:text-4xl font-mono font-bold text-white tracking-wider">
                                {fmtMs(elapsed)}
                            </span>
                            {laps.length > 0 && (
                                <span className="text-xs font-mono mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                                    Lap {laps.length + 1} · {fmtLap(currentSplit)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-4">
                        {/* Lap / Reset */}
                        <button
                            onClick={running ? handleLap : handleReset}
                            className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90"
                            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                        >
                            {running
                                ? <IconFlag size={20} className="text-white/70" />
                                : <IconRotate size={20} className="text-white/70" />
                            }
                        </button>

                        {/* Start / Pause — large */}
                        <button
                            onClick={handleToggle}
                            className="w-20 h-20 rounded-full flex items-center justify-center text-xl transition-all hover:scale-105 active:scale-95 font-bold"
                            style={{
                                background: running
                                    ? "linear-gradient(135deg, rgba(248,113,113,0.9), rgba(239,68,68,0.9))"
                                    : "linear-gradient(135deg, #f5a623, #f97316)",
                                boxShadow: running
                                    ? "0 0 32px rgba(248,113,113,0.4)"
                                    : "0 0 32px rgba(245,166,35,0.45)",
                                color: "#000",
                            }}
                        >
                            {running
                                ? <IconPlayerPause size={28} />
                                : <IconPlayerPlay size={28} className="ml-1" />
                            }
                        </button>

                        {/* Placeholder — mirrors lap button */}
                        <div className="w-14 h-14" />
                    </div>

                    {/* Quick stats */}
                    {laps.length > 0 && (
                        <div className="flex gap-3">
                            <div className="nb-stat">
                                <span className="nb-stat-value text-white">{laps.length}</span>
                                <span className="nb-stat-label">laps</span>
                            </div>
                            <div className="nb-stat">
                                <span className="nb-stat-value text-emerald-400 text-base">{fmtLap(Math.min(...laps.map((l) => l.split)))}</span>
                                <span className="nb-stat-label">best</span>
                            </div>
                            <div className="nb-stat">
                                <span className="nb-stat-value text-red-400 text-base">{fmtLap(Math.max(...laps.map((l) => l.split)))}</span>
                                <span className="nb-stat-label">worst</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Right: Lap list ── */}
                <div className="flex-1 w-full lg:max-w-xs">
                    {laps.length > 0 ? (
                        <div className="nb-glass rounded-2xl overflow-hidden">
                            <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
                                    Lap Times
                                </p>
                            </div>
                            <div className="divide-y divide-white/6 max-h-[420px] overflow-y-auto">
                                {[...laps].reverse().map((lap) => (
                                    <div key={lap.index} className="flex items-center justify-between px-4 py-3">
                                        <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
                                            Lap {lap.index}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <span className={`font-mono font-bold text-sm ${lap.isBest ? "text-emerald-400" : lap.isWorst ? "text-red-400" : "text-white"}`}>
                                                {fmtLap(lap.split)}
                                            </span>
                                            {lap.isBest && <span className="text-xs text-emerald-400">▲ best</span>}
                                            {lap.isWorst && laps.length > 1 && <span className="text-xs text-red-400">▼ worst</span>}
                                            <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>
                                                {fmtLap(lap.total)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="nb-glass rounded-2xl p-8 text-center">
                            <p className="text-4xl mb-3">🏁</p>
                            <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                                Start the stopwatch, then press the flag to record laps.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
