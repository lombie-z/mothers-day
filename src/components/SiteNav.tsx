"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SiteSettings {
  aboutText?: string | null;
  aboutCta?: string | null;
  email?: string | null;
}

function AboutModal({ settings, onClose }: { settings: SiteSettings; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md mx-4"
        style={{ background: "rgba(90, 20, 40, 0.85)", padding: "2.5rem" }}
      >
        <button
          onClick={onClose}
          className="absolute text-white/40 hover:text-white/80 transition-colors"
          style={{ top: "1rem", right: "1rem" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-3xl mb-4 font-light" style={{ fontFamily: "var(--font-cormorant)", color: "#f5c6d0" }}>
          About
        </h2>
        <p className="text-white/70 text-sm leading-relaxed mb-4">
          {settings.aboutText || ""}
        </p>
        {settings.aboutCta && (
          <p className="text-white/50 text-sm leading-relaxed">
            {settings.aboutCta}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function SiteNav() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({});

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => {});
  }, []);

  // Also try reading from window if useTina has populated it
  useEffect(() => {
    try {
      const raw = document.querySelector('[data-settings]')?.getAttribute('data-settings');
      if (raw) setSettings(JSON.parse(raw));
    } catch {}
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 1, ease: "easeOut" }}
        className="fixed z-40 flex gap-0 backdrop-blur-md text-white/70"
        style={{ top: "5vh", right: "5vw", background: "rgba(0, 0, 0, 0.2)" }}
      >
        <button
          onClick={() => setAboutOpen(true)}
          className="inline-flex items-center justify-center w-10 h-10 hover:bg-white/10 transition-all duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
        </button>
        <div className="relative">
          <button
            onClick={() => {
              const email = settings.email || "";
              if (!email) return;
              navigator.clipboard.writeText(email).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              });
            }}
            className="inline-flex items-center justify-center w-10 h-10 hover:bg-white/10 transition-all duration-300"
          >
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            )}
          </button>
          <AnimatePresence>
            {copied && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full right-0 mt-2 text-xs whitespace-nowrap"
                style={{
                  background: "rgba(0, 0, 0, 0.6)",
                  color: "rgba(245, 198, 208, 0.9)",
                  padding: "4px 10px",
                  backdropFilter: "blur(8px)",
                }}
              >
                Email copied
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {aboutOpen && <AboutModal settings={settings} onClose={() => setAboutOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
