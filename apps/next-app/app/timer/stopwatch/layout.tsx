import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "Stopwatch",
    description: "Free online stopwatch with lap timing at NeuroBro. Precise centisecond timer with lap history. Great for workouts, study sessions, and focus training.",
    openGraph: { title: "Stopwatch · NeuroBro", description: "Free online stopwatch with lap timing. Great for workouts and focus training." },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
