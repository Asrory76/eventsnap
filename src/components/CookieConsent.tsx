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
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 rounded-2xl border border-[#E5DAC9] bg-[#FAF6F0]/95 p-4 shadow-xl backdrop-blur-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-[#5C4E43] leading-relaxed font-normal">
            Kami menggunakan cookie dan penyimpanan lokal demi memastikan pengunggahan foto acara berlangsung cepat, aman, dan tanpa hambatan.
          </p>
          <div className="mt-2.5 flex items-center gap-3">
            <button
              type="button"
              onClick={dismiss}
              className="btn-gold-gradient rounded-xl px-4 py-1.5 text-xs font-medium text-white shadow-xs"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
        <button
          onClick={dismiss}
          aria-label="Tutup"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#6E5D4F] hover:text-[#231C16]"
        >
          ✕
        </button>
      </div>
    </aside>
  );
}
