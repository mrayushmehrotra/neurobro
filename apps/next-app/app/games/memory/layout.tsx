import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "Memory Match",
    description: "Flip cards to find matching pairs in NeuroBro's Memory Match game. Train short-term memory with grids from 4×4 up to 9×9. Free to play.",
    openGraph: { title: "Memory Match · NeuroBro", description: "Train short-term memory by flipping cards and finding pairs. Free brain game." },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
