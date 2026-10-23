"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isHome = pathname === "/";

  const navLinks = [
    { href: isHome ? "#kamera-hp" : "/#kamera-hp", label: "Fitur HP" },
    { href: isHome ? "#wedding-organizer" : "/#wedding-organizer", label: "Untuk WO" },
    { href: isHome ? "#harga" : "/#harga", label: "Harga" },
    { href: isHome ? "#kontak" : "/#kontak", label: "Kontak" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#141210]/95 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-8">
          {/* Brand Lockup: PicMe */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 sm:gap-3 transition-opacity hover:opacity-90"
          >
            {/* Elegant 4-petal floral / clover knot logo in warm gold */}
            <div className="relative flex h-8 w-8 items-center justify-center">
              <svg
                width="30"
                height="30"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-transform duration-500 group-hover:rotate-45"
              >
                <circle cx="12" cy="12" r="5" stroke="#C5A059" strokeWidth="1.8" />
                <circle cx="20" cy="12" r="5" stroke="#C5A059" strokeWidth="1.8" />
                <circle cx="12" cy="20" r="5" stroke="#C5A059" strokeWidth="1.8" />
                <circle cx="20" cy="20" r="5" stroke="#C5A059" strokeWidth="1.8" />
                <circle cx="16" cy="16" r="1.5" fill="#E8D5B5" />
              </svg>
            </div>

            <span className="font-serif-luxury text-xl sm:text-2xl font-semibold tracking-wide text-white">
              PicMe
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[13px] lg:text-[14px] font-normal tracking-wide text-white/80 transition-colors hover:text-[#C5A059]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex rounded-full border border-white/20 bg-white/5 px-4 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-normal text-white/90 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/40"
            >
              Masuk
            </Link>
            <Link
              href="/create"
              className="rounded-full bg-[#BA935D] px-4 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-medium text-white shadow-[0_2px_10px_rgba(186,147,93,0.35)] transition-all hover:bg-[#A67F4B]"
            >
              Daftar / Buat
            </Link>

            {/* Mobile Hamburger Trigger */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 md:hidden focus:outline-none"
            >
              <div className="flex h-3.5 w-4 flex-col justify-between">
                <span
                  className={`block h-[1.8px] w-full bg-white transition-transform duration-300 ${
                    menuOpen ? "translate-y-[6px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`block h-[1.8px] w-full bg-white transition-opacity duration-300 ${
                    menuOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`block h-[1.8px] w-full bg-white transition-transform duration-300 ${
                    menuOpen ? "-translate-y-[6px] -rotate-45" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="border-t border-white/10 bg-[#171412] px-5 py-5 md:hidden animate-fadeIn">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="py-1 text-sm text-white/80 hover:text-[#C5A059] flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  <span className="text-xs text-white/40">→</span>
                </Link>
              ))}
              <div className="mt-3 flex flex-col gap-2.5 pt-4 border-t border-white/10">
                <Link
                  href="/events/sample-event/camera"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center rounded-full bg-[#B88E4F]/20 border border-[#B88E4F]/40 py-2.5 text-xs font-medium text-[#E5C794] flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                  Tes Kamera HP Tamu
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center rounded-full border border-white/20 py-2 text-xs font-medium text-white/90"
                >
                  Masuk Dashboard WO
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
