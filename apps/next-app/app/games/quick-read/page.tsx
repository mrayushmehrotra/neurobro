"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameShell from "@/components/GameShell";

export const dynamic = "force-dynamic";

// ── Passages ──────────────────────────────────────────────────────────────────
const PASSAGES = [
    "The human brain can process images in as little as thirteen milliseconds which is faster than the blink of an eye and far quicker than most people realize during their daily activities",
    "Reading faster does not mean understanding less research shows that trained readers who use rapid serial visual presentation often retain as much information as slower careful readers in controlled studies",
    "The ocean covers more than seventy percent of the surface of the earth yet humans have only explored a small fraction of its depths leaving vast regions completely unknown to modern science",
    "Light travels at approximately three hundred thousand kilometers per second meaning that when you look at the night sky you are seeing stars as they existed thousands of years in the past",
    "Ancient civilizations built massive stone structures without modern machinery using only simple tools and organized human labor to construct monuments that have lasted thousands of years across many continents",
    "The human body contains approximately thirty seven trillion cells each performing specific functions that collectively keep you alive breathing thinking and moving through the world every single day of your life",
    "Forests cover about thirty percent of the land surface of the earth and contain more than eighty percent of all terrestrial species of animals plants and fungi discovered so far",
    "Deep sleep is essential for memory consolidation during this phase the brain replays events from the day transferring information from short term memory into long term storage for future recall",
    "Quantum mechanics suggests that particles can exist in multiple states simultaneously until they are observed a phenomenon known as superposition which challenges our everyday understanding of physical reality",
    "Coffee is the second most traded commodity in the world after petroleum with billions of cups consumed every single day by people on nearly every continent seeking energy and mental clarity",
    "The Amazon rainforest produces twenty percent of the worlds oxygen and houses more than ten percent of all species on earth making it the most biodiverse region on the planet",
    "Music activates more areas of the brain simultaneously than any other human activity which is why it is used in therapy to help patients recover from strokes and brain injuries",
];

const WPM_OPTIONS = [100, 150, 200, 300, 400, 500, 600];

// Words that will never appear in passages — used as distractors
const DISTRACTOR_POOL =
    "marble anchor ribbon falcon cobalt fossil cactus lantern velvet prism glacier penguin amber cedar cobalt silver canvas pillar crimson copper bronze satin venom vortex spiral ember cinder frost quartz".split(
        " "
    );

type Phase = "select" | "countdown" | "reading" | "quiz" | "done";
interface Question {
    prompt: string;
    options: string[];
    correctIndex: number;
}

// ── Spritz ORP helper ─────────────────────────────────────────────────────────
function getORP(word: string): number {
    const clean = word.replace(/[^a-zA-Z]/g, "");
    if (clean.length <= 1) return 0;
    if (clean.length <= 5) return 1;
    if (clean.length <= 9) return 2;
    return 3;
}

// ── Quiz builder ──────────────────────────────────────────────────────────────
function makeQuestions(words: string[]): Question[] {
    const qs: Question[] = [];
    const uniqueWords = [...new Set(words.map((w) => w.toLowerCase().replace(/[^a-z]/g, "")).filter(Boolean))];
    const distractors = DISTRACTOR_POOL.filter((d) => !uniqueWords.includes(d));

    // Q1: Which of these appeared in the passage?
    const pick = uniqueWords[Math.floor(Math.random() * uniqueWords.length)];
    const wrong1 = distractors.sort(() => Math.random() - 0.5).slice(0, 3);
    const opts1 = [...wrong1, pick].sort(() => Math.random() - 0.5);
    qs.push({
        prompt: "Which word appeared in the passage?",
        options: opts1,
        correctIndex: opts1.indexOf(pick),
    });

    // Q2: What came immediately after a specific word?
    const seqIdx = 1 + Math.floor(Math.random() * (uniqueWords.length - 2));
    const prevWord = uniqueWords[seqIdx - 1];
    const nextWord = uniqueWords[seqIdx];
    const wrongSeq = uniqueWords
        .filter((_, i) => i !== seqIdx)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
    const opts2 = [...wrongSeq, nextWord].sort(() => Math.random() - 0.5);
    qs.push({
        prompt: `What word came immediately after "${prevWord}"?`,
        options: opts2,
        correctIndex: opts2.indexOf(nextWord),
    });

    // Q3: Which word was NOT in the passage?
    const absent = distractors.sort(() => Math.random() - 0.5)[0];
    const presentSample = uniqueWords.sort(() => Math.random() - 0.5).slice(0, 3);
    const opts3 = [...presentSample, absent].sort(() => Math.random() - 0.5);
    qs.push({
        prompt: "Which word did NOT appear in the passage?",
        options: opts3,
        correctIndex: opts3.indexOf(absent),
    });

    return qs;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function QuickReadGame() {
    const [phase, setPhase] = useState<Phase>("select");
    const [wpm, setWpm] = useState(250);
    const [words, setWords] = useState<string[]>([]);
    const [wordIndex, setWordIndex] = useState(0);
    const [showWord, setShowWord] = useState(true);
    const [countdown, setCountdown] = useState(3);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [qIndex, setQIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState<{ chosen: number; correct: number }[]>([]);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const wordIndexRef = useRef(0);
    const wordsRef = useRef<string[]>([]);
    const wpmRef = useRef(wpm);

    useEffect(() => { wpmRef.current = wpm; }, [wpm]);

    const msPerWord = Math.round(60000 / wpm);

    // ── Countdown ──────────────────────────────────────────────────────────────
    useEffect(() => {
        if (phase !== "countdown") return;
        if (countdown === 0) { setPhase("reading"); return; }
        const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [phase, countdown]);

    // ── Reading interval ───────────────────────────────────────────────────────
    useEffect(() => {
        if (phase !== "reading") return;
        const ms = Math.round(60000 / wpm);
        const fadeMs = Math.min(ms * 0.18, 60);

        intervalRef.current = setInterval(() => {
            wordIndexRef.current++;
            if (wordIndexRef.current >= wordsRef.current.length) {
                clearInterval(intervalRef.current!);
                const qs = makeQuestions(wordsRef.current);
                setQuestions(qs);
                setQIndex(0);
                setAnswers([]);
                setScore(0);
                setSelectedAnswer(null);
                setPhase("quiz");
                return;
            }
            // Fade out → swap word → fade in
            setShowWord(false);
            setTimeout(() => {
                setWordIndex(wordIndexRef.current);
                setShowWord(true);
            }, fadeMs);
        }, ms);

        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase]);

    // ── Start game ─────────────────────────────────────────────────────────────
    const startGame = useCallback(() => {
        const pIdx = Math.floor(Math.random() * PASSAGES.length);
        const passageWords = PASSAGES[pIdx].toLowerCase().split(" ").filter(Boolean);
        setWords(passageWords);
        wordsRef.current = passageWords;
        wordIndexRef.current = 0;
        setWordIndex(0);
        setShowWord(true);
        setCountdown(3);
        setPhase("countdown");
    }, []);

    // ── Answer quiz ────────────────────────────────────────────────────────────
    const handleAnswer = useCallback((optionIdx: number) => {
        if (selectedAnswer !== null) return;
        setSelectedAnswer(optionIdx);
        const q = questions[qIndex];
        const isCorrect = optionIdx === q.correctIndex;
        setAnswers((prev) => [...prev, { chosen: optionIdx, correct: q.correctIndex }]);
        if (isCorrect) setScore((s) => s + 1);

        setTimeout(() => {
            setSelectedAnswer(null);
            if (qIndex + 1 >= questions.length) {
                setPhase("done");
            } else {
                setQIndex((i) => i + 1);
            }
        }, 900);
    }, [selectedAnswer, questions, qIndex]);

    // ── Reset ──────────────────────────────────────────────────────────────────
    const reset = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setPhase("select");
        setWordIndex(0);
        setShowWord(true);
    }, []);

    const progressPct = words.length > 0 ? Math.round((wordIndex / (words.length - 1)) * 100) : 0;
    const currentWord = words[wordIndex] ?? "";
    const orp = getORP(currentWord);

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <GameShell
            title="Quick Read"
            emoji="👁️"
            accentColor="rgba(251,113,133,0.15)"
            badge={
                phase === "reading" ? (
                    <span
                        className="nb-badge text-xs font-mono font-bold"
                        style={{ background: "rgba(251,113,133,0.1)", borderColor: "rgba(251,113,133,0.3)", color: "#fb7185" }}
                    >
                        {wpm} WPM
                    </span>
                ) : undefined
            }
            headerRight={
                phase === "reading" || phase === "countdown" ? (
                    <button onClick={reset} className="nb-btn-ghost text-xs px-3 py-1.5">Stop</button>
                ) : undefined
            }
        >

            {/* ══ SELECT ═══════════════════════════════════════════════════════ */}
            {phase === "select" && (
                <div className="w-full max-w-lg flex flex-col gap-8 items-center animate-nb-scale-in">
                    <div className="text-center">
                        <div className="text-6xl mb-3 animate-nb-float">👁️</div>
                        <h2 className="text-3xl font-bold text-white mb-2">Quick Read</h2>
                        <p className="text-sm max-w-sm mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
                            Words flash one at a time in the centre. Keep your eyes still and let the words come to you.
                            A short quiz follows — can you remember?
                        </p>
                    </div>

                    {/* WPM selector */}
                    <div className="w-full space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
                                Speed
                            </p>
                            <span className="font-mono font-bold text-lg" style={{ color: "#fb7185" }}>
                                {wpm} <span className="text-sm font-normal" style={{ color: "rgba(255,255,255,0.4)" }}>wpm</span>
                            </span>
                        </div>

                        {/* Preset pills */}
                        <div className="flex flex-wrap gap-2">
                            {WPM_OPTIONS.map((w) => (
                                <button
                                    key={w}
                                    onClick={() => setWpm(w)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all duration-150"
                                    style={{
                                        background: wpm === w ? "rgba(251,113,133,0.18)" : "rgba(255,255,255,0.05)",
                                        border: `1px solid ${wpm === w ? "rgba(251,113,133,0.45)" : "rgba(255,255,255,0.1)"}`,
                                        color: wpm === w ? "#fb7185" : "rgba(255,255,255,0.45)",
                                    }}
                                >
                                    {w}
                                </button>
                            ))}
                        </div>

                        {/* Slider */}
                        <input
                            type="range"
                            min={80}
                            max={700}
                            step={10}
                            value={wpm}
                            onChange={(e) => setWpm(Number(e.target.value))}
                            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                            style={{
                                background: `linear-gradient(to right, #fb7185 0%, #fb7185 ${((wpm - 80) / 620) * 100}%, rgba(255,255,255,0.1) ${((wpm - 80) / 620) * 100}%, rgba(255,255,255,0.1) 100%)`,
                            }}
                        />

                        {/* Time estimate */}
                        <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                            ≈ {Math.ceil((35 / wpm) * 60)}s to read a passage · {(msPerWord / 1000).toFixed(2)}s per word
                        </p>
                    </div>

                    <button onClick={startGame} className="nb-btn-primary w-full max-w-xs">
                        Start Reading →
                    </button>

                    {/* How it works */}
                    <div className="nb-glass rounded-2xl p-4 w-full space-y-2">
                        <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>How it works</p>
                        <div className="grid grid-cols-3 gap-3 text-center">
                            {["Words flash one by one", "Keep eyes on the centre", "Quiz tests recall"].map((s, i) => (
                                <div key={i}>
                                    <p className="text-xl mb-1">{["👁️", "🎯", "🧠"][i]}</p>
                                    <p className="text-xs leading-snug" style={{ color: "rgba(255,255,255,0.4)" }}>{s}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ══ COUNTDOWN ════════════════════════════════════════════════════ */}
            {phase === "countdown" && (
                <div className="flex flex-col items-center gap-4 animate-nb-bounce-in">
                    <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: "rgba(255,255,255,0.3)" }}>
                        Get ready
                    </p>
                    <div
                        className="w-32 h-32 rounded-full flex items-center justify-center"
                        style={{
                            background: "rgba(251,113,133,0.12)",
                            border: "2px solid rgba(251,113,133,0.35)",
                            boxShadow: "0 0 40px rgba(251,113,133,0.2)",
                        }}
                    >
                        <span className="text-6xl font-bold font-mono" style={{ color: "#fb7185" }}>
                            {countdown === 0 ? "GO" : countdown}
                        </span>
                    </div>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                        Keep your eyes on the centre
                    </p>
                </div>
            )}

            {/* ══ READING ══════════════════════════════════════════════════════ */}
            {phase === "reading" && (
                <div className="w-full max-w-2xl flex flex-col items-center gap-8">
                    {/* Word count + progress */}
                    <div className="w-full space-y-2">
                        <div className="flex justify-between items-center text-xs font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>
                            <span>{wordIndex + 1}</span>
                            <span>{words.length}</span>
                        </div>
                        <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                            <div
                                className="h-full rounded-full"
                                style={{
                                    width: `${progressPct}%`,
                                    background: "linear-gradient(90deg, #fb7185, #f43f5e)",
                                    transition: `width ${msPerWord * 0.8}ms linear`,
                                }}
                            />
                        </div>
                    </div>

                    {/* Focus reticle + word */}
                    <div className="relative flex flex-col items-center justify-center" style={{ minHeight: "220px" }}>
                        {/* Horizontal guide line */}
                        <div
                            className="absolute w-full"
                            style={{
                                height: "1px",
                                background: "rgba(251,113,133,0.15)",
                                top: "50%",
                                transform: "translateY(-50%)",
                            }}
                        />

                        {/* Vertical focus markers */}
                        <div className="absolute flex w-full justify-between px-8 pointer-events-none" style={{ top: "50%", transform: "translateY(-50%)" }}>
                            <div style={{ width: "2px", height: "48px", background: "rgba(251,113,133,0.35)", transform: "translateY(-50%)" }} />
                            <div style={{ width: "2px", height: "48px", background: "rgba(251,113,133,0.35)", transform: "translateY(-50%)" }} />
                        </div>

                        {/* The word */}
                        <div
                            style={{
                                opacity: showWord ? 1 : 0,
                                transition: "opacity 0.05s ease",
                                fontFamily: "var(--font-geist-mono, monospace)",
                                fontSize: "clamp(2rem, 6vw, 4rem)",
                                fontWeight: 700,
                                letterSpacing: "0.04em",
                                userSelect: "none",
                                pointerEvents: "none",
                            }}
                        >
                            {/* Spritz-style ORP colouring */}
                            <span style={{ color: "rgba(255,255,255,0.35)" }}>{currentWord.slice(0, orp)}</span>
                            <span style={{ color: "#fb7185", textShadow: "0 0 20px rgba(251,113,133,0.6)" }}>
                                {currentWord[orp] ?? ""}
                            </span>
                            <span style={{ color: "rgba(255,255,255,0.9)" }}>{currentWord.slice(orp + 1)}</span>
                        </div>
                    </div>

                    <p className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>
                        Keep your eyes still · words come to you
                    </p>
                </div>
            )}

            {/* ══ QUIZ ═════════════════════════════════════════════════════════ */}
            {phase === "quiz" && questions[qIndex] && (
                <div className="w-full max-w-sm flex flex-col gap-5 animate-nb-scale-in">
                    {/* Header */}
                    <div className="text-center">
                        <p className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                            Question {qIndex + 1} of {questions.length}
                        </p>
                        {/* Dots */}
                        <div className="flex gap-1.5 justify-center mb-4">
                            {questions.map((_, i) => (
                                <div
                                    key={i}
                                    className="rounded-full"
                                    style={{
                                        width: 8, height: 8,
                                        background: i < qIndex ? "#fb7185" : i === qIndex ? "rgba(251,113,133,0.5)" : "rgba(255,255,255,0.1)",
                                    }}
                                />
                            ))}
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-white leading-snug">
                            {questions[qIndex].prompt}
                        </h3>
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-2 gap-3">
                        {questions[qIndex].options.map((opt, i) => {
                            const answered = selectedAnswer !== null;
                            const isCorrect = i === questions[qIndex].correctIndex;
                            const isChosen = i === selectedAnswer;

                            let bg = "rgba(255,255,255,0.05)";
                            let border = "rgba(255,255,255,0.1)";
                            let color = "rgba(255,255,255,0.75)";

                            if (answered) {
                                if (isCorrect) { bg = "rgba(52,211,153,0.15)"; border = "rgba(52,211,153,0.5)"; color = "#34d399"; }
                                else if (isChosen) { bg = "rgba(248,113,113,0.15)"; border = "rgba(248,113,113,0.5)"; color = "#f87171"; }
                            }

                            return (
                                <button
                                    key={i}
                                    onClick={() => handleAnswer(i)}
                                    disabled={answered}
                                    className="rounded-xl px-3 py-4 text-sm font-mono font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-95"
                                    style={{ background: bg, border: `1px solid ${border}`, color }}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ══ DONE ═════════════════════════════════════════════════════════ */}
            {phase === "done" && (
                <div className="w-full max-w-sm flex flex-col gap-5 text-center animate-nb-bounce-in">
                    <div>
                        <div className="text-5xl mb-2">
                            {score === 3 ? "🏆" : score === 2 ? "🎯" : score === 1 ? "👍" : "💪"}
                        </div>
                        <h2 className="text-4xl font-bold font-mono" style={{ color: "#fb7185" }}>
                            {score}/{questions.length}
                        </h2>
                        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                            {score === 3 ? "Perfect recall!" : score === 2 ? "Great focus!" : score === 1 ? "Keep practising!" : "Eyes need training!"}
                        </p>
                    </div>

                    {/* Per-question results */}
                    <div className="nb-glass rounded-2xl p-4 space-y-3 text-left">
                        {questions.map((q, i) => {
                            const a = answers[i];
                            const correct = a?.chosen === a?.correct;
                            return (
                                <div key={i} className="flex gap-2 items-start">
                                    <span className="text-base mt-0.5">{correct ? "✅" : "❌"}</span>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold leading-snug" style={{ color: "rgba(255,255,255,0.6)" }}>{q.prompt}</p>
                                        {!correct && (
                                            <p className="text-xs mt-0.5 font-mono" style={{ color: "#34d399" }}>
                                                ✓ {q.options[q.correctIndex]}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex gap-3 justify-center">
                        <button onClick={startGame} className="nb-btn-primary flex-1 max-w-[140px]">Try Again</button>
                        <button onClick={reset} className="nb-btn-ghost flex-1 max-w-[140px]">Change Speed</button>
                    </div>
                </div>
            )}
        </GameShell>
    );
}