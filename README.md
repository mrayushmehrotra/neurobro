# 🧠 NeuroBro — Brain Training Platform

<div align="center">

![NeuroBro Banner](./apps/next-app/public/icon-512.png)

**A premium, science-backed brain training platform with games, focus tools, and productivity timers — all in your browser.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://typescriptlang.org)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa)](https://web.dev/progressive-web-apps)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

[**Live Demo**](https://neurobro.vercel.app) · [**Report Bug**](https://github.com/mrayushmehrotra/neurobro/issues) · [**Request Feature**](https://github.com/mrayushmehrotra/neurobro/issues)

</div>

---

## ✨ Features

### 🎮 Brain Training Games

| Game | Description | Skills Trained |
|------|-------------|----------------|
| **🃏 Memory Match** | Classic card-flip memory game with increasing grid sizes | Working memory, pattern recognition |
| **➗ Mental Math** | Solve arithmetic problems against the clock — choose ops & digit size | Numerical fluency, focus |
| **📊 Schulte Table** | Find numbers 1→N in a scrambled grid as fast as possible | Peripheral vision, attention |
| **⚡ Reaction Training** | Click the target the instant it appears | Reaction time, hand-eye coordination |
| **⌨️ Typing Speed** | MonkeyType-style typing test with live WPM & accuracy | Typing speed, muscle memory |

### 🛠️ Productivity Tools

| Tool | Description |
|------|-------------|
| **⏱️ Stopwatch** | Precision stopwatch with lap tracking, best/worst highlighting |
| **🍅 Pomodoro** | Full Pomodoro technique timer — focus, short & long breaks with session tracking |

### 🌟 Platform Highlights

- 🎨 **Premium dark UI** — glassmorphism, smooth animations, amber/violet accents
- 📱 **Mobile-first** — full mobile support including number pad for Math game
- 📲 **PWA-ready** — install on home screen, offline caching via service worker
- 🔊 **Sound feedback** — satisfying audio cue on Pomodoro session completion
- 💾 **Persistent high scores** — scores saved to `localStorage` per difficulty
- 🔗 **Deep links** — direct URL access to every game and tool
- ♿ **Accessible** — semantic HTML, keyboard navigation, ARIA labels

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) **v18+**
- [pnpm](https://pnpm.io) **v9+** (`npm install -g pnpm`)

### Installation

```bash
# Clone the repo
git clone https://github.com/mrayushmehrotra/neurobro.git
cd neurobro

# Install all workspace dependencies
pnpm install
```

### Development

```bash
# Start the dev server (Turbopack — ultra fast)
pnpm run dev

# Open in browser
open http://localhost:3000
```

### Production Build

```bash
# Build (generates PWA service worker + optimised bundle)
pnpm run build

# Serve production build locally
pnpm start
```

### Testing

```bash
# Run all unit tests
pnpm test

# Watch mode (re-runs on file change)
pnpm test:watch

# Coverage report
pnpm test:coverage
```

---

## 🏗️ Project Structure

```
neurobro/
├── apps/
│   └── next-app/                    # Main Next.js application
│       ├── app/
│       │   ├── games/
│       │   │   ├── memory/          # Memory Match game
│       │   │   ├── mental-math/     # Mental Math game
│       │   │   ├── reaction/        # Reaction Training game
│       │   │   ├── schulte/         # Schulte Table game
│       │   │   └── typing/          # Typing Speed game
│       │   ├── timer/
│       │   │   ├── pomodoro/        # Pomodoro Timer
│       │   │   └── stopwatch/       # Stopwatch
│       │   ├── globals.css          # Design system tokens & animations
│       │   ├── layout.tsx           # Root layout + PWA metadata
│       │   └── page.tsx             # Home screen (game hub)
│       ├── components/
│       │   ├── ui/                  # Shadcn + custom animated icons
│       │   ├── GameShell.tsx        # Shared game wrapper (topbar + timer)
│       │   ├── GameTimer.tsx        # Countdown/countup timer component
│       │   └── SidebarUI.tsx        # App navigation sidebar
│       ├── __tests__/               # Unit tests
│       │   ├── games/               # Game logic tests
│       │   └── timer/               # Timer logic tests
│       ├── public/
│       │   ├── manifest.json        # PWA web app manifest
│       │   ├── sw.js                # Service worker (auto-generated)
│       │   ├── icon-192.png         # PWA icon 192×192
│       │   ├── icon-512.png         # PWA icon 512×512
│       │   └── yay.mp3              # Pomodoro completion sound
│       ├── jest.config.ts           # Jest configuration
│       ├── jest.setup.ts            # Testing Library setup
│       └── next.config.ts           # Next.js + PWA config
└── package.json                     # Workspace root
```

---

## 🧪 Testing

Tests are written with **Jest** + **@testing-library/react** and cover the core game logic.

### What's Tested

| Test Suite | Coverage |
|------------|----------|
| `mental-math.test.ts` | `randInt` bounds, `minForDigits`/`maxForDigits`, `makeQuestion` arithmetic correctness, op-mode filtering, digit ranges |
| `typing.test.ts` | Word generation count/validity/randomness, WPM/accuracy calculation, edge cases |
| `pomodoro.test.ts` | Session sequencing, 4-session cycle, `fmtCountdown` formatting |
| `stopwatch.test.ts` | `fmtMs` display (hours/sub-second), `fmtLap`, `pad` helper |

### Key Testing Principles

- **Pure logic first** — all game computation functions are tested in isolation
- **Probabilistic correctness** — random functions tested over 500 iterations
- **Boundary cases** — zero inputs, maximum values, edge transitions
- **Deterministic assertions** — no flakiness; random seeds checked via distribution

---

## 🎨 Design System

NeuroBro uses a custom design system built on Tailwind CSS v4.

### Color Tokens

| Token | Value | Use |
|-------|-------|-----|
| `--nb-amber` | `#f5a623` | Primary CTA, Memory Match |
| `--nb-violet` | `#8b5cf6` | Mental Math accents |
| `--nb-emerald` | `#10b981` | Reaction Training, correct answers |
| `--nb-sky` | `#38bdf8` | Schulte Table |
| `--nb-red` | `#f87171` | Wrong answers, Hard difficulty |
| `--nb-bg` | `#08080f` | App background |

### Utility Classes

```css
.nb-glass        /* Frosted glass card */
.nb-btn-primary  /* Amber gradient button */
.nb-btn-ghost    /* Subtle outline button */
.nb-stat         /* Stat pill (value + label) */
.nb-badge        /* Small info badge */
.nb-topbar       /* Sticky game header bar */
```

### Animations

```css
.animate-nb-scale-in   /* Page/section entrance */
.animate-nb-bounce-in  /* Results screen pop */
.animate-nb-float      /* Floating emoji effect */
.animate-nb-slide-up   /* Staggered list items */
.nb-caret              /* Blinking typing cursor */
```

---

## 📲 PWA Installation

NeuroBro is a **Progressive Web App** — it can be installed natively on any device.

### Android / Chrome
1. Open the site in Chrome
2. Tap **"Add to Home Screen"** from the browser menu
3. App launches in full-screen standalone mode

### iOS / Safari
1. Open the site in Safari
2. Tap the **Share** button → **"Add to Home Screen"**
3. Launches without Safari chrome

### Desktop (Chrome/Edge)
1. Look for the **install** icon (⊕) in the address bar
2. Click **"Install NeuroBro"**

### PWA Shortcuts
Long-pressing the home screen icon reveals shortcuts to:
- Memory Match
- Mental Math
- Pomodoro Timer

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack for dev) |
| UI | [React 19](https://react.dev) |
| Language | [TypeScript 5](https://typescriptlang.org) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + Custom Design System |
| Animations | [Motion (Framer)](https://motion.dev) |
| Icons | [@tabler/icons-react](https://tabler.io/icons) + [HoverDev](https://itshover.com) animated icons |
| UI Primitives | [shadcn/ui](https://ui.shadcn.com) (Base UI fork) |
| PWA | [@ducanh2912/next-pwa](https://github.com/DuCanhGH/next-pwa) (Workbox) |
| Testing | [Jest](https://jestjs.io) + [Testing Library](https://testing-library.com) |
| Package Manager | [pnpm](https://pnpm.io) (workspace monorepo) |

---

## 🧠 Game Deep Dives

### Mental Math
- **5 difficulty levels** per game: Easy (90s), Medium (60s), Hard (45s)
- **3 operation modes**: All ops, Add/Subtract only, Multiply/Divide only
- **5 digit sizes**: 1-digit (1-9) through 5-digit (10,000-99,999)
- **Streak bonuses**: Every 5 correct answers in a row grants +1 bonus point
- **Adaptive scaling**: Questions get harder as streak grows (within chosen range)
- Division always produces clean integer answers (no remainders)

### Typing Speed
- **Time modes**: 15s, 30s, 60s, 120s
- **Live WPM**: Updates every 300ms using standard formula (chars / 5 / minutes)
- **Character highlighting**: Correct → white, Wrong → red, Pending → dim
- **Smooth caret**: Amber blinking cursor follows typing position
- **Keyboard shortcuts**: Tab to restart, Esc to reset
- **Auto-scroll**: Text window follows the caret seamlessly

### Pomodoro
- Standard **4-session cycle**: Focus → Short → Focus → Short → Focus → Short → Focus → Long Break
- **Customisable durations**: Tap any time label to edit (1-60 min)
- **Session completion sound**: Plays `yay.mp3` on every session finish
- **Visual ring timer**: SVG arc drains as time passes
- **Skip/Reset controls**: Skip to next session or reset current

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

```bash
# Fork + clone
git clone https://github.com/YOUR_USERNAME/neurobro.git

# Create a feature branch
git checkout -b feat/your-feature-name

# Make changes, add tests
pnpm test

# Commit (follow Conventional Commits)
git commit -m "feat: add colour-blind mode to memory match"

# Push + open PR
git push origin feat/your-feature-name
```

### Adding a New Game

1. Create `apps/next-app/app/games/your-game/page.tsx`
2. Use `<GameShell>` as the wrapper for consistent header + timer
3. Add an entry to `GAMES` in `components/SidebarUI.tsx`
4. Write logic tests in `__tests__/games/your-game.test.ts`

---

## 📄 License

MIT © [Ayush Mehrotra](https://github.com/mrayushmehrotra)

---

<div align="center">

Made with 🧠 and ☕ · Star ⭐ the repo if you find it useful!

</div>
