"use client";

import React, { useState } from "react";
import { Link } from "@/navigation";
import Menu from "@/components/Menu";
import { Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Header() {
  const t = useTranslations("Menu");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-night-900/80 backdrop-blur-lg border-b border-white/10 shadow-lg">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white shadow-glow">
            <Trophy className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-2xl font-black tracking-tight text-white leading-none">
              GTM
            </span>
            <span className="text-[10px] text-night-200 font-semibold mt-1 uppercase tracking-wider">
              {t("tagline")}
            </span>
          </div>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/"
            className="text-night-100 hover:text-amber-300 font-semibold transition-colors relative group"
          >
            {t("home")}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link
            href="/tournaments"
            className="text-night-100 hover:text-amber-300 font-semibold transition-colors relative group"
          >
            {t("tournaments")}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link
            href="/contact"
            className="text-night-100 hover:text-amber-300 font-semibold transition-colors relative group"
          >
            {t("contact")}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <Menu />
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
            aria-label={t("openMenu")}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isMobileMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden bg-night-900/95 backdrop-blur-lg border-t border-white/10">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-night-100 hover:text-amber-300 font-semibold transition-colors py-2"
            >
              {t("home")}
            </Link>
            <Link
              href="/tournaments"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-night-100 hover:text-amber-300 font-semibold transition-colors py-2"
            >
              {t("tournaments")}
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-night-100 hover:text-amber-300 font-semibold transition-colors py-2"
            >
              {t("contact")}
            </Link>
            <Menu mobile onNavigate={() => setIsMobileMenuOpen(false)} />
          </nav>
        </div>
      )}
    </header>
  );
}
