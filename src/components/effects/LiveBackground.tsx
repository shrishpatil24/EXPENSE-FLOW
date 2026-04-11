"use client";

import { useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const SPARKLE_POINTS: { l: number; t: number; delay: number; size: number }[] = [
  { l: 6, t: 12, delay: 0, size: 3 },
  { l: 18, t: 38, delay: 0.7, size: 2 },
  { l: 42, t: 8, delay: 1.4, size: 4 },
  { l: 58, t: 22, delay: 0.3, size: 2 },
  { l: 72, t: 55, delay: 1.1, size: 3 },
  { l: 88, t: 18, delay: 1.8, size: 2 },
  { l: 12, t: 72, delay: 0.9, size: 3 },
  { l: 35, t: 88, delay: 1.6, size: 2 },
  { l: 80, t: 78, delay: 0.5, size: 4 },
  { l: 92, t: 42, delay: 2.1, size: 2 },
];

/**
 * Ambient animated layers behind the app (CSS-only motion, respects reduced motion).
 */
export function LiveBackground() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const authDim = pathname?.startsWith("/auth");

  if (reduceMotion) {
    return (
      <div
        className="pointer-events-none fixed inset-0 -z-20 overflow-hidden"
        aria-hidden
      >
        <div className="live-layer-base absolute inset-0" />
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(ellipse 100% 70% at 0% 0%, rgba(37, 99, 235, 0.1), transparent 55%), radial-gradient(ellipse 90% 60% at 100% 20%, rgba(99, 102, 241, 0.08), transparent 50%)",
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 -z-20 overflow-hidden transition-opacity duration-500",
        authDim && "opacity-[0.55]"
      )}
      aria-hidden
    >
      <div className="live-layer-base absolute inset-0" />
      <div className="live-layer-aurora absolute inset-0" />
      <div className="live-blobs absolute inset-0">
        <span className="live-blob live-blob-a" />
        <span className="live-blob live-blob-b" />
        <span className="live-blob live-blob-c" />
      </div>
      <div className="live-layer-grid absolute inset-0" />
      <div className="live-layer-vignette absolute inset-0" />
      {SPARKLE_POINTS.map((p, i) => (
        <span
          key={i}
          className="live-sparkle absolute rounded-full"
          style={{
            left: `${p.l}%`,
            top: `${p.t}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
