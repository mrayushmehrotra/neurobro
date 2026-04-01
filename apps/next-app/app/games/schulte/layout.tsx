import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "Schulte Table",
    description: "Find numbers 1 to N in a shuffled grid with NeuroBro's Schulte Table game. Trains peripheral vision, sustained attention and reading speed. Free online.",
    openGraph: { title: "Schulte Table · NeuroBro", description: "Sharpen peripheral vision and focus by finding numbers in order. Free brain game." },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
