'use client';

import React from 'react';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { Trophy, Users, Swords, UserCircle, ArrowRight } from 'lucide-react';

const sections = [
    {
        key: 'tournaments',
        icon: Trophy,
        href: '/docs/tournaments',
    },
    {
        key: 'teams',
        icon: Users,
        href: '/docs/teams',
    },
    {
        key: 'matches',
        icon: Swords,
        href: '/docs/matches',
    },
    {
        key: 'players',
        icon: UserCircle,
        href: '/docs/players',
    },
] as const;

export default function DocsIndexPage() {
    const t = useTranslations('Docs.index');

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sections.map((section) => (
                    <Link
                        key={section.key}
                        href={section.href}
                        className="group flex items-start gap-4 p-6 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.07] hover:border-white/[0.15] transition-all duration-200"
                    >
                        <span className="h-10 w-10 rounded-xl bg-brand-50/10 grid place-items-center shrink-0 group-hover:bg-brand-50/15 transition-colors">
                            <section.icon className="h-5 w-5 text-brand-400" />
                        </span>
                        <div className="flex-1 min-w-0 space-y-1">
                            <h3 className="font-display text-lg font-bold text-night-50 group-hover:text-brand-300 transition-colors">
                                {t(`${section.key}.title`)}
                            </h3>
                            <p className="text-sm text-night-300 leading-relaxed">
                                {t(`${section.key}.description`)}
                            </p>
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 mt-2">
                                {t(`${section.key}.link`)}
                                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
