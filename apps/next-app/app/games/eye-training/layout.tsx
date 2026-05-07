import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "Eye Training",
    description: "Train your eyes like a pro athlete. Improve tracking, focus, and peripheral vision with NeuroBro's Eye Training game.",
    openGraph: { title: "Eye Training · NeuroBro", description: "Improve your visual tracking and peripheral vision like professional athletes." },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }