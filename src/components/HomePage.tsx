"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTina } from "tinacms/dist/react";
import GrowingRose from "@/components/GrowingRose";

interface SiteSettings {
  heading?: string | null;
  subtitle?: string | null;
  aboutText?: string | null;
  aboutCta?: string | null;
  email?: string | null;
}

interface HomePageProps {
  query: string;
  variables: Record<string, unknown>;
  data: unknown;
}

export default function HomePage({ query, variables, data }: HomePageProps) {
  const [showVine, setShowVine] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowVine(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const { data: tinaData } = useTina({
    query,
    variables,
    data: data as object,
    experimental___selectFormByFormId: () => "content/settings.json",
  });

  const settings: SiteSettings = (tinaData as Record<string, SiteSettings>)?.settings ?? {};

  return (
    <>
      <div className="relative w-screen h-screen overflow-hidden">
        {showVine && <GrowingRose />}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
          className="absolute top-0 left-0 pointer-events-none z-10"
          style={{ paddingTop: "12vh", paddingLeft: "5vw", paddingRight: "5vw" }}
        >
          <h1
            className="text-4xl sm:text-6xl md:text-8xl leading-relaxed tracking-wide"
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
            {settings.heading || "Magdalen Rozsa"}
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
            {settings.subtitle || "Sydney-based Watercolour and Oil Artist"}
          </p>

          <Link
            href="/work"
            className="mt-8 inline-block text-xs tracking-widest uppercase font-light pointer-events-auto hover:opacity-100 transition-opacity duration-300"
            style={{ color: "rgba(245, 198, 208, 0.4)" }}
          >
            View Work →
          </Link>
        </motion.div>
      </div>
    </>
  );
}
