'use client';

import React, { useState } from 'react';
import CreateTournamentForm from "@/components/CreateTournamentForm";
import { TournamentList } from "@/components/TournamentList";
import { useTranslations } from "next-intl";
import {
    Trophy,
    Plus,
    Sparkles,
    LayoutGrid,
    List,
    Filter,
    Search,
    Users,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import QuickSetupWizard from "@/components/QuickSetupWizard";
import { useAuth, UserRole } from "@/sections/tournaments/auth-context";

export default function TournamentsPage() {
    const t = useTranslations('MyTournaments');
    const tTr = useTranslations('Tournaments');
    const { user } = useAuth();
    const [showWizard, setShowWizard] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const canManage = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.TOURNAMENT_ADMIN;

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

            {/* Quick Actions / Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-border shadow-card overflow-hidden group hover:shadow-elevated transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Trophy className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="eyebrow text-[10px] text-muted-foreground">{t('myTournaments')}</p>
                                <p className="text-2xl font-black text-foreground">--</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border shadow-card overflow-hidden group hover:shadow-elevated transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="eyebrow text-[10px] text-muted-foreground">{t('totalTeams')}</p>
                                <p className="text-2xl font-black text-foreground">--</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border shadow-card overflow-hidden group hover:shadow-elevated transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="eyebrow text-[10px] text-muted-foreground">{t('currentPlan')}</p>
                                <p className="text-2xl font-black text-foreground capitalize">{user?.plan || 'Free'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Toolbar section */}
            <div className="flex items-center justify-between border-b border-border pb-4 gap-4 flex-wrap">
                <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-white shadow-card rounded-md text-brand-600">
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
                        <List className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="h-9 gap-2 text-muted-foreground border-border font-semibold">
                        <Filter className="h-3.5 w-3.5" /> {t('filter')}
                    </Button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            className="h-9 pl-9 pr-4 bg-white border border-border rounded-lg text-sm focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 outline-none w-64"
                        />
                    </div>
                </div>
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
