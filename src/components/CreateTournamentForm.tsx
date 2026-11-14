'use client';

import React, { ChangeEvent, FormEvent, useState } from 'react';
import { Tournament } from "../modules/tournament/domain/tournament";
import { useTournamentContext } from '@/sections/tournaments/tournaments-context';
import { useAuth, UserRole } from '@/sections/tournaments/auth-context';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CalendarDays, MapPin, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

interface CreateTournamentFormProps {
    onCreated?: () => void;
}

const CreateTournamentForm: React.FC<CreateTournamentFormProps> = ({ onCreated }) => {
    const t = useTranslations('CreateTournamentForm');
    const { createTournament } = useTournamentContext();
    const { user, isAuthenticated } = useAuth();
    const [tournament, setTournament] = useState<Tournament>({
        id: '',
        name: '',
        startDate: '',
        endDate: '',
        location: '',
    });

    const isAdmin = isAuthenticated && (user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.TOURNAMENT_ADMIN);

    if (!isAdmin) return null;

    function handleChange(event: ChangeEvent<HTMLInputElement>): void {
        const { name, value } = event.target;

        setTournament((prevTournament) => ({
            ...prevTournament,
            [name]: value,
        }));
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        createTournament({ ...tournament, id: crypto.randomUUID() })
            .then(() => {
                setTournament({
                    id: '',
                    name: '',
                    startDate: '',
                    endDate: '',
                    location: '',
                });
                if (onCreated) onCreated();
            })
            .catch((error) => {
                console.error("Tournament creation failed", error);
            });
    }

    const inputClass = "h-11 rounded-lg";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-black text-muted-foreground uppercase tracking-wider">{t('name')}</Label>
                <Input
                    id="name"
                    type="text"
                    name="name"
                    value={tournament.name}
                    onChange={handleChange}
                    required
                    placeholder={t('namePlaceholder')}
                    className={inputClass}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="startDate" className="flex items-center gap-1.5 text-xs font-black text-muted-foreground uppercase tracking-wider">
                        <CalendarDays className="h-3.5 w-3.5 text-brand-600" />
                        {t('startDate')}
                    </Label>
                    <Input
                        id="startDate"
                        type="date"
                        name="startDate"
                        onChange={handleChange}
                        value={tournament.startDate as string}
                        max={tournament.endDate ? (tournament.endDate as string) : undefined}
                        required
                        className={inputClass}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="endDate" className="flex items-center gap-1.5 text-xs font-black text-muted-foreground uppercase tracking-wider">
                        <CalendarDays className="h-3.5 w-3.5 text-brand-600" />
                        {t('endDate')}
                    </Label>
                    <Input
                        id="endDate"
                        type="date"
                        name="endDate"
                        onChange={handleChange}
                        value={tournament.endDate as string}
                        min={tournament.startDate ? (tournament.startDate as string) : undefined}
                        required
                        className={inputClass}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-1.5 text-xs font-black text-muted-foreground uppercase tracking-wider">
                    <MapPin className="h-3.5 w-3.5 text-brand-600" />
                    {t('location')}
                </Label>
                <Input
                    id="location"
                    type="text"
                    name="location"
                    value={tournament.location}
                    onChange={handleChange}
                    required
                    placeholder={t('locationPlaceholder')}
                    className={inputClass}
                />
            </div>

            <Button type="submit" className="w-full h-12 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-glow transition-all active:scale-95">
                <Trophy className="h-4 w-4" />
                {t('submit')}
            </Button>
        </form>
    );
};

export default CreateTournamentForm;
