import SidebarUI from "@/components/SidebarUI";
import Link from "next/link";

const GAMES = [
  {
    label: "Memory Match",
    href: "/games/memory",
    emoji: "🃏",
    description: "Flip cards to find matching pairs. Train your short-term memory.",
    gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
    borderColor: "rgba(245,166,35,0.25)",
    glowColor: "rgba(245,166,35,0.08)",
    tag: "Memory",
    tagColor: "text-amber-400",
    tagBg: "rgba(245,166,35,0.12)",
    tagBorder: "rgba(245,166,35,0.25)",
    gridLabel: "4×4 to 9×9",
  },
  {
    label: "Mental Math",
    href: "/games/mental-math",
    emoji: "➗",
    description: "Solve arithmetic challenges against the clock. Boost calculation speed.",
    gradient: "from-violet-500/20 via-purple-500/10 to-transparent",
    borderColor: "rgba(139,92,246,0.25)",
    glowColor: "rgba(139,92,246,0.08)",
    tag: "Speed",
    tagColor: "text-violet-400",
    tagBg: "rgba(139,92,246,0.12)",
    tagBorder: "rgba(139,92,246,0.25)",
    gridLabel: "Easy · Medium · Hard",
  },
  {
    label: "Schulte Table",
    href: "/games/schulte",
    emoji: "🔢",
    description: "Find 1 to N in a shuffled grid. Sharpen your peripheral vision.",
    gradient: "from-sky-500/20 via-blue-500/10 to-transparent",
    borderColor: "rgba(56,189,248,0.25)",
    glowColor: "rgba(56,189,248,0.08)",
    tag: "Focus",
    tagColor: "text-sky-400",
    tagBg: "rgba(56,189,248,0.12)",
    tagBorder: "rgba(56,189,248,0.25)",
    gridLabel: "3×3 to 7×7",
  },
  {
    label: "Reaction Training",
    href: "/games/reaction",
    emoji: "⚡",
    description: "Tap the moment you see the flash. Measure your reflexes in ms.",
    gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
    borderColor: "rgba(16,185,129,0.25)",
    glowColor: "rgba(16,185,129,0.08)",
    tag: "Reaction",
    tagColor: "text-emerald-400",
    tagBg: "rgba(16,185,129,0.12)",
    tagBorder: "rgba(16,185,129,0.25)",
    gridLabel: "3 · 5 · 10 rounds",
  },
  {
    label: "Quick Read",
    href: "/games/quick-read",
    emoji: "👁️",
    description: "Words flash one at a time in the centre. Read fast, remember more.",
    gradient: "from-rose-500/20 via-pink-500/10 to-transparent",
    borderColor: "rgba(251,113,133,0.25)",
    glowColor: "rgba(251,113,133,0.08)",
    tag: "Reading",
    tagColor: "text-rose-400",
    tagBg: "rgba(251,113,133,0.12)",
    tagBorder: "rgba(251,113,133,0.25)",
    gridLabel: "100 – 700 WPM",
  },
];

export default function Home() {
  return (
    <SidebarUI>
      <div className="min-h-full relative overflow-hidden" style={{ background: "var(--nb-bg)" }}>


        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

          {/* ── Hero ── */}
          <div className="mb-10 sm:mb-14 animate-nb-slide-up">
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="nb-badge" style={{ background: "rgba(245,166,35,0.1)", borderColor: "rgba(245,166,35,0.25)", color: "#f5a623" }}>
                🧠 Brain Training
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-4">
              Train your brain,{" "}
              <span className="nb-gradient-text">every day.</span>
            </h1>
            <p className="text-base sm:text-lg max-w-xl" style={{ color: "rgba(255,255,255,0.5)" }}>
              Science-backed mini-games to sharpen memory, focus,
              math speed, and reaction time — right in your browser.
            </p>
          </div>

          {/* ── Game Cards ── */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.25)" }}>
              Choose a game
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 nb-stagger">
              {GAMES.map((game) => (
                <Link
                  key={game.href}
                  href={game.href}
                  className={`group relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5`}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${game.borderColor}`,
                    boxShadow: `0 0 30px ${game.glowColor}`,
                  }}
                >
                  {/* gradient bg */}
                  <div className={`absolute inset-0 bg-linear-to-br ${game.gradient} opacity-60`} />

                  <div className="relative p-5 sm:p-6 flex flex-col gap-4">
                    {/* Top row */}
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        {game.emoji}
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: game.tagBg, border: `1px solid ${game.tagBorder}`, color: game.tagColor === "text-amber-400" ? "#f5a623" : game.tagColor === "text-violet-400" ? "#a78bfa" : game.tagColor === "text-sky-400" ? "#38bdf8" : "#34d399" }}>
                        {game.tag}
                      </span>
                    </div>

                    {/* Info */}
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-white mb-1.5">{game.label}</h2>
                      <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                        {game.description}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                        {game.gridLabel}
                      </span>
                      <span className="text-sm font-semibold transition-all group-hover:translate-x-1 duration-200"
                        style={{ color: game.tagColor === "text-amber-400" ? "#f5a623" : game.tagColor === "text-violet-400" ? "#a78bfa" : game.tagColor === "text-sky-400" ? "#38bdf8" : "#34d399" }}>
                        Play →
                      </span>
                    </div>
                  </div>

                  {/* Hover shimmer */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 60%)" }} />
                </Link>
              ))}
            </div>
          </div>

          <br />
          {/* ── Bottom tip ── */}
          <div className="mt-12 text-center animate-nb-slide-up" style={{ animationDelay: "0.4s" }}>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
              🧠 Tip: Daily practice for 10 minutes significantly improves cognitive performance.
            </p>
          </div>

          <br />
          <br />
          <br />
        </div>
      </div>
    </SidebarUI>
  );
}
