"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isHome = pathname === "/";

  const navLinks = [
    { href: isHome ? "#wedding-organizer" : "/#wedding-organizer", label: "Untuk WO" },
    { href: isHome ? "#fitur" : "/#fitur", label: "Fitur" },
    { href: isHome ? "#harga" : "/#harga", label: "Harga" },
    { href: isHome ? "#kontak" : "/#kontak", label: "Kontak" },
  ];

  return (
    <header className="sticky top-4 z-50 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Floating Pill Container */}
      <div className="relative flex items-center justify-between px-5 sm:px-7 py-3 rounded-2xl bg-[#FAF6F0]/85 backdrop-blur-md border border-[#E5DAC9] shadow-[0_4px_20px_-2px_rgba(35,28,22,0.06)] transition-all">
        {/* Brand Left Lockup: Ornamen Kupu-Kupu Emas + MomenKita */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 sm:gap-3 transition-opacity hover:opacity-90"
        >
          {/* Logo Kupu-Kupu / Ornamen Emas Estetis */}
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFE8DC]/60 border border-[#9E7B4F]/25 shadow-sm">
            <svg
              width="24"
              height="24"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#9E7B4F] transition-transform duration-500 group-hover:scale-105"
            >
              {/* Sayap Kupu-Kupu Kiri Atas & Bawah */}
              <path
                d="M16 16C13.5 10 7 7 6 12C5 17 12 18 16 16Z"
                fill="url(#goldGradientLeft)"
                fillOpacity="0.85"
                stroke="#7E5E36"
                strokeWidth="0.8"
              />
              <path
                d="M16 16C13 19 8 24 9 26C10 28 14 24 16 16Z"
                fill="url(#goldGradientLeft)"
                fillOpacity="0.65"
                stroke="#7E5E36"
                strokeWidth="0.8"
              />
              {/* Sayap Kupu-Kupu Kanan Atas & Bawah */}
              <path
                d="M16 16C18.5 10 25 7 26 12C27 17 20 18 16 16Z"
                fill="url(#goldGradientRight)"
                fillOpacity="0.85"
                stroke="#7E5E36"
                strokeWidth="0.8"
              />
              <path
                d="M16 16C19 19 24 24 23 26C22 28 18 24 16 16Z"
                fill="url(#goldGradientRight)"
                fillOpacity="0.65"
                stroke="#7E5E36"
                strokeWidth="0.8"
              />
              {/* Badan Tengah */}
              <circle cx="16" cy="16" r="1.5" fill="#5A4325" />
              <defs>
                <linearGradient id="goldGradientLeft" x1="6" y1="7" x2="16" y2="18" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#C5A059" />
                  <stop offset="1" stopColor="#8A6539" />
                </linearGradient>
                <linearGradient id="goldGradientRight" x1="26" y1="7" x2="16" y2="18" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#C5A059" />
                  <stop offset="1" stopColor="#8A6539" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <span className="font-serif text-2xl font-bold tracking-tight text-[#231C16]">
            MomenKita
          </span>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-9">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[14px] font-medium tracking-normal text-[#5C4E43] transition-colors duration-200 hover:text-[#9E7B4F]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Action Buttons Group */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Tombol Masuk */}
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center justify-center rounded-xl border border-[#231C16]/30 px-4 py-2 text-xs sm:text-sm font-medium text-[#231C16] transition-all hover:bg-[#231C16]/5"
          >
            Masuk
          </Link>

          {/* Tombol Daftar */}
          <Link
            href="/create"
            className="hidden sm:inline-flex items-center justify-center rounded-xl bg-[#231C16] px-4 py-2 text-xs sm:text-sm font-medium text-white transition-all hover:bg-[#382E25]"
          >
            Daftar
          </Link>

          {/* Tombol Coba Gratis (Champagne Gold Gradient) */}
          <Link
            href="/events/sample-event"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#A68458] to-[#86653B] px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-sm hover:opacity-95 transition-all"
          >
            Coba Gratis
          </Link>

          {/* Mobile Hamburger Trigger */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#231C16]/20 bg-[#FAF6F0] md:hidden focus:outline-none"
          >
            <div className="flex h-3.5 w-4 flex-col justify-between">
              <span
                className={`block h-[1.8px] w-full bg-[#231C16] transition-transform duration-300 ${
                  menuOpen ? "translate-y-[6px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-[1.8px] w-full bg-[#231C16] transition-opacity duration-300 ${
                  menuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`block h-[1.8px] w-full bg-[#231C16] transition-transform duration-300 ${
                  menuOpen ? "-translate-y-[6px] -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Dropdown Menu (Glassmorphism rounded dropdown) */}
        {menuOpen && (
          <div className="absolute top-full left-0 right-0 mt-2.5 rounded-2xl bg-[#FAF6F0]/95 backdrop-blur-xl border border-[#E5DAC9] p-5 shadow-xl md:hidden z-50">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="py-1.5 text-sm font-medium text-[#231C16] hover:text-[#9E7B4F] flex items-center justify-between border-b border-[#E5DAC9]/50"
                >
                  <span>{link.label}</span>
                  <span className="text-xs text-[#9E7B4F]">→</span>
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2 pt-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center rounded-xl border border-[#231C16]/30 py-2.5 text-xs font-medium text-[#231C16]"
                >
                  Masuk ke Dashboard
                </Link>
                <Link
                  href="/create"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center rounded-xl bg-[#231C16] py-2.5 text-xs font-medium text-white"
                >
                  Daftar Akun Baru
                </Link>
                <Link
                  href="/events/sample-event/camera"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center rounded-xl bg-gradient-to-r from-[#A68458] to-[#86653B] py-2.5 text-xs font-medium text-white flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                  Tes Kamera Tamu
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
