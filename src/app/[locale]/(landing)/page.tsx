'use client';

import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Zap,
  Shield,
  ArrowRight,
  PlayCircle,
  CheckCircle2,
  CalendarDays,
  Radio
} from "lucide-react";

export default function Home() {
  const t = useTranslations('Landing');

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden bg-night-900">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[45%] h-[55%] bg-brand-600/30 rounded-full blur-[140px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[45%] bg-amber-500/20 rounded-full blur-[140px]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03]"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 80px), repeating-linear-gradient(90deg, #fff 0 1px, transparent 1px 80px)"
            }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-8">
              <span className="flex h-2 w-2 rounded-full bg-brand-400 animate-pulse"></span>
              <span className="eyebrow text-[11px] text-amber-300">{t('badge')}</span>
            </div>

            <h1 className="font-display text-6xl md:text-8xl font-black tracking-tight text-white mb-6 leading-[0.95]">
              {t('heroTitle1')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-amber-400">
                {t('heroTitle2')}
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg md:text-xl text-night-200 mb-10 leading-relaxed font-medium">
              {t('heroSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="h-14 px-8 rounded-xl bg-brand-500 hover:bg-brand-400 text-lg font-bold shadow-glow transition-all hover:scale-105">
                <Link href="/tournaments">
                  {t('ctaStart')} <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-14 px-8 rounded-xl border-white/15 text-night-100 hover:bg-white/5 hover:text-white text-lg font-bold">
                <PlayCircle className="mr-2 h-5 w-5 text-amber-400" /> {t('ctaDemo')}
              </Button>
            </div>
          </div>

          {/* Scoreboard showcase */}
          <div className="mt-16 max-w-3xl mx-auto">
            <div className="rounded-2xl border border-white/10 bg-night-800/70 backdrop-blur-md overflow-hidden shadow-elevated animate-enter">
              <div className="flex items-center justify-between px-5 py-2.5 bg-white/5 border-b border-white/10">
                <span className="inline-flex items-center gap-2 eyebrow text-[10px] text-brand-300">
                  <Radio className="h-3 w-3 text-status-live animate-pulse" />
                  {t('matchCenter')}
                </span>
                <span className="eyebrow text-[10px] text-night-300">{t('matchLabel')}</span>
              </div>
              <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4 px-6 py-6">
                <div className="text-right">
                  <p className="font-display text-lg md:text-2xl font-bold text-white truncate">{t('matchTeamA')}</p>
                </div>
                <div className="flex items-center gap-3 px-5 py-2 rounded-xl bg-night-900 border border-white/10">
                  <span className="font-display text-4xl font-black tabular-nums text-white">1</span>
                  <span className="font-display text-neutral-400 font-bold text-sm tracking-widest">VS</span>
                  <span className="font-display text-4xl font-black tabular-nums text-amber-400">2</span>
                </div>
                <div className="text-left">
                  <p className="font-display text-lg md:text-2xl font-bold text-white truncate">{t('matchTeamB')}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 text-center">
                {[
                  ["90'", t('matchTime')],
                  ["8", t('matchIncidents')],
                  ["6 pts", t('matchLeader')],
                ].map(([value, label]) => (
                  <div key={label} className="py-3">
                    <div className="font-display text-lg font-black text-white">{value}</div>
                    <div className="eyebrow text-[9px] text-night-300">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-night-800/50 border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="eyebrow text-brand-400">{t('featuresTitle')}</h2>
            <h3 className="font-display text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              {t('featuresSubtitle1')} <br /> {t('featuresSubtitle2')}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white/[0.04] border border-white/10 rounded-2xl hover:bg-white/[0.07] hover:border-brand-400/30 hover:-translate-y-2 transition-all duration-300">
              <div className="p-3 bg-brand-500/15 text-brand-400 rounded-xl w-fit mb-6">
                <Zap className="h-6 w-6" />
              </div>
              <h4 className="font-display text-2xl font-bold text-white mb-3">{t('f1Title')}</h4>
              <p className="text-night-200 leading-relaxed text-sm font-medium">
                {t('f1Text')}
              </p>
            </div>

            <div className="p-8 bg-white/[0.04] border border-white/10 rounded-2xl hover:bg-white/[0.07] hover:border-brand-400/30 hover:-translate-y-2 transition-all duration-300">
              <div className="p-3 bg-amber-500/15 text-amber-400 rounded-xl w-fit mb-6">
                <Trophy className="h-6 w-6" />
              </div>
              <h4 className="font-display text-2xl font-bold text-white mb-3">{t('f2Title')}</h4>
              <p className="text-night-200 leading-relaxed text-sm font-medium">
                {t('f2Text')}
              </p>
            </div>

            <div className="p-8 bg-white/[0.04] border border-white/10 rounded-2xl hover:bg-white/[0.07] hover:border-brand-400/30 hover:-translate-y-2 transition-all duration-300">
              <div className="p-3 bg-sky-500/15 text-sky-400 rounded-xl w-fit mb-6">
                <Shield className="h-6 w-6" />
              </div>
              <h4 className="font-display text-2xl font-bold text-white mb-3">{t('f3Title')}</h4>
              <p className="text-night-200 leading-relaxed text-sm font-medium">
                {t('f3Text')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            <div className="space-y-2">
              <div className="font-display text-5xl md:text-6xl font-black tracking-tight">500+</div>
              <div className="text-emerald-200 eyebrow text-[11px]">{t('statsActive')}</div>
            </div>
            <div className="space-y-2">
              <div className="font-display text-5xl md:text-6xl font-black tracking-tight">12K+</div>
              <div className="text-emerald-200 eyebrow text-[11px]">{t('statsPlayers')}</div>
            </div>
            <div className="space-y-2">
              <div className="font-display text-5xl md:text-6xl font-black tracking-tight">1.2M</div>
              <div className="text-emerald-200 eyebrow text-[11px]">{t('statsMatches')}</div>
            </div>
            <div className="space-y-2">
              <div className="font-display text-5xl md:text-6xl font-black tracking-tight">4.9/5</div>
              <div className="text-emerald-200 eyebrow text-[11px]">{t('statsRating')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-night-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto rounded-3xl bg-night-800 p-12 md:p-20 text-center relative overflow-hidden border border-white/10 shadow-elevated">
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-amber-500/10 blur-[120px] rounded-full"></div>
            <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-brand-500/15 blur-[120px] rounded-full"></div>

            <h2 className="font-display text-4xl md:text-6xl font-black text-white mb-6 relative z-10 tracking-tight leading-tight">
              {t('ctaTitle1')} <br /> {t('ctaTitle2')}
            </h2>
            <p className="text-night-200 text-lg mb-10 relative z-10 max-w-lg mx-auto leading-relaxed">
              {t('ctaText')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <Button asChild size="lg" className="h-14 px-10 rounded-xl bg-brand-500 hover:bg-brand-400 text-lg font-black tracking-wide transition-all hover:scale-105 shadow-glow">
                <Link href="/register">{t('ctaRegister')}</Link>
              </Button>
              <Button variant="link" className="text-amber-300 hover:text-amber-200 font-bold text-lg">
                {t('ctaExpert')}
              </Button>
            </div>

            <div className="mt-10 flex items-center justify-center gap-6 relative z-10">
              <div className="flex items-center gap-2 text-xs font-bold text-night-300">
                <CheckCircle2 className="h-4 w-4 text-brand-400" /> {t('ctaNoCard')}
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-night-300">
                <CheckCircle2 className="h-4 w-4 text-brand-400" /> {t('ctaSetup')}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
