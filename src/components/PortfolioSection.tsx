"use client";

import Image from "next/image";
import { tinaField } from "tinacms/dist/react";

export interface PortfolioItem {
  title: string;
  image: string;
  description?: string | null;
  date?: string | null;
  background?: string | null;
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
        <div data-tina-field={tinaField(item, "image")}>
          <div
            className="relative overflow-hidden"
            style={{
              border: `1px solid ${light ? "rgba(60,20,30,0.1)" : "rgba(245, 198, 208, 0.2)"}`,
              maxHeight: "55vh",
              maxWidth: "70vw",
            }}
          >
            <Image
              src={item.image}
              alt={item.title}
              width={800}
              height={600}
              className="object-contain"
              style={{ maxHeight: "55vh", width: "auto", height: "auto" }}
            />
          </div>
        </div>
      )}

      <h2
        data-tina-field={tinaField(item, "title")}
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
          data-tina-field={tinaField(item, "description")}
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
