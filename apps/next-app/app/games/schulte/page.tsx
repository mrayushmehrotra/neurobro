

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameShell from "@/components/GameShell";
import { GameTimerHandle } from "@/components/GameTimer";

const GRID_OPTIONS = [
  { label: "3 × 3", size: 3, desc: "Beginner · 9 numbers" },
  { label: "4 × 4", size: 4, desc: "Easy · 16 numbers" },
  { label: "5 × 5", size: 5, desc: "Classic · 25 numbers" },
  { label: "6 × 6", size: 6, desc: "Expert · 36 numbers" },
  { label: "7 × 7", size: 7, desc: "Master · 49 numbers" },
];

type Phase = "select" | "playing" | "done";

function buildGrid(size: number): number[] {
  const nums = Array.from({ length: size * size }, (_, i) => i + 1);
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  return nums;
}

function fmtMs(ms: number) {
  return `${(ms / 1000).toFixed(2)}s`;
}

export default function SchulteGame() {
  const [phase, setPhase] = useState<Phase>("select");
  const [gridOpt, setGridOpt] = useState(GRID_OPTIONS[2]);
  const [grid, setGrid] = useState<number[]>([]);
  const [next, setNext] = useState(1);
  const [wrongNum, setWrongNum] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  const [bestTimes, setBestTimes] = useState<Record<string, number>>({});
  const [running, setRunning] = useState(false);
  const timerRef = useRef<GameTimerHandle>(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem("nb_schulte_best_v2");
      if (s) setBestTimes(JSON.parse(s));
    } catch { }
  }, []);

  const startGame = useCallback((opt: (typeof GRID_OPTIONS)[0]) => {
    setGridOpt(opt);
    setGrid(buildGrid(opt.size));
    setNext(1);
    setWrongNum(null);
    setMistakes(0);
    setFinalTime(0);
    setRunning(false);
    timerRef.current?.reset();
    setPhase("playing");
  }, []);

  const handleCell = useCallback(
    (num: number) => {
      if (phase !== "playing" || num < next) return;
      if (!running) setRunning(true);

      if (num === next) {
        setWrongNum(null);
        const total = gridOpt.size * gridOpt.size;
        if (num === total) {
          setRunning(false);
          const elapsed = timerRef.current?.getElapsed() ?? 0;
          setFinalTime(elapsed);
          setNext(num + 1);
          setPhase("done");
          setBestTimes((prev) => {
            const key = gridOpt.label;
            const nb =
              prev[key] == null ? elapsed : Math.min(prev[key], elapsed);
            const upd = { ...prev, [key]: nb };
            localStorage.setItem("nb_schulte_best_v2", JSON.stringify(upd));
            return upd;
          });
        } else {
          setNext(num + 1);
        }
      } else {
        setMistakes((m) => m + 1);
        setWrongNum(num);
        setTimeout(() => setWrongNum(null), 500);
      }
    },
    [next, phase, running, gridOpt],
  );

  const cellSize =
    gridOpt.size <= 3
      ? "w-20 h-20 sm:w-24 sm:h-24 text-2xl sm:text-3xl"
      : gridOpt.size <= 4
        ? "w-16 h-16 sm:w-18 sm:h-18 text-xl sm:text-2xl"
        : gridOpt.size <= 5
          ? "w-12 h-12 sm:w-14 sm:h-14 text-base sm:text-lg"
          : gridOpt.size <= 6
            ? "w-10 h-10 sm:w-12 sm:h-12 text-sm sm:text-base"
            : "w-9 h-9 sm:w-10 sm:h-10 text-xs sm:text-sm";

  const progressPct = Math.round(
    ((next - 1) / (gridOpt.size * gridOpt.size)) * 100,
  );

  return (
    <GameShell
      title="Schulte Table"
      emoji="🔢"
      accentColor="rgba(56,189,248,0.18)"
      timerRef={timerRef}
      timerMode="up"
      timerRunning={running}
      badge={
        phase !== "select" ? (
          <span
            className="nb-badge"
            style={{
              background: "rgba(56,189,248,0.1)",
              borderColor: "rgba(56,189,248,0.25)",
              color: "#38bdf8",
            }}
          >
            {gridOpt.label}
          </span>
        ) : undefined
      }
      headerRight={
        phase !== "select" ? (
          <button
            onClick={() => setPhase("select")}
            className="nb-btn-ghost text-xs px-3 py-1.5"
          >
            Change Grid
          </button>
        ) : undefined
      }
    >
      {/* ── Selector ── */}
      {phase === "select" && (
        <div className="w-full max-w-md space-y-8 animate-nb-scale-in">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-nb-float">🔢</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Schulte Table
            </h2>
            <p
              className="text-sm sm:text-base"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Click numbers in ascending order. Trains peripheral vision and
              sustained attention.
            </p>
          </div>

          <div className="space-y-2 nb-stagger">
            {GRID_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => startGame(opt)}
                className="nb-select-card group flex items-center gap-4"
                style={{ border: "1px solid rgba(56,189,248,0.18)" }}
              >
                <span className="text-xl font-bold font-mono w-14 text-center nb-gradient-text-cool">
                  {opt.label}
                </span>
                <span
                  className="flex-1 text-sm text-left"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {opt.desc}
                </span>
                {bestTimes[opt.label] ? (
                  <span className="text-xs text-emerald-400 font-mono font-semibold flex-shrink-0">
                    🏆 {fmtMs(bestTimes[opt.label])}
                  </span>
                ) : (
                  <span
                    className="text-xs flex-shrink-0"
                    style={{ color: "rgba(255,255,255,0.2)" }}
                  >
                    No record
                  </span>
                )}
                <span className="text-white/20 group-hover:text-white/60 transition-colors">
                  →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Playing / Done ── */}
      {phase !== "select" && (
        <div className="w-full flex flex-col items-center gap-4 sm:gap-6 animate-nb-scale-in">
          {/* Stats & find indicator */}
          {phase === "playing" && (
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="nb-stat">
                <span className="nb-stat-value text-white text-2xl">
                  {next}
                </span>
                <span className="nb-stat-label">find</span>
              </div>
              <div className="nb-stat">
                <span className="nb-stat-value text-white">
                  {gridOpt.size * gridOpt.size}
                </span>
                <span className="nb-stat-label">total</span>
              </div>
              <div className="nb-stat">
                <span
                  className={`nb-stat-value ${mistakes === 0 ? "text-emerald-400" : "text-red-400"}`}
                >
                  {mistakes}
                </span>
                <span className="nb-stat-label">mistakes</span>
              </div>
            </div>
          )}

          {/* Progress bar */}
          {phase === "playing" && (
            <div
              className="w-full max-w-sm h-1.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progressPct}%`,
                  background: "linear-gradient(90deg, #38bdf8, #818cf8)",
                }}
              />
            </div>
          )}

          {/* Number Grid */}
          <div
            className="grid gap-2 sm:gap-2.5"
            style={{
              gridTemplateColumns: `repeat(${gridOpt.size}, minmax(0, 1fr))`,
            }}
          >
            {grid.map((num) => {
              const isFound = num < next;
              const isWrong = wrongNum === num;
              const isDone = phase === "done";

              return (
                <button
                  key={num}
                  onClick={() => handleCell(num)}
                  disabled={isFound || isDone}
                  className={`${cellSize} rounded-xl border font-bold font-mono transition-all duration-150 focus:outline-none`}
                  style={
                    isFound
                      ? {
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "rgba(255,255,255,0.75)",
                      }
                      : isWrong
                        ? {
                          background: "rgba(248,113,113,0.2)",
                          border: "1px solid rgba(248,113,113,0.5)",
                          color: "#f87171",
                          transform: "scale(0.92)",
                        }
                        : {
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "rgba(255,255,255,0.75)",
                        }
                  }
                >
                  {isFound ? num : num}
                </button>
              );
            })}
          </div>

          {/* Done overlay */}
          {phase === "done" && (
            <div className="text-center space-y-5 mt-2 animate-nb-bounce-in">
              <div>
                <p className="text-4xl font-bold nb-gradient-text mb-1">
                  🏁 Complete!
                </p>
                <p
                  className="text-sm"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  {mistakes === 0
                    ? "🎯 Perfect run — no mistakes!"
                    : `${mistakes} mistake${mistakes !== 1 ? "s" : ""}`}
                </p>
              </div>
              <div className="nb-glass rounded-2xl px-8 py-4 inline-flex flex-col items-center gap-1">
                <span
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Your time
                </span>
                <span className="text-3xl font-mono font-bold text-amber-400">
                  {fmtMs(finalTime)}
                </span>
                {bestTimes[gridOpt.label] === finalTime && (
                  <span className="text-emerald-400 text-xs font-semibold">
                    ✨ New Personal Best!
                  </span>
                )}
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => startGame(gridOpt)}
                  className="nb-btn-primary"
                >
                  Play Again
                </button>
                <button
                  onClick={() => setPhase("select")}
                  className="nb-btn-ghost"
                >
                  Change Grid
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </GameShell>
  );
}
