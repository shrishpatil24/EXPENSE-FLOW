import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { LiveBackground } from "@/components/effects/LiveBackground";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ExpenseFlow | Split money without the drama",
  description:
    "Group expenses, live balances, and fair settlements — built for roommates, trips, and teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans text-foreground h-full overflow-x-hidden bg-[#f4f6fb]`}
      >
        <LiveBackground />
        <div className="noise-overlay fixed inset-0 -z-10" aria-hidden />
        {children}
      </body>
    </html>
  );
}
