"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTina } from "tinacms/dist/react";
import PortfolioSection, { PortfolioItem } from "@/components/PortfolioSection";

interface WorkPageProps {
  query: string;
  variables: Record<string, unknown>;
  data: unknown;
}

export default function WorkPage({ query, variables, data }: WorkPageProps) {
  const { data: tinaData } = useTina({
    query,
    variables,
    data,
    experimental___selectFormByFormId: () => "content/portfolio.json",
  });

  const works: PortfolioItem[] = ((tinaData as Record<string, Record<string, { works?: PortfolioItem[] }>>)
    ?.portfolio?.works ?? []);

  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [exiting, setExiting] = useState(false);

  const goNext = () => setCurrent((c) => Math.min(c + 1, works.length - 1));
  const goPrev = () => setCurrent((c) => Math.max(c - 1, 0));

  // Keyboard + wheel navigation
  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) < 30) return;
    if (e.deltaY > 0) goNext();
    else goPrev();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === " ") {
      e.preventDefault();
      goNext();
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    }
  };

  // Touch navigation
  const [touchStartY, setTouchStartY] = useState(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(delta) < 50) return;
    if (delta > 0) goNext();
    else goPrev();
  };

  const bg = works[current]?.background || "#8b2a4a";
  const light = (() => {
    const hex = bg;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 140;
  })();
  const uiColor = light ? "rgba(60, 20, 30, 0.4)" : "rgba(245, 198, 208, 0.35)";

  return (
    <div
      className="relative w-screen outline-none"
      style={{ height: "100dvh" }}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      autoFocus
    >
      {/* Animated background color */}
      <motion.div
        className="absolute inset-0 z-0"
        animate={{ backgroundColor: bg }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      {/* Crossfade content */}
      <AnimatePresence mode="wait">
        {works.length > 0 && (
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 z-10 flex items-center justify-center"
          >
            <PortfolioSection item={works[current]} index={current} />
          </motion.div>
        )}
      </AnimatePresence>

      {works.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <p style={{ color: "rgba(245, 198, 208, 0.5)" }}>No pieces yet.</p>
        </div>
      )}

      {works.length > 1 && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 text-xs tracking-widest font-light transition-colors duration-700"
          style={{ color: uiColor }}
        >
          <button
            onClick={goPrev}
            disabled={current === 0}
            className="opacity-40 hover:opacity-100 transition-opacity disabled:opacity-10 cursor-pointer disabled:cursor-default"
          >
            ←
          </button>
          <span>{current + 1} / {works.length}</span>
          <button
            onClick={goNext}
            disabled={current === works.length - 1}
            className="opacity-40 hover:opacity-100 transition-opacity disabled:opacity-10 cursor-pointer disabled:cursor-default"
          >
            →
          </button>
        </div>
      )}

      {/* Exit overlay */}
      <AnimatePresence>
        {exiting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-50"
            style={{ background: "#8b2a4a" }}
          />
        )}
      </AnimatePresence>

      {/* Back button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="absolute z-20"
        style={{ top: "5vh", left: "5vw" }}
      >
        <button
          onClick={() => {
            setExiting(true);
            setTimeout(() => router.push("/"), 700);
          }}
          className="text-xs tracking-widest uppercase font-light hover:opacity-100 transition-all duration-300 cursor-pointer"
          style={{ color: uiColor }}
        >
          ← Back
        </button>
      </motion.div>
    </div>
  );
}
