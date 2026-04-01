import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "Pomodoro Timer",
    description: "Stay focused with NeuroBro's Pomodoro Timer. 25-minute focus sessions with short and long breaks. Science-backed productivity technique. Free online.",
    openGraph: { title: "Pomodoro Timer · NeuroBro", description: "25-minute focus sessions and break timer. Free Pomodoro technique tool." },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
