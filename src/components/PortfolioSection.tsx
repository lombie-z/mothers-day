"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { tinaField } from "tinacms/dist/react";

export interface PortfolioItem {
  title: string;
  image: string;
  description?: string | null;
  date?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
  background?: string | null;
}

function ImageWithSkeleton({ item, light }: { item: PortfolioItem; light: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const w = item.imageWidth || 800;
  const h = item.imageHeight || 600;

  useEffect(() => {
    const maxH = window.innerHeight * 0.55;
    const maxW = window.innerWidth * 0.7;
    const scale = Math.min(maxW / w, maxH / h, 1);
    setSize({ w: Math.round(w * scale), h: Math.round(h * scale) });
  }, [w, h]);

  if (!size) return null;

  return (
    <div data-tina-field={tinaField(item as unknown as Record<string, unknown>, "image")}>
      <div
        className="relative overflow-hidden"
        style={{
          width: size.w,
          height: size.h,
          border: `1px solid ${light ? "rgba(60,20,30,0.1)" : "rgba(245, 198, 208, 0.2)"}`,
          background: light ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)",
        }}
      >
        <Image
          src={item.image}
          alt={item.title}
          width={w}
          height={h}
          className="object-contain transition-opacity duration-700"
          style={{
            width: size.w,
            height: size.h,
            opacity: loaded ? 1 : 0,
          }}
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  );
}

function isLightBg(hex?: string | null) {
  if (!hex) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 140;
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-AU", { year: "numeric", month: "long" });
}

export default function PortfolioSection({
  item,
}: {
  item: PortfolioItem;
  index: number;
}) {
  const light = isLightBg(item.background);
  const textColor = light ? "rgba(60, 20, 30, 0.8)" : "rgba(245, 198, 208, 0.5)";
  const textColorFaint = light ? "rgba(60, 20, 30, 0.4)" : "rgba(245, 198, 208, 0.3)";

  return (
    <div
      className="flex flex-col items-center gap-6 px-6"
      style={{ maxWidth: "80vw" }}
    >
      {item.image && (
        <ImageWithSkeleton item={item} light={light} />
      )}

      <h2
        data-tina-field={tinaField(item as unknown as Record<string, unknown>, "title")}
        className="text-3xl md:text-5xl text-center font-light"
        style={{
          fontFamily: "var(--font-cormorant)",
          padding: "0 4px 6px 4px",
          ...(light
            ? { color: "#5a1428" }
            : {
                background: "linear-gradient(90deg, #f5c6d0, #e8a0b0, #f2d0d8, #dba0b8, #f5c6d0)",
                backgroundSize: "300% 100%",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "text-breathe 8s ease-in-out infinite",
              }),
        }}
      >
        {item.title}
      </h2>

      {item.description && (
        <p
          data-tina-field={tinaField(item as unknown as Record<string, unknown>, "description")}
          className="text-sm md:text-base text-center max-w-md font-light"
          style={{ color: textColor }}
        >
          {item.description}
        </p>
      )}

      {item.date && (
        <p
          className="text-xs tracking-widest uppercase"
          style={{ color: textColorFaint }}
        >
          {formatDate(item.date)}
        </p>
      )}
    </div>
  );
}
