# 🧠 NeuroBro — Context File

## Overview
**NeuroBro** is a Next.js 16 browser-based brain-training application. A collapsible sidebar on the left navigates between games; the main content area renders the active game. All games are built entirely in vanilla React hooks with no external game-engine dependencies.

The goal: help users sharpen cognitive skills — memory, math speed, peripheral focus, and reaction time — in a premium dark-themed UI with glassmorphism, ambient glow, and micro-animations.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack dev) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + `tw-animate-css` |
| UI Primitives | shadcn/ui via `@base-ui/react` |
| Icons | `@tabler/icons-react` |
| Font | Outfit (Google Fonts, CSS variable `--font-sans`) |
| Logo | `/public/logo.png` (1200×630 PNG, used for favicon + OG) |

---

## Directory Structure

```
apps/next-app/
├── app/
│   ├── layout.tsx               # Root layout — Outfit font, full OG metadata, logo.png favicon
│   ├── globals.css              # ⭐ Design tokens, glass utilities, keyframe animations
│   ├── page.tsx                 # Home dashboard — gradient game cards, ambient orbs
│   └── games/
│       ├── memory/page.tsx      # 🃏 Memory Match (4×4 – 9×9 selectable grid)
│       ├── mental-math/page.tsx # ➗ Mental Math (Easy / Medium / Hard, countdown)
│       ├── schulte/page.tsx     # 🔢 Schulte Table (3×3 – 7×7 selectable grid)
│       └── reaction/page.tsx    # ⚡ Reaction Training (3 / 5 / 10 rounds)
├── components/
│   ├── SidebarUI.tsx            # Desktop sidebar + mobile sticky topbar + bottom nav
│   ├── GameTimer.tsx            # Shared timer (up/down, pulse dot, color warnings)
│   ├── GameShell.tsx            # Shared game page shell (topbar, back btn, timer slot)
│   └── ui/                      # shadcn primitives (17 components)
│       ├── sidebar.tsx
│       ├── button.tsx
│       └── ...
├── hooks/
│   └── use-mobile.ts
├── lib/
│   └── utils.ts
└── public/
    └── logo.png                 # 1200×630 brand logo — used for favicon + OG sharing
```

---

## Games Catalogue

### 1. 🃏 Memory Match (`/games/memory`)
**Select screen** → user picks grid size before playing.

| Grid | Pairs | Difficulty |
|------|-------|------------|
| 4×4  | 8     | Starter    |
| 5×5  | 12    | Easy       |
| 6×6  | 18    | Medium     |
| 7×7  | 24    | Hard       |
| 8×8  | 32    | Very Hard  |
| 9×9  | 40    | Expert     |

- Cards are randomly shuffled emoji pairs from a 40-emoji pool.
- Click a card to flip it; if two flipped cards match → they stay revealed (emerald glow).
- Mismatched cards flip back after 900 ms (prevents memorising with fast clicks).
- **Timer** counts up (starts on first card flip, stops on final pair matched).
- Stats tracked: time, move count, personal best **per grid size**.
- Best times stored in `localStorage` under `nb_memory_best_v2` (JSON keyed by grid label).

---

### 2. ➗ Mental Math (`/games/mental-math`)
**Select screen** → user picks difficulty.

| Mode   | Operations         | Time limit |
|--------|--------------------|------------|
| Easy   | `+` `−`            | 90 s       |
| Medium | `+` `−` `×`        | 60 s       |
| Hard   | `+` `−` `×` `÷`   | 45 s       |

- A random arithmetic expression appears; user types the answer and presses Enter.
- Difficulty of numbers scales automatically with the current streak (scale = floor(streak/4)+1, capped at 6).
- **Scoring**: 1 point per correct answer + 1 bonus per every 5-streak.
- Wrong answers reset the streak; the correct answer is shown for 600 ms before next question.
- **Timer** counts down; `onExpire` triggers end-of-game.
- Stats tracked: score, high score per difficulty, total answered, wrong count, accuracy %.
- High scores stored in `localStorage` under `nb_math_hs_v2` (JSON keyed by difficulty).

---

### 3. 🔢 Schulte Table (`/games/schulte`)
**Select screen** → user picks grid size.

| Grid | Numbers | Label     |
|------|---------|-----------|
| 3×3  | 1–9     | Beginner  |
| 4×4  | 1–16    | Easy      |
| 5×5  | 1–25    | Classic   |
| 6×6  | 1–36    | Expert    |
| 7×7  | 1–49    | Master    |

- Numbers are randomly shuffled in the grid each game.
- Click numbers in ascending order (1 → 2 → 3 → …). Wrong clicks are highlighted red for 500 ms.
- The target number glows sky-blue; found numbers show a ✓ in emerald.
- A **progress bar** fills as more numbers are found.
- **Timer** counts up (starts on first click, stops when final number is found).
- Stats tracked: time, mistake count (perfect run = 🎯), personal best per grid size.
- Best times stored in `localStorage` under `nb_schulte_best_v2` (JSON keyed by grid label).

---

### 4. ⚡ Reaction Training (`/games/reaction`)
**Select screen** → user picks number of rounds.

| Option | Rounds |
|--------|--------|
| Quick  | 3      |
| Normal | 5      |
| Long   | 10     |

**Flow per round:**
1. Screen shows "Wait…" with a pulsing hourglass.
2. After a random delay of **1.5–5 seconds**, the background flashes a vivid random colour and shows "TAP NOW!".
3. User taps anywhere on the screen → milliseconds measured from flash to tap.
4. **Too-early** click (before flash) → penalised, round doesn't count, offered retry.
5. Result screen shows raw ms + **performance band**:

| Range     | Band         | Colour  |
|-----------|--------------|---------|
| < 150 ms  | Superhuman   | Violet  |
| < 200 ms  | Elite        | Amber   |
| < 250 ms  | Excellent    | Emerald |
| < 300 ms  | Good         | Sky     |
| < 400 ms  | Average      | White   |
| ≥ 400 ms  | Keep Going   | Muted   |

- End-of-game shows: average, best, worst, per-round breakdown, too-early count.
- Best average stored in `localStorage` under `nb_reaction_best_v2`.

---

## Shared Components

### `<GameShell />` — `components/GameShell.tsx`
Used by every game page. Provides:
- Sticky top bar with ← Back button, game title + emoji, badge slot, timer slot, and a `headerRight` slot.
- Ambient glow orb behind content (accent colour configurable).
- Centred content area with responsive padding.

```tsx
<GameShell
  title="Memory Match"
  emoji="🃏"
  accentColor="rgba(245,166,35,0.2)"
  timerRef={timerRef}
  timerMode="up"            // "up" | "down"
  timerInitialSeconds={60}  // only for "down"
  timerRunning={running}
  onTimerExpire={handleExpire}
  badge={<span>4 × 4</span>}
  headerRight={<button>Change Grid</button>}
>
  {/* game content */}
</GameShell>
```

### `<GameTimer />` — `components/GameTimer.tsx`
```tsx
<GameTimer
  ref={timerRef}            // exposes { reset(), getElapsed(): number }
  mode="up" | "down"
  initialSeconds={60}       // only for "down"
  running={boolean}
  onExpire={() => void}     // "down" mode only
  compact={boolean}         // shorter MM:SS format (no centiseconds)
/>
```
- Animated pulse dot indicator (amber → yellow → red as countdown nears 0).
- Color warnings: yellow at < 15 s remaining, red at < 8 s.

### `<SidebarUI />` — `components/SidebarUI.tsx`
- **Desktop**: Fixed sidebar with `logo.png` header, game nav links with amber glow active state, "Train daily" footer card.
- **Mobile**: Sticky topbar (logo + title) + fixed bottom navigation bar with game icons. Sidebar accessible via hamburger on mobile.
- `SidebarProvider` from shadcn wraps the whole layout; `SidebarTrigger` opens mobile sheet.

---

## Design System

### CSS Utilities (`globals.css`)

| Class | Purpose |
|---|---|
| `.nb-glass` | Glassmorphism surface (`4% white bg + blur + 8% border`) |
| `.nb-glow-amber/violet/emerald/sky/red` | Coloured box-shadow glow rings |
| `.nb-btn-primary` | Amber gradient CTA button with shadow |
| `.nb-btn-ghost` | Subtle outlined secondary button |
| `.nb-stat` | Stat pill (value + label, glass background) |
| `.nb-topbar` | Sticky blurred top bar |
| `.nb-badge` | Small pill label |
| `.nb-select-card` | Hover-lift selection card |
| `.nb-gradient-text` | Amber gradient text fill |
| `.nb-gradient-text-cool` | Sky→violet gradient text |
| `.nb-orb` | Ambient background glow orb |

### Keyframe Animations

| Class | Effect |
|---|---|
| `.animate-nb-float` | Gentle up-down float (3 s loop) |
| `.animate-nb-slide-up` | Fade + slide in from below |
| `.animate-nb-scale-in` | Scale from 92% + fade in |
| `.animate-nb-shake` | Horizontal shake (wrong answer feedback) |
| `.animate-nb-pop` | Quick scale burst |
| `.animate-nb-bounce-in` | Spring overshoot entrance |
| `.animate-nb-spin-slow` | Slow 360° rotation (8 s, used on orbs) |
| `.nb-stagger > *` | Auto-staggered children with 50 ms delay each |

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `--nb-bg` | `#08080f` | Page background |
| `--nb-amber` | `#f5a623` | Primary accent |
| `--nb-violet` | `#8b5cf6` | Mental Math accent |
| `--nb-emerald` | `#10b981` | Correct / success states |
| `--nb-sky` | `#38bdf8` | Schulte Table accent |
| `--nb-red` | `#f87171` | Wrong / danger states |

---

## localStorage Keys

| Key | Format | Purpose |
|---|---|---|
| `nb_memory_best_v2` | `JSON { "4 × 4": ms, ... }` | Per-grid personal best (Memory) |
| `nb_math_hs_v2` | `JSON { easy: n, medium: n, hard: n }` | High score per difficulty (Math) |
| `nb_schulte_best_v2` | `JSON { "3 × 3": ms, ... }` | Per-grid personal best (Schulte) |
| `nb_reaction_best_v2` | `number` (ms) | Best average reaction time |

---

## Metadata & Branding

- **Favicon**: `/public/logo.png` (PNG, 1200×630)
- **OG image**: `/public/logo.png`
- **Title template**: `"%s · NeuroBro"` (each game page sets its own `%s`)
- **Theme color**: `#08080f`
- **Twitter card**: `summary_large_image`
- Set in `app/layout.tsx` via Next.js `Metadata` + `Viewport` exports.

---

## Adding a New Game

1. Create `app/games/<slug>/page.tsx` with `"use client"`.
2. Add entry to the `GAMES` array in both `components/SidebarUI.tsx` (desktop + bottom nav) and `app/page.tsx` (home dashboard cards).
3. Wrap the page in `<GameShell>` — pass `timerRef`, `accentColor`, `badge`, `headerRight` as needed.
4. Use `<GameTimer ref={timerRef}>` inside `GameShell` props for time tracking.
5. Persist personal bests to `localStorage` with key pattern `nb_<slug>_best_v2`.
6. Use `.nb-select-card` + `.nb-stagger` for the pre-game selector screen.
7. Use `.nb-stat` pills for in-game stats (score / streak / accuracy).
8. Use `.nb-btn-primary` / `.nb-btn-ghost` for action buttons.
9. Use `.animate-nb-bounce-in` on the win/done screen.
10. Add a `@tabler/icons-react` icon for the sidebar nav entry.

---

## Design Philosophy

- **Dark-first, always** — `html.dark` class forced in layout; all colors are dark-mode native.
- **Premium glassmorphism** — `.nb-glass` surfaces, coloured glow borders, ambient orbs.
- **Motion-rich** — every state transition has an entrance animation; buttons have hover scale + active shrink.
- **Mobile-first layout** — bottom nav bar replaces sidebar on `< md` screens; all grids are responsive.
- **No game-engine dependencies** — all logic in vanilla React hooks + `requestAnimationFrame` for the timer.
- **Accessible** — `focus-visible` rings on all interactive elements, `aria-label` on icon-only buttons.
