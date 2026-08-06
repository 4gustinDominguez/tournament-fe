'use client';

import React, { useMemo } from 'react';
import { Link, usePathname } from '@/navigation';
import { cn } from '@/lib/utils';
import {
    Trophy,
    ShieldCheck,
    Settings,
    HelpCircle,
    ChevronRight,
    type LucideIcon
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth, UserRole } from '@/sections/tournaments/auth-context';

interface SidebarProps {
    className?: string;
    onNavigate?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ className, onNavigate }) => {
    const pathname = usePathname();
    const t = useTranslations('Menu');
    const tDash = useTranslations('Dashboard');
    const { user, isAuthenticated } = useAuth();

    const navItems = useMemo(() => {
        const items: { href: string; label: string; icon: LucideIcon }[] = [];

        if (!isAuthenticated || !user) return items;

        const isAdmin =
            user.role === UserRole.SUPER_ADMIN ||
            user.role === UserRole.TOURNAMENT_ADMIN;

        if (isAdmin) {
            items.push({
                href: '/manage/my-tournaments',
                label: t('myTournaments'),
                icon: Trophy,
            });
        }

        if (user.role === UserRole.REFEREE) {
            items.push({
                href: '/manage/referee',
                label: t('referee'),
                icon: ShieldCheck,
            });
        }

        return items;
    }, [isAuthenticated, user, t]);

    const isActive = (href: string) =>
        pathname === href || pathname.startsWith(`${href}/`);

    return (
        <aside className={cn("flex flex-col w-64 border-r border-border bg-white h-screen sticky top-0", className)}>
            <div className="px-5 py-6 flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center shadow-glow">
                    <Trophy className="h-5 w-5" />
                </div>
                <div className="flex flex-col leading-none">
                    <span className="font-display text-2xl font-black tracking-tight text-foreground">GTM</span>
                    <span className="eyebrow text-[10px] text-muted-foreground mt-1">{t('tagline')}</span>
                </div>
            </div>

            <nav className="flex-1 px-3 py-2 space-y-1">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 relative group",
                                active
                                    ? "bg-brand-50 text-brand-700 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-6 before:w-1 before:rounded-r-full before:bg-brand-500"
                                    : "text-muted-foreground hover:bg-neutral-50 hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5 shrink-0", active ? "text-brand-600" : "text-neutral-400 group-hover:text-foreground")} />
                            {item.label}
                            {active && (
                                <ChevronRight className="h-4 w-4 ml-auto text-brand-400" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-3 border-t border-border space-y-1">
                <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-muted-foreground hover:bg-neutral-50 hover:text-foreground transition-all">
                    <Settings className="h-5 w-5 text-neutral-400" />
                    {tDash('settings')}
                </button>
                <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-muted-foreground hover:bg-neutral-50 hover:text-foreground transition-all">
                    <HelpCircle className="h-5 w-5 text-neutral-400" />
                    {tDash('help')}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
