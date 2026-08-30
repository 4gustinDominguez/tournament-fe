'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { CircleDot } from 'lucide-react';

export default function DocsMatchesPage() {
    const t = useTranslations('Docs.matches');

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
                    {t('score.title')}
                </h2>
                <p className="text-sm text-night-300 leading-relaxed max-w-2xl">
                    {t('score.description')}
                </p>

                <div className="space-y-4">
                    {(['step1', 'step2', 'step3'] as const).map((step, i) => (
                        <Card
                            key={step}
                            className="bg-white/[0.04] border-white/10 p-6 rounded-2xl"
                        >
                            <div className="flex items-start gap-4">
                                <span className="h-8 w-8 rounded-lg bg-brand-50/10 grid place-items-center shrink-0 text-sm font-bold text-brand-400">
                                    {i + 1}
                                </span>
                                <div className="space-y-1">
                                    <h3 className="font-display text-base font-bold text-night-50">
                                        {t(`score.${step}.title`)}
                                    </h3>
                                    <p className="text-sm text-night-300 leading-relaxed">
                                        {t(`score.${step}.text`)}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="display-title text-2xl text-night-100">
                    {t('view.title')}
                </h2>
                <p className="text-sm text-night-300 leading-relaxed max-w-2xl">
                    {t('view.description')}
                </p>
                <Card className="bg-white/[0.04] border-white/10 p-5 rounded-2xl">
                    <div className="flex items-start gap-3">
                        <CircleDot className="h-4 w-4 text-brand-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-night-200 leading-relaxed">
                            {t('view.public')}
                        </p>
                    </div>
                </Card>
            </section>

            <section className="space-y-4">
                <h2 className="display-title text-2xl text-night-100">
                    {t('incidents.title')}
                </h2>
                <p className="text-sm text-night-300 leading-relaxed max-w-2xl">
                    {t('incidents.description')}
                </p>
                <Card className="bg-brand-50/5 border-brand-500/20 p-5 rounded-2xl">
                    <p className="text-sm text-brand-200 leading-relaxed">
                        {t('incidents.tip')}
                    </p>
                </Card>
            </section>
        </div>
    );
}
