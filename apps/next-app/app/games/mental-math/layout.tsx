import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "Mental Math",
    description: "Solve arithmetic challenges against the clock in NeuroBro's Mental Math game. Practice addition, subtraction, multiplication and division. Free online.",
    openGraph: { title: "Mental Math · NeuroBro", description: "Race against the clock solving math problems. Free brain training game." },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
