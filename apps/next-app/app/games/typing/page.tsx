"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameShell from "@/components/GameShell";
import { GameTimerHandle } from "@/components/GameTimer";

export const dynamic = "force-dynamic";

// ─── word pool ───────────────────────────────────────────────────────────────
const WORD_POOL = "the be to of and a in that have it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most great between need large often hand high place hold turn help next live show still around form air move try ask men read land home point play small number off always food found study book light voice power town fine drive short road grow enough took four head above kind began both full those every near here felt since might face once real life few north open seem together white children begin got walk example ease paper group music letter until mile river car feet care second plain girl young ready".split(" ");

function generateWords(n: number): string[] {
    const result: string[] = [];
    const pool = [...WORD_POOL];
    while (result.length < n) {
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        result.push(...pool.slice(0, Math.min(pool.length, n - result.length)));
    }
    return result;
}

type TimeOption = 15 | 30 | 60 | 120;
type Phase = "idle" | "typing" | "done";
const TIME_OPTIONS: TimeOption[] = [15, 30, 60, 120];

// ─── component ───────────────────────────────────────────────────────────────
export default function TypingGame() {
    const [timeOpt, setTimeOpt] = useState<TimeOption>(30);
    const [phase, setPhase] = useState<Phase>("idle");
    const [words, setWords] = useState<string[]>(() => generateWords(250));
    const [typed, setTyped] = useState("");
    const [liveWpm, setLiveWpm] = useState(0);
    const [liveAcc, setLiveAcc] = useState(100);

    // Results
    const [resWpm, setResWpm] = useState(0);
    const [resAcc, setResAcc] = useState(100);
    const [resCorrect, setResCorrect] = useState(0);
    const [resWrong, setResWrong] = useState(0);

    const timerRef = useRef<GameTimerHandle>(null);
    const typedRef = useRef("");
    const targetTextRef = useRef("");
    const startTimeRef = useRef(0);
    const phaseRef = useRef<Phase>("idle");
    const timeOptRef = useRef<TimeOption>(30);
    const textContainerRef = useRef<HTMLDivElement>(null);
    const caretCharRef = useRef<HTMLSpanElement>(null);

    const targetText = words.join(" ");

    // Keep refs in sync
    useEffect(() => { targetTextRef.current = targetText; }, [targetText]);
    useEffect(() => { phaseRef.current = phase; }, [phase]);
    useEffect(() => { timeOptRef.current = timeOpt; }, [timeOpt]);

    // Compute stats helper
    const computeStats = (typedStr: string, elapsedMs: number) => {
        let correct = 0, wrong = 0;
        const target = targetTextRef.current;
        for (let i = 0; i < typedStr.length; i++) {
            if (i < target.length && typedStr[i] === target[i]) correct++;
            else wrong++;
        }
        const minutes = Math.max(elapsedMs / 60000, 0.00001);
        const wpm = Math.round((correct / 5) / minutes);
        const accuracy = typedStr.length > 0 ? Math.round((correct / typedStr.length) * 100) : 100;
        return { wpm, accuracy, correct, wrong };
    };

    // Auto-scroll caret into view
    useEffect(() => {
        if (!caretCharRef.current || !textContainerRef.current) return;
        const container = textContainerRef.current;
        const caretTop = caretCharRef.current.offsetTop;
        const lineH = 52; // approx line height
        container.scrollTop = Math.max(0, caretTop - lineH);
    }, [typed]);

    // Live stats interval
    useEffect(() => {
        if (phase !== "typing") return;
        const id = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const { wpm, accuracy } = computeStats(typedRef.current, elapsed);
            setLiveWpm(wpm);
            setLiveAcc(accuracy);
        }, 300);
        return () => clearInterval(id);
    }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

    // Timer expire
    const handleExpire = useCallback(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const { wpm, accuracy, correct, wrong } = computeStats(typedRef.current, elapsed);
        setResWpm(wpm);
        setResAcc(accuracy);
        setResCorrect(correct);
        setResWrong(wrong);
        setPhase("done");
        phaseRef.current = "done";
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // New game / reset
    const reset = useCallback((time?: TimeOption) => {
        const t = time ?? timeOptRef.current;
        setTimeOpt(t);
        timeOptRef.current = t;
        setWords(generateWords(250));
        setTyped("");
        typedRef.current = "";
        setLiveWpm(0);
        setLiveAcc(100);
        setPhase("idle");
        phaseRef.current = "idle";
        timerRef.current?.reset();
        if (textContainerRef.current) textContainerRef.current.scrollTop = 0;
    }, []);

    // Global keydown handler
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (phaseRef.current === "done") {
            if (e.key === "Tab" || e.key === " ") { e.preventDefault(); reset(); }
            return;
        }

        // Tab always resets
        if (e.key === "Tab") { e.preventDefault(); reset(); return; }

        // Escape goes to idle
        if (e.key === "Escape") { e.preventDefault(); reset(); return; }

        // Ignore browser-level shortcuts
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        // Start on first real keypress
        if (phaseRef.current === "idle" && (e.key.length === 1 || e.key === "Backspace")) {
            startTimeRef.current = Date.now();
            setPhase("typing");
            phaseRef.current = "typing";
        }

        if (phaseRef.current !== "typing") return;

        if (e.key === "Backspace") {
            e.preventDefault();
            typedRef.current = typedRef.current.slice(0, -1);
            setTyped(typedRef.current);
            return;
        }

        if (e.key.length !== 1) return;
        e.preventDefault();

        if (typedRef.current.length >= targetTextRef.current.length) return;
        typedRef.current += e.key;
        setTyped(typedRef.current);
    }, [reset]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    // ── text rendering ────────────────────────────────────────────────────────
    const renderText = () => (
        <div
            ref={textContainerRef}
            className="overflow-y-hidden relative"
            style={{ height: "10rem", scrollBehavior: "smooth" }}
        >
            {/* Top + bottom fade */}
            <div className="absolute top-0 inset-x-0 h-5 z-10 pointer-events-none"
                style={{ background: "linear-gradient(to bottom, rgba(8,8,15,0.9), transparent)" }} />
            <div className="absolute bottom-0 inset-x-0 h-8 z-10 pointer-events-none"
                style={{ background: "linear-gradient(to top, rgba(8,8,15,0.9), transparent)" }} />

            <p className="font-mono text-lg sm:text-xl leading-[3.2rem] select-none whitespace-pre-wrap break-words">
                {targetText.split("").map((char, i) => {
                    const typedChar = typed[i];
                    const isCaret = i === typed.length;
                    const isPending = typedChar === undefined;

                    let color = "rgba(255,255,255,0.2)"; // pending
                    let bg = "transparent";
                    let textDecoration = "none";

                    if (!isPending) {
                        if (typedChar === char) {
                            color = "rgba(255,255,255,0.88)"; // correct
                        } else {
                            color = "#f87171"; // wrong
                            if (char === " ") bg = "rgba(248,113,113,0.3)"; // wrong space
                        }
                    }

                    return (
                        <span
                            key={i}
                            ref={isCaret ? caretCharRef : null}
                            style={{
                                color,
                                background: bg,
                                textDecoration,
                                // Caret: blinking left border
                                borderLeft: isCaret ? "2px solid #f5a623" : "2px solid transparent",
                                marginLeft: isCaret ? "-2px" : undefined,
                                transition: "color 0.08s",
                            }}
                            className={isCaret ? "nb-caret" : undefined}
                        >
                            {char}
                        </span>
                    );
                })}
                {/* Caret at very end */}
                {typed.length >= targetText.length && (
                    <span className="nb-caret" style={{ borderLeft: "2px solid #f5a623" }}>
                        &nbsp;
                    </span>
                )}
            </p>
        </div>
    );

    // ── header pills ──────────────────────────────────────────────────────────
    const headerRight = phase !== "done" ? (
        <div className="flex items-center gap-1">
            {TIME_OPTIONS.map((t) => (
                <button
                    key={t}
                    onClick={() => reset(t)}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all duration-150"
                    style={{
                        background: t === timeOpt ? "rgba(34,211,238,0.15)" : "rgba(255,255,255,0.05)",
                        border: `1px solid ${t === timeOpt ? "rgba(34,211,238,0.4)" : "rgba(255,255,255,0.08)"}`,
                        color: t === timeOpt ? "#22d3ee" : "rgba(255,255,255,0.4)",
                    }}
                >
                    {t}s
                </button>
            ))}
        </div>
    ) : undefined;

    return (
        <GameShell
            title="Typing Speed"
            emoji="⌨️"
            accentColor="rgba(34,211,238,0.15)"
            timerRef={timerRef}
            timerMode="down"
            timerInitialSeconds={timeOpt}
            timerRunning={phase === "typing"}
            onTimerExpire={handleExpire}
            headerRight={headerRight}
            badge={
                phase !== "idle" && phase !== "done" ? (
                    <span className="nb-badge text-xs font-semibold"
                        style={{ background: "rgba(34,211,238,0.1)", borderColor: "rgba(34,211,238,0.25)", color: "#22d3ee" }}>
                        ⌨️ {timeOpt}s
                    </span>
                ) : undefined
            }
        >

            {/* ══ IDLE + TYPING ══════════════════════════════════════════════ */}
            {phase !== "done" && (
                <div className="w-full max-w-2xl flex flex-col gap-5 animate-nb-scale-in">

                    {/* Stats / hint row */}
                    <div className="flex items-center justify-center gap-6 h-14">
                        {phase === "typing" ? (
                            <>
                                <div className="nb-stat">
                                    <span className="nb-stat-value text-2xl" style={{ color: "#22d3ee" }}>{liveWpm}</span>
                                    <span className="nb-stat-label">wpm</span>
                                </div>
                                <div className="nb-stat">
                                    <span className={`nb-stat-value text-2xl ${liveAcc >= 95 ? "text-emerald-400" : liveAcc >= 80 ? "text-amber-400" : "text-red-400"}`}>
                                        {liveAcc}%
                                    </span>
                                    <span className="nb-stat-label">accuracy</span>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-1">
                                <p className="text-2xl">⌨️</p>
                                <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
                                    Start typing to begin the {timeOpt}s test
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Typing area */}
                    <div
                        className="nb-glass rounded-2xl px-5 py-4 cursor-default"
                        onClick={() => window.focus()}
                    >
                        {renderText()}
                    </div>

                    {/* Bottom hint */}
                    <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.18)" }}>
                        {phase === "idle"
                            ? "Type the words above — timer starts automatically"
                            : "Tab — restart  ·  Esc — reset"}
                    </p>
                </div>
            )}

            {/* ══ DONE ═══════════════════════════════════════════════════════ */}
            {phase === "done" && (
                <div className="w-full max-w-sm flex flex-col gap-5 text-center animate-nb-bounce-in">
                    <div>
                        <div className="text-5xl mb-2">⌨️</div>
                        <h2 className="text-4xl font-bold font-mono" style={{ color: "#22d3ee" }}>
                            {resWpm}
                            <span className="text-xl font-normal ml-2" style={{ color: "rgba(34,211,238,0.6)" }}>wpm</span>
                        </h2>
                        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                            {timeOpt}s test · {resAcc}% accuracy
                        </p>
                    </div>

                    <div className="nb-glass rounded-2xl p-5 space-y-3">
                        {[
                            { label: "WPM", value: String(resWpm), color: "#22d3ee" },
                            { label: "Accuracy", value: `${resAcc}%`, color: resAcc >= 95 ? "#34d399" : resAcc >= 80 ? "#f5a623" : "#f87171" },
                            { label: "Correct", value: String(resCorrect), color: "#34d399" },
                            { label: "Wrong", value: String(resWrong), color: resWrong === 0 ? "#34d399" : "#f87171" },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="flex items-center justify-between">
                                <span className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</span>
                                <span className="font-mono font-bold text-base" style={{ color }}>{value}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3 justify-center">
                        <button onClick={() => reset(timeOpt)} className="nb-btn-primary flex-1 max-w-[140px]">
                            Try Again
                        </button>
                        <button onClick={() => reset()} className="nb-btn-ghost flex-1 max-w-[140px]">
                            Change Time
                        </button>
                    </div>

                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.18)" }}>
                        Tab or Space to restart quickly
                    </p>
                </div>
            )}
        </GameShell>
    );
}
