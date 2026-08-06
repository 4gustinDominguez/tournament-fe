'use client';

import { Link } from "@/navigation";
import { useTournamentContext } from "@/sections/tournaments/tournaments-context";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Calendar, MapPin, ChevronRight, Trophy } from "lucide-react";

export const TournamentList: React.FC = () => {
    const { tournaments } = useTournamentContext();
    const t = useTranslations('Tournaments');
    const tStatus = useTranslations('Common.status');

    const statusOf = (tournament: { startDate: Date | string; endDate: Date | string }): { label: string; className: string } => {
        if (new Date() < new Date(tournament.startDate)) {
            return { label: tStatus('upcoming'), className: 'bg-brand-50 text-brand-700' };
        }
        if (new Date() > new Date(tournament.endDate)) {
            return { label: tStatus('finished'), className: 'bg-neutral-100 text-muted-foreground' };
        }
        return { label: tStatus('ongoing'), className: 'bg-amber-100 text-amber-700' };
    };

    const list = useMemo(() => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map(tournament => {
                const status = statusOf(tournament);
                return (
                    <Link key={tournament.id} href={`/manage/my-tournaments/${tournament.id}`} className="group">
                        <div className="h-full bg-white border border-border rounded-2xl p-6 shadow-card transition-all duration-300 hover:shadow-elevated hover:border-brand-300 group-hover:-translate-y-1">
                            <div className="flex justify-between items-start mb-4 gap-3">
                                <h3 className="font-display text-xl font-bold text-foreground group-hover:text-brand-600 transition-colors line-clamp-1">
                                    {tournament.name}
                                </h3>
                                <span className={`shrink-0 px-2 py-1 rounded-full text-xs font-bold ${status.className}`}>
                                    {status.label}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-neutral-400" />
                                    <span>{new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-neutral-400" />
                                    <span>{tournament.location}</span>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between">
                                <span className="flex items-center text-brand-600 font-bold text-sm">
                                    {t('viewDetails')}
                                    <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                                </span>
                                <Trophy className="h-4 w-4 text-neutral-200 group-hover:text-amber-400 transition-colors" />
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    ), [tournaments, t]);

    if (tournaments.length === 0) {
        return (
            <div className="text-center py-12 bg-white border border-dashed border-border rounded-2xl">
                <Trophy className="h-8 w-8 text-neutral-300 mx-auto mb-3" />
                <p className="text-muted-foreground italic">{t('noTournaments')}</p>
            </div>
        );
    }

    return list;
};
