import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "Reaction Training",
    description: "Test and train your reaction time with NeuroBro's Reaction Training game. Tap as fast as you can when the screen flashes. Free online reflex test.",
    openGraph: { title: "Reaction Training · NeuroBro", description: "Measure and improve your reaction time. Free online reflex test." },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
