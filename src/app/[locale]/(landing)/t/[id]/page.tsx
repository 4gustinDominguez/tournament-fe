'use client';

import { useEffect, useState, use } from "react";
import { useTranslations } from "next-intl";
import { Tournament } from "@/modules/tournament/domain/tournament";
import { useTournamentContext } from "@/sections/tournaments/tournaments-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Trophy } from "lucide-react";

import TeamsSection from "@/components/TeamsSection";
import MatchesSection from "@/components/MatchesSection";
import StandingsSection from "@/components/StandingsSection";

export default function PublicTournamentPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const t = useTranslations('PublicTournament');
    const { getTournamentBySlug, getTournamentById } = useTournamentContext();
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadTournament() {
            setLoading(true);
            try {
                let data = await getTournamentBySlug(params.id);
                if (!data) {
                    data = await getTournamentById(params.id);
                }
                setTournament(data);
            } catch (error) {
                console.error("Error loading tournament:", error);
            } finally {
                setLoading(false);
            }
        }
        loadTournament();
    }, [params.id, getTournamentBySlug, getTournamentById]);

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-night-900">
                <section className="pt-20 pb-24 md:pt-28 md:pb-32">
                    <div className="container mx-auto px-4 text-center space-y-4">
                        <Skeleton className="h-14 w-3/4 max-w-2xl mx-auto rounded-lg bg-white/10" />
                        <Skeleton className="h-6 w-1/2 max-w-md mx-auto rounded-lg bg-white/10" />
                    </div>
                </section>
                <div className="container mx-auto px-4 py-12 space-y-12 max-w-6xl">
                    <Skeleton className="h-96 w-full rounded-3xl bg-white/10" />
                    <Skeleton className="h-96 w-full rounded-3xl bg-white/10" />
                </div>
            </div>
        );
    }

    if (!tournament) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-night-900 text-center px-4">
                <div className="text-6xl mb-6">🏆</div>
                <h1 className="font-display text-4xl font-black text-white mb-4">{t('notFoundTitle')}</h1>
                <p className="text-night-200 max-w-md">{t('notFoundText')}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full bg-neutral-50">
            {/* Hero Section */}
            <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden bg-night-900 text-white">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[70%] bg-brand-600/25 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[50%] bg-amber-500/15 rounded-full blur-[120px]"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-8 backdrop-blur-md">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span className="eyebrow text-[11px] text-brand-300">{t('official')}</span>
                    </div>

                    <h1 className="font-display text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[0.95]">
                        {tournament.name}
                    </h1>

                    <div className="flex flex-wrap items-center justify-center gap-6 text-night-100 font-medium text-lg">
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                            <MapPin className="w-5 h-5 text-brand-400" />
                            <span>{tournament.location || t('locationPlaceholder')}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                            <Calendar className="w-5 h-5 text-amber-400" />
                            <span>
                                {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Sections */}
            <main className="container mx-auto px-4 py-16 md:py-20 space-y-16 md:space-y-20 max-w-6xl">

                {/* Standings */}
                <section className="bg-white rounded-3xl p-8 md:p-10 shadow-card border border-border">
                    <div className="mb-8 text-center">
                        <h2 className="eyebrow text-brand-600 mb-3">{t('standingsEyebrow')}</h2>
                        <h3 className="font-display text-4xl md:text-5xl font-black text-foreground tracking-tight">{t('standingsTitle')}</h3>
                    </div>
                    <StandingsSection tournamentId={tournament.id} />
                </section>

                {/* Matches */}
                <section className="bg-white rounded-3xl p-8 md:p-10 shadow-card border border-border">
                    <div className="mb-8 text-center">
                        <h2 className="eyebrow text-amber-600 mb-3">{t('calendarEyebrow')}</h2>
                        <h3 className="font-display text-4xl md:text-5xl font-black text-foreground tracking-tight">{t('calendarTitle')}</h3>
                    </div>
                    <MatchesSection tournamentId={tournament.id} readOnly />
                </section>

                {/* Teams */}
                <section className="bg-white rounded-3xl p-8 md:p-10 shadow-card border border-border">
                    <div className="mb-8 text-center">
                        <h2 className="eyebrow text-sky-600 mb-3">{t('teamsEyebrow')}</h2>
                        <h3 className="font-display text-4xl md:text-5xl font-black text-foreground tracking-tight">{t('teamsTitle')}</h3>
                    </div>
                    <TeamsSection tournamentId={tournament.id} readOnly />
                </section>

            </main>
        </div>
    );
}
