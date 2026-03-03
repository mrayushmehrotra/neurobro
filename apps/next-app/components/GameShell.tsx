"use client";

import Link from "next/link";
import { ReactNode } from "react";
import GameTimer, { GameTimerHandle } from "@/components/GameTimer";
import { RefObject } from "react";
import ArrowBackUpIcon from "@/components/ui/arrow-back-up-icon";

interface GameShellProps {
    title: string;
    emoji: string;
    badge?: ReactNode;
    timerRef?: RefObject<GameTimerHandle | null>;
    timerMode?: "up" | "down";
    timerInitialSeconds?: number;
    timerRunning?: boolean;
    onTimerExpire?: () => void;
    headerRight?: ReactNode;
    children: ReactNode;
    accentColor?: string;
}

export default function GameShell({
    title,
    emoji,
    badge,
    timerRef,
    timerMode = "up",
    timerInitialSeconds = 60,
    timerRunning = false,
    onTimerExpire,
    headerRight,
    children,
    accentColor = "rgba(245,166,35,0.15)",
}: GameShellProps) {
    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "var(--nb-bg)" }}>

            {/* Background orb */}
            <div className="nb-orb w-[500px] h-[500px] rounded-full -top-48 -right-48 pointer-events-none"
                style={{ background: accentColor, filter: "blur(100px)", opacity: 0.5 }} />

            {/* ── Top bar ── */}
            <div className="nb-topbar">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <Link
                        href="/"
                        className="shrink-0 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                        style={{ color: "rgba(255,255,255,0.55)" }}
                    >
                        <ArrowBackUpIcon size={22} />
                    </Link>
                    <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
                    <h1 className="font-bold text-sm sm:text-base flex items-center gap-1.5 text-white truncate">
                        <span>{emoji}</span>
                        <span className="truncate">{title}</span>
                    </h1>
                    {badge}
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    {timerRef && (
                        <div className="nb-glass px-3 py-1.5 rounded-xl">
                            <GameTimer
                                ref={timerRef}
                                mode={timerMode}
                                initialSeconds={timerInitialSeconds}
                                running={timerRunning}
                                onExpire={onTimerExpire}
                            />
                        </div>
                    )}
                    {headerRight}
                </div>
            </div>

            {/* ── Content ── */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8">
                {children}
            </div>
        </div>
    );
}
