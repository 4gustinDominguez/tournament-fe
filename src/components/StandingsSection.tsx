'use client';

import React, { useEffect, useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTournamentContext } from '@/sections/tournaments/tournaments-context';
import { Trophy, Target, Shield } from 'lucide-react';
import StandingsTable from './StandingsTable';
import { TeamCrest } from './TeamCrest';
import { useTranslations } from 'next-intl';

interface StandingsSectionProps {
    tournamentId: string;
}

const StandingsSection: React.FC<StandingsSectionProps> = ({ tournamentId }) => {
    const t = useTranslations('Standings');
    const { getStandings, standings, teams } = useTournamentContext();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStandings() {
            setLoading(true);
            try {
                await getStandings(tournamentId);
            } catch (error) {
                console.error("Error fetching standings:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchStandings();
    }, [tournamentId, getStandings]);

    if (loading) {
        return (
            <div className="space-y-6 mt-6">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-[250px]" />
                    <Skeleton className="h-4 w-[400px]" />
                </div>
                <Skeleton className="h-[400px] w-full rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="space-y-1">
                <h2 className="display-title text-2xl md:text-3xl text-foreground">{t('title')}</h2>
                <p className="text-sm text-muted-foreground">
                    {t('subtitle')}
                </p>
            </header>

            <div className="animate-in fade-in zoom-in-95 duration-500">
                {standings.length > 0 ? (
                    <StandingsTable standings={standings} teams={teams} />
                ) : (
                    <p className="text-sm text-muted-foreground">{t('empty')}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-brand-50/50 border-brand-100 shadow-card transition-all hover:shadow-elevated">
                    <CardHeader className="pb-2">
                        <CardTitle className="eyebrow text-brand-600">{t('leader')}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-3">
                        {standings[0] && (
                            <TeamCrest
                                crestId={teams.find(t => t.id === standings[0].teamId)?.crestUrl}
                                teamName={standings[0].teamName}
                                size={36}
                            />
                        )}
                        <div className="font-display text-2xl font-bold text-foreground">{standings[0]?.teamName || '-'}</div>
                    </CardContent>
                </Card>

                <Card className="bg-amber-50/50 border-amber-100 shadow-card transition-all hover:shadow-elevated">
                    <CardHeader className="pb-2">
                        <CardTitle className="eyebrow text-amber-600">{t('topScorer')}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-3">
                        {(() => {
                            const topScorer = [...standings].sort((a, b) => b.goalsFor - a.goalsFor)[0];
                            return topScorer ? (
                                <TeamCrest
                                    crestId={teams.find(t => t.id === topScorer.teamId)?.crestUrl}
                                    teamName={topScorer.teamName}
                                    size={36}
                                />
                            ) : null;
                        })()}
                        <div className="font-display text-2xl font-bold text-foreground">
                            {[...standings].sort((a, b) => b.goalsFor - a.goalsFor)[0]?.teamName || '-'}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-neutral-50 border-border shadow-card transition-all hover:shadow-elevated">
                    <CardHeader className="pb-2">
                        <CardTitle className="eyebrow text-muted-foreground">{t('bestDefense')}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-3">
                        {(() => {
                            const bestDefense = [...standings].filter(t => t.played > 0).sort((a, b) => a.goalsAgainst - b.goalsAgainst)[0];
                            return bestDefense ? (
                                <TeamCrest
                                    crestId={teams.find(t => t.id === bestDefense.teamId)?.crestUrl}
                                    teamName={bestDefense.teamName}
                                    size={36}
                                />
                            ) : null;
                        })()}
                        <div className="font-display text-2xl font-bold text-foreground">
                            {[...standings].filter(t => t.played > 0).sort((a, b) => a.goalsAgainst - b.goalsAgainst)[0]?.teamName || '-'}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default StandingsSection;
