'use client';

import React, { useEffect, useState } from 'react';
import CreateTournamentForm from "@/components/CreateTournamentForm";
import { TournamentList } from "@/components/TournamentList";
import { useTranslations } from "next-intl";
import {
    Trophy,
    Plus,
    Sparkles,
    Users,
    X,
    Shirt,
    Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import QuickSetupWizard from "@/components/QuickSetupWizard";
import { useAuth, UserRole } from "@/sections/tournaments/auth-context";
import { useTournamentContext } from "@/sections/tournaments/tournaments-context";
import { DashboardStats } from "@/modules/tournament/domain/dashboard-stats";

export default function TournamentsPage() {
    const t = useTranslations('MyTournaments');
    const tTr = useTranslations('Tournaments');
    const { user } = useAuth();
    const { getDashboardStats } = useTournamentContext();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [showWizard, setShowWizard] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const canManage = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.TOURNAMENT_ADMIN;

    useEffect(() => {
        getDashboardStats().then(setStats).catch(() => setStats(null));
    }, [getDashboardStats]);

    const statCards = [
        {
            label: t('myTournaments'),
            value: stats?.tournaments ?? '--',
            icon: Trophy,
            iconClass: 'bg-brand-50 text-brand-600',
        },
        {
            label: t('totalTeams'),
            value: stats?.teams ?? '--',
            icon: Shirt,
            iconClass: 'bg-brand-50 text-brand-600',
        },
        {
            label: t('totalPlayers'),
            value: stats?.players ?? '--',
            icon: Users,
            iconClass: 'bg-amber-50 text-amber-600',
        },
        {
            label: t('totalMatches'),
            value: stats?.matches ?? '--',
            icon: Activity,
            iconClass: 'bg-emerald-50 text-emerald-600',
        },
    ];

    return (
        <div className="space-y-8 pb-10">
            {/* Header section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="display-title text-3xl md:text-4xl text-foreground flex items-center gap-3">
                        <span className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 grid place-items-center">
                            <Trophy className="h-5 w-5" />
                        </span>
                        {t('myTournaments')}
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium">{t('subtitle')}</p>
                </div>

                {canManage && (
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowWizard(true)}
                            className="h-11 px-6 rounded-lg border-brand-200 bg-brand-50/50 text-brand-700 hover:bg-brand-100 hover:text-brand-800 font-semibold gap-2"
                        >
                            <Sparkles className="h-4 w-4" /> {t('quickSetup')}
                        </Button>
                        <Button
                            onClick={() => setShowCreateForm(true)}
                            className="h-11 px-6 rounded-lg bg-brand-600 hover:bg-brand-700 font-semibold gap-2 shadow-card"
                        >
                            <Plus className="h-4 w-4" /> {tTr('create')}
                        </Button>
                    </div>
                )}
            </header>

            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card) => (
                    <Card key={card.label} className="border-border shadow-card overflow-hidden group hover:shadow-elevated transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-xl ${card.iconClass} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <card.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="eyebrow text-[10px] text-muted-foreground">{card.label}</p>
                                    <p className="text-2xl font-black text-foreground">{card.value}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* List section */}
            <div className="grid grid-cols-1 gap-6">
                <TournamentList />
            </div>

            {/* Modal Components */}
            {showWizard && <QuickSetupWizard onClose={() => setShowWizard(false)} />}
            {showCreateForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-night-900/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-2xl shadow-elevated rounded-2xl overflow-hidden border-border animate-enter">
                        <div className="bg-neutral-50 px-8 py-4 border-b border-border flex items-center justify-between">
                            <h3 className="display-title text-xl text-foreground flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-brand-600" />
                                {t('newTournament')}
                            </h3>
                            <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)} className="rounded-full h-8 w-8 p-0 text-muted-foreground">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="p-8 max-h-[80vh] overflow-y-auto">
                            <CreateTournamentForm onCreated={() => setShowCreateForm(false)} />
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
