import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "Typing Speed Test",
    description: "Measure your typing speed in WPM and accuracy with NeuroBro's Typing Speed game. MonkeyType-style test with live stats. Free online typing test.",
    openGraph: { title: "Typing Speed Test · NeuroBro", description: "Test your WPM and accuracy with a free online typing speed game." },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
