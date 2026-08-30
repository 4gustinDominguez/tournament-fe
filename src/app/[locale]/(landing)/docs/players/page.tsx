'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { CircleDot } from 'lucide-react';

export default function DocsPlayersPage() {
    const t = useTranslations('Docs.players');

    return (
        <div className="space-y-8">
            <header className="space-y-2">
                <h1 className="display-title text-3xl md:text-4xl text-night-50">
                    {t('title')}
                </h1>
                <p className="text-sm text-night-300 font-medium max-w-2xl">
                    {t('subtitle')}
                </p>
            </header>

            <section className="space-y-4">
                <h2 className="display-title text-2xl text-night-100">
                    {t('dashboard.title')}
                </h2>
                <p className="text-sm text-night-300 leading-relaxed max-w-2xl">
                    {t('dashboard.description')}
                </p>

                <div className="space-y-3">
                    {(['stats', 'teams', 'matches'] as const).map((item) => (
                        <Card
                            key={item}
                            className="bg-white/[0.04] border-white/10 p-5 rounded-2xl"
                        >
                            <div className="flex items-start gap-3">
                                <CircleDot className="h-4 w-4 text-brand-400 mt-0.5 shrink-0" />
                                <p className="text-sm text-night-200 leading-relaxed">
                                    {t(`dashboard.${item}`)}
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="display-title text-2xl text-night-100">
                    {t('profile.title')}
                </h2>
                <p className="text-sm text-night-300 leading-relaxed max-w-2xl">
                    {t('profile.description')}
                </p>
                <Card className="bg-brand-50/5 border-brand-500/20 p-5 rounded-2xl">
                    <p className="text-sm text-brand-200 leading-relaxed">
                        {t('profile.tip')}
                    </p>
                </Card>
            </section>

            <section className="space-y-4">
                <h2 className="display-title text-2xl text-night-100">
                    {t('stats.title')}
                </h2>
                <p className="text-sm text-night-300 leading-relaxed max-w-2xl">
                    {t('stats.description')}
                </p>
                <Card className="bg-white/[0.04] border-white/10 p-5 rounded-2xl">
                    <div className="flex items-start gap-3">
                        <CircleDot className="h-4 w-4 text-brand-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-night-200 leading-relaxed">
                            {t('stats.metrics')}
                        </p>
                    </div>
                </Card>
            </section>

            <section className="space-y-4">
                <h2 className="display-title text-2xl text-night-100">
                    {t('matches.title')}
                </h2>
                <p className="text-sm text-night-300 leading-relaxed max-w-2xl">
                    {t('matches.description')}
                </p>
                <Card className="bg-white/[0.04] border-white/10 p-5 rounded-2xl">
                    <div className="flex items-start gap-3">
                        <CircleDot className="h-4 w-4 text-brand-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-night-200 leading-relaxed">
                            {t('matches.detail')}
                        </p>
                    </div>
                </Card>
            </section>
        </div>
    );
}
