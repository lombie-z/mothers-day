"use client";

import { motion } from "framer-motion";
import GrowingRose from "@/components/GrowingRose";
import AnimatedGradientBackground from "@/components/AnimatedGradientBackground";

export default function Home() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <AnimatedGradientBackground
        Breathing={true}
        animationSpeed={0.03}
        breathingRange={12}
        startingGap={100}
        topOffset={30}
        gradientColors={[
          "#d4708a",
          "#c47068",
          "#b04a5a",
          "#8b2a4a",
          "#5a1428",
          "#2a0810",
        ]}
        gradientStops={[0, 18, 35, 55, 78, 100]}
      />

      <GrowingRose />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
        className="absolute top-0 left-0 pointer-events-none z-10"
        style={{ paddingTop: "5vh", paddingLeft: "5vw" }}
      >
        <h1
          className="text-6xl md:text-8xl leading-relaxed tracking-wide"
          style={{
            fontFamily: "var(--font-ms-madi)",
            padding: "4px 0 8px 8px",
            background: "linear-gradient(90deg, #f5c6d0, #e8a0b0, #f2d0d8, #dba0b8, #f5c6d0)",
            backgroundSize: "300% 100%",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "text-breathe 8s ease-in-out infinite",
          }}
        >
          Magdalen Rozsa
        </h1>
        <p
          className="text-sm md:text-base mt-6 tracking-widest uppercase font-light"
          style={{
            background: "linear-gradient(90deg, rgba(245,198,208,0.6), rgba(232,160,176,0.5), rgba(242,208,216,0.6), rgba(219,160,184,0.5), rgba(245,198,208,0.6))",
            backgroundSize: "300% 100%",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "text-breathe 8s ease-in-out infinite",
          }}
        >
          Sydney-based Watercolour and Oil Artist
        </p>
      </motion.div>
    </div>
  );
}
