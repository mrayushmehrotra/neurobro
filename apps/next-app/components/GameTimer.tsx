"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export type TimerMode = "up" | "down";

export interface GameTimerHandle {
    reset: () => void;
    getElapsed: () => number;
}

interface GameTimerProps {
    mode?: TimerMode;
    initialSeconds?: number;
    running?: boolean;
    onExpire?: () => void;
    className?: string;
    compact?: boolean;
}

function pad(n: number) { return String(n).padStart(2, "0"); }

function formatTime(ms: number, compact = false): string {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (compact) return `${pad(mins)}:${pad(secs)}`;
    const centis = Math.floor((ms % 1000) / 10);
    return `${pad(mins)}:${pad(secs)}.${pad(centis)}`;
}

const GameTimer = forwardRef<GameTimerHandle, GameTimerProps>(function GameTimer(
    { mode = "up", initialSeconds = 60, running = false, onExpire, className = "", compact = false },
    ref
) {
    const [elapsed, setElapsed] = useState(0);
    const startRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);
    const accRef = useRef(0);

    useImperativeHandle(ref, () => ({
        reset() {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            accRef.current = 0;
            startRef.current = null;
            setElapsed(0);
        },
        getElapsed() {
            return accRef.current + (startRef.current ? Date.now() - startRef.current : 0);
        },
    }));

    useEffect(() => {
        if (running) {
            startRef.current = Date.now();
            const tick = () => {
                const now = Date.now();
                const total = accRef.current + (now - (startRef.current ?? now));
                setElapsed(total);
                if (mode === "down") {
                    if (total >= initialSeconds * 1000) {
                        setElapsed(initialSeconds * 1000);
                        onExpire?.();
                        return;
                    }
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
    }, [running, mode, initialSeconds, onExpire]);

    const displayMs =
        mode === "down"
            ? Math.max(0, initialSeconds * 1000 - elapsed)
            : elapsed;

    const display = formatTime(displayMs, compact);

    // countdown warning thresholds
    const isWarning = mode === "down" && displayMs < 15_000;
    const isDanger = mode === "down" && displayMs < 8_000;

    return (
        <div
            className={`inline-flex items-center gap-2 ${className}`}
            style={{ fontVariantNumeric: "tabular-nums" }}
        >
            {/* animated dot indicator */}
            <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-500 ${running ? "animate-pulse" : "opacity-30"}`}
                style={{ background: isDanger ? "#f87171" : isWarning ? "#fbbf24" : "#f5a623" }}
            />
            <span
                className={`font-mono font-bold tracking-widest transition-colors duration-300 ${compact ? "text-base" : "text-xl sm:text-2xl"}`}
                style={{ color: isDanger ? "#f87171" : isWarning ? "#fbbf24" : "#f5a623" }}
            >
                {display}
            </span>
        </div>
    );
});

export default GameTimer;
