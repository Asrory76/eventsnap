"use client";

import { useState, useEffect } from "react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("momenkita_consent_dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem("momenkita_consent_dismissed", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 rounded-2xl border border-white/15 bg-[#1B1815]/95 p-4 shadow-2xl backdrop-blur-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-white/90 leading-relaxed font-light">
            Kami menggunakan cookie dan penyimpanan lokal demi memastikan pengunggahan momen pernikahan berjalan lancar dan optimal.
          </p>
          <div className="mt-2.5 flex items-center gap-3">
            <button
              type="button"
              onClick={dismiss}
              className="rounded-full bg-[#BA935D] px-4 py-1.5 text-xs font-medium text-white transition hover:bg-[#A8824E]"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
        <button
          onClick={dismiss}
          aria-label="Tutup"
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-white/60 hover:text-white"
        >
          ✕
        </button>
      </div>
    </aside>
  );
}
