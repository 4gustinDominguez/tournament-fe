'use client';

import React, { useState } from 'react';
import {
    Bell,
    Search,
    Menu as MenuIcon,
    LogOut,
    User as UserIcon,
    Shield
} from 'lucide-react';
import { useAuth } from '@/sections/tournaments/auth-context';
import { useTranslations } from 'next-intl';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import Sidebar from './Sidebar';

const DashboardHeader = () => {
    const { user, logout } = useAuth();
    const t = useTranslations('Menu');
    const tDash = useTranslations('Dashboard');
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    return (
        <header className="h-16 border-b border-border bg-white/90 backdrop-blur sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground">
                            <MenuIcon className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64">
                        <Sidebar
                            className="w-full h-full border-none"
                            onNavigate={() => setMobileNavOpen(false)}
                        />
                    </SheetContent>
                </Sheet>

                <div className="hidden md:flex items-center gap-2 bg-neutral-50 border border-border rounded-lg px-3 h-10 w-64 transition-all focus-within:ring-2 focus-within:ring-brand-500/30 focus-within:border-brand-500">
                    <Search className="h-4 w-4 text-neutral-400 shrink-0" />
                    <input
                        type="text"
                        placeholder={tDash('searchPlaceholder')}
                        className="bg-transparent border-none text-sm focus:ring-0 placeholder:text-neutral-400 w-full outline-none"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4 shrink-0">
                <Button variant="ghost" size="icon" className="text-muted-foreground relative hover:bg-neutral-50">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white"></span>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="p-1 h-auto rounded-full hover:bg-neutral-50">
                            <div className="flex items-center gap-3 pr-2">
                                <Avatar className="h-9 w-9 border border-border shadow-sm">
                                    <AvatarImage src={user?.avatarUrl} />
                                    <AvatarFallback className="bg-brand-500 text-white font-display font-bold text-sm">
                                        {user?.firstName?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden lg:flex flex-col items-start leading-none">
                                    <span className="text-sm font-bold text-foreground">
                                        {user?.firstName} {user?.lastName}
                                    </span>
                                    <span className="eyebrow text-[10px] text-muted-foreground mt-1">
                                        {user?.role?.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-xl mt-1 shadow-elevated border-border">
                        <DropdownMenuLabel className="font-bold">{tDash('myAccount')}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="py-2.5 cursor-pointer">
                            <UserIcon className="mr-2 h-4 w-4" />
                            <span>{tDash('profile')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="py-2.5 cursor-pointer">
                            <Shield className="mr-2 h-4 w-4" />
                            <span>{tDash('privacy')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className="py-2.5 text-destructive focus:text-destructive cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>{t('logout')}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};

export default DashboardHeader;
