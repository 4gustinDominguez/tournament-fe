'use client';

import React from 'react';
import { Link, usePathname } from '@/navigation';
import { cn } from '@/lib/utils';
import {
    BookOpen,
    Trophy,
    Users,
    Swords,
    UserCircle,
    ChevronRight,
    type LucideIcon
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface DocsSidebarProps {
    className?: string;
    onNavigate?: () => void;
}

const navItems: { href: string; key: string; icon: LucideIcon }[] = [
    { href: '/docs', key: 'index', icon: BookOpen },
    { href: '/docs/tournaments', key: 'tournaments', icon: Trophy },
    { href: '/docs/teams', key: 'teams', icon: Users },
    { href: '/docs/matches', key: 'matches', icon: Swords },
    { href: '/docs/players', key: 'players', icon: UserCircle },
];

const DocsSidebar: React.FC<DocsSidebarProps> = ({ className, onNavigate }) => {
    const pathname = usePathname();
    const t = useTranslations('Docs.nav');

    const isActive = (href: string) =>
        pathname === href || pathname.startsWith(`${href}/`);

    return (
        <aside
            className={cn(
                "flex flex-col w-64 shrink-0 border border-white/10 bg-white/[0.04] rounded-2xl sticky top-24 h-fit",
                className
            )}
        >
            <div className="px-5 py-4 border-b border-white/10">
                <span className="font-display text-lg font-bold text-night-100">
                    {t('title')}
                </span>
            </div>

            <nav className="flex-1 p-3 space-y-1">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative group",
                                active
                                    ? "bg-brand-50/10 text-brand-400 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-6 before:w-1 before:rounded-r-full before:bg-brand-400"
                                    : "text-night-300 hover:bg-white/[0.06] hover:text-night-100"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "h-5 w-5 shrink-0",
                                    active ? "text-brand-400" : "text-night-400 group-hover:text-night-200"
                                )}
                            />
                            {t(item.key)}
                            {active && (
                                <ChevronRight className="h-4 w-4 ml-auto text-brand-400/60" />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
};

export default DocsSidebar;
