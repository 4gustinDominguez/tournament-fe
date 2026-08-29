import React from "react";
import Header from "@/components/Header";
import { Trophy } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("Footer");
  const tMenu = await getTranslations("Menu");

  return (
    <div className="flex flex-col min-h-screen bg-night-900 text-night-100">
      <Header />
      <main className="flex-grow pt-20">{children}</main>
      <footer className="bg-night-800 border-t border-white/10 text-night-200 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white shadow-glow">
                  <Trophy className="h-5 w-5" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-display text-2xl font-black tracking-tight text-white">
                    GTM
                  </span>
                  <span className="text-xs text-night-300 mt-1">
                    {tMenu("tagline")}
                  </span>
                </div>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-night-300">
                {t("description")}
              </p>
              <div className="flex gap-4 mt-6">
                <div className="w-9 h-9 bg-white/5 rounded-full grid place-items-center hover:bg-brand-600 transition-colors cursor-pointer text-sm">
                  📘
                </div>
                <div className="w-9 h-9 bg-white/5 rounded-full grid place-items-center hover:bg-brand-600 transition-colors cursor-pointer text-sm">
                  🐦
                </div>
                <div className="w-9 h-9 bg-white/5 rounded-full grid place-items-center hover:bg-brand-600 transition-colors cursor-pointer text-sm">
                  📷
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 eyebrow">
                {t("platformTitle")}
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-amber-300 transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
                    {t("platformTournaments")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-amber-300 transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
                    {t("platformTeams")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-amber-300 transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
                    {t("platformReferees")}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 eyebrow">
                {t("supportTitle")}
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-amber-300 transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
                    {t("supportContact")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-amber-300 transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
                    {t("supportHelp")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-amber-300 transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
                    {t("supportPrivacy")}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-xs text-night-300">
            <p>{t("rights", { year: new Date().getFullYear() })}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
