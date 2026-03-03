"use client";

import { useRef } from "react";
import { motion, useAnimation } from "motion/react";
import type { AnimatedIconHandle } from "./ui/types";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  IconCards,
  IconMathFunction,
  IconTable,
  IconBolt,
  IconBrain,
  IconStopwatch,
  IconClockPlay,
} from "@tabler/icons-react";

import BrainCircuitIcon from "./ui/brain-circuit-icon";
import AlarmClockPlusIcon from "./ui/alaram-icon";
import ClockIcon from "./ui/clock-icon";
import SlackIcon from "./ui/slack-icon";



const GAMES = [
  { label: "Memory Match", href: "/games/memory", icon: SlackIcon, color: "text-amber-400", activeColor: "rgba(245,166,35,0.12)", activeBorder: "rgba(245,166,35,0.25)" },
  { label: "Mental Math", href: "/games/mental-math", icon: IconMathFunction, color: "text-violet-400", activeColor: "rgba(139,92,246,0.12)", activeBorder: "rgba(139,92,246,0.25)" },
  { label: "Schulte Table", href: "/games/schulte", icon: IconTable, color: "text-sky-400", activeColor: "rgba(56,189,248,0.12)", activeBorder: "rgba(56,189,248,0.25)" },
  { label: "Reaction Training", href: "/games/reaction", icon: IconBolt, color: "text-emerald-400", activeColor: "rgba(16,185,129,0.12)", activeBorder: "rgba(16,185,129,0.25)" },
];

const TOOLS = [
  { label: "Stopwatch", href: "/timer/stopwatch", icon: AlarmClockPlusIcon, color: "text-amber-400", activeColor: "rgba(245,166,35,0.12)", activeBorder: "rgba(245,166,35,0.25)" },
  { label: "Pomodoro", href: "/timer/pomodoro", icon: ClockIcon, color: "text-red-400", activeColor: "rgba(248,113,113,0.12)", activeBorder: "rgba(248,113,113,0.25)" },
];

function NavItem({
  item,
  isActive,
}: {
  item: (typeof GAMES)[0];
  isActive: boolean;
}) {
  const Icon = item.icon as React.ElementType;

  // ref for animated icons (AlarmClockPlusIcon / ClockIcon)
  const animatedRef = useRef<AnimatedIconHandle>(null);
  // animation controls for plain tabler icons
  const iconControls = useAnimation();

  const isAnimatedIcon =
    Icon === (AlarmClockPlusIcon as React.ElementType) ||
    Icon === (ClockIcon as React.ElementType);

  const handleMouseEnter = () => {
    if (isAnimatedIcon && animatedRef.current) {
      animatedRef.current.startAnimation();
    } else {
      iconControls.start({
        rotate: [0, -15, 12, -8, 5, 0],
        scale: [1, 1.25, 1.1, 1.15, 1.05, 1],
        transition: { duration: 0.5, ease: "easeOut" },
      });
    }
  };

  const handleMouseLeave = () => {
    if (isAnimatedIcon && animatedRef.current) {
      animatedRef.current.stopAnimation();
    } else {
      iconControls.start({
        rotate: 0,
        scale: 1,
        transition: { duration: 0.2, ease: "easeOut" },
      });
    }
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        tooltip={item.label}
        render={
          <Link
            href={item.href}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        }
        className={`
          flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium
          transition-all duration-200 cursor-pointer
          ${isActive ? item.color : "text-white/55 hover:text-white"}
        `}
        style={
          isActive
            ? { background: item.activeColor, border: `1px solid ${item.activeBorder}`, boxShadow: `0 2px 12px ${item.activeColor}` }
            : { background: "transparent", border: "1px solid transparent" }
        }
      >
        <span className={`${item.color} transition-colors shrink-0`}>
          {isAnimatedIcon ? (
            <Icon ref={animatedRef} size={24} />
          ) : (
            <motion.span
              className="inline-flex"
              animate={iconControls}
            >
              <Icon size={24} />
            </motion.span>
          )}
        </span>
        <span>{item.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}


export default function SidebarUI({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      {/* ── Desktop Sidebar ── */}
      <Sidebar className="hidden md:flex">
        {/* Logo / Brand */}
        <SidebarHeader>
          <div className="flex items-center gap-3 px-2 py-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #f5a623, #f97316)", boxShadow: "0 4px 16px rgba(245,166,35,0.35)" }}
            >
              <BrainCircuitIcon size={28} className="text-black" />
            </div>
            <div>
              <p className="font-bold text-base leading-tight text-white">NeuroBro</p>
              <p className="text-sm leading-tight" style={{ color: "rgba(255,255,255,0.4)" }}>Brain Training</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* ── Games ── */}
          <SidebarGroup>
            <SidebarGroupLabel
              className="text-sm uppercase tracking-widest px-3 mb-1"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              Games
            </SidebarGroupLabel>
            <SidebarMenu>
              {GAMES.map((item) => (
                <NavItem key={item.href} item={item} isActive={pathname === item.href} />
              ))}
            </SidebarMenu>
          </SidebarGroup>

          {/* ── Separator ── */}
          <SidebarSeparator className="my-1" style={{ background: "rgba(255,255,255,0.07)" }} />

          {/* ── Tools ── */}
          <SidebarGroup>
            <SidebarGroupLabel
              className="text-sm uppercase tracking-widest px-3 mb-1"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              Tools
            </SidebarGroupLabel>
            <SidebarMenu>
              {TOOLS.map((item) => (
                <NavItem key={item.href} item={item} isActive={pathname === item.href} />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        {/* Sidebar footer */}
        <div className="p-4 mt-auto">
          <div
            className="rounded-xl p-3 text-center"
            style={{ background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.15)" }}
          >
            <p className="text-sm font-semibold text-amber-400/80">🧠 Train daily</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>Stay sharp, every day.</p>
          </div>
        </div>
      </Sidebar>

      {/* ── Main area ── */}
      <main className="flex-1 flex flex-col min-h-svh w-full overflow-x-hidden">

        {/* Mobile sticky topbar */}
        <div
          className="flex items-center gap-3 px-4 py-3 md:hidden"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(8,8,15,0.9)", backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 50 }}
        >
          <SidebarTrigger className="md:hidden" />
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #f5a623, #f97316)" }}
            >
              <IconBrain size={15} className="text-black" />
            </div>
            <span className="font-bold text-sm text-white">NeuroBro</span>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 pb-20 md:pb-0">{children}</div>

        {/* ── Mobile Bottom Navigation ── */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 nb-safe-bottom"
          style={{ background: "rgba(8,8,15,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          {/* Two rows: games | tools+home */}
          <div className="flex flex-col">
            {/* Row 1 — Games */}
            <div
              className="flex items-center justify-around px-1 pt-2 pb-1">
              <Link
                href="/"
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all ${pathname === "/" ? "text-amber-400" : "text-white/40 hover:text-white/70"}`}
                style={pathname === "/" ? { background: "rgba(245,166,35,0.12)" } : {}}
              >
                <IconBrain size={22} />
                <span className="text-[10px] font-medium">Home</span>
              </Link>
              {GAMES.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all ${isActive ? item.color : "text-white/40 hover:text-white/70"}`}
                    style={isActive ? { background: item.activeColor } : {}}
                  >
                    <Icon size={22} />
                    <span className="text-[10px] font-medium leading-none">{item.label.split(" ")[0]}</span>
                  </Link>
                );
              })}
            </div>

            {/* Divider */}
            <div className="mx-4 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

            {/* Row 2 — Tools */}
            <div className="flex items-center justify-center gap-8 px-4 pt-1 pb-2">
              {TOOLS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all ${isActive ? item.color : "text-white/35 hover:text-white/60"}`}
                    style={isActive ? { background: item.activeColor } : {}}
                  >
                    <Icon size={22} />
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </main>
    </SidebarProvider>
  );
}
