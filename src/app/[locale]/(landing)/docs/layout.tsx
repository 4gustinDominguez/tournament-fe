'use client';

import React, { useState } from 'react';
import DocsSidebar from '@/components/DocsSidebar';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const t = useTranslations('Docs.nav');

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="flex items-center justify-between md:hidden mb-6">
                <h2 className="font-display text-xl font-bold text-night-100">
                    {t('title')}
                </h2>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="h-10 w-10 rounded-xl bg-white/[0.06] border border-white/10 grid place-items-center text-night-200 hover:bg-white/[0.1] transition-colors"
                    aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
                >
                    {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            <div className="flex gap-8 items-start">
                <DocsSidebar
                    className={sidebarOpen ? 'flex' : 'hidden md:flex'}
                    onNavigate={() => setSidebarOpen(false)}
                />
                <div className="flex-1 min-w-0">
                    {children}
                </div>
            </div>
        </div>
    );
}
