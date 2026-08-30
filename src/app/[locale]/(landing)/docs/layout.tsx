'use client';

import React from 'react';
import DocsSidebar from '@/components/DocsSidebar';
import { useRouter, usePathname } from '@/navigation';
import { useTranslations } from 'next-intl';

const navItems = [
    { href: '/docs', key: 'index' },
    { href: '/docs/tournaments', key: 'tournaments' },
    { href: '/docs/teams', key: 'teams' },
    { href: '/docs/matches', key: 'matches' },
    { href: '/docs/players', key: 'players' },
] as const;

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const t = useTranslations('Docs.nav');
    const router = useRouter();
    const pathname = usePathname();

    const currentHref = navItems.find(
        (item) => item.href === pathname || pathname.startsWith(`${item.href}/`)
    )?.href ?? '/docs';

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="md:hidden mb-6">
                <label className="block text-xs font-semibold text-night-400 mb-2 uppercase tracking-wider">
                    {t('title')}
                </label>
                <select
                    value={currentHref}
                    onChange={(e) => router.push(e.target.value)}
                    className="w-full appearance-none bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-night-100 focus:outline-none focus:ring-2 focus:ring-brand-400/50"
                >
                    {navItems.map((item) => (
                        <option key={item.href} value={item.href} className="bg-night-800 text-night-100">
                            {t(item.key)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex gap-8 items-start">
                <DocsSidebar className="hidden md:flex" />
                <div className="flex-1 min-w-0">
                    {children}
                </div>
            </div>
        </div>
    );
}
