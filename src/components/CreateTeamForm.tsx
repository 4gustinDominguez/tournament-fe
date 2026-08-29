'use client';

import { Team } from '@/modules/tournament/domain/team';
import { useTournamentContext } from '@/sections/tournaments/tournaments-context';
import { notify } from '@/lib/notify';
import React, { ChangeEvent, FormEvent, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

const CreateTeamForm: React.FC<{ tournamentId?: string }> = ({ tournamentId }) => {
    const t = useTranslations('CreateTeamForm');
    const { tournaments, createTeam, places, getPlaces } = useTournamentContext();

    const [team, setTeam] = useState<Team>({
        id: '',
        name: '',
        tournaments: tournamentId ? [tournamentId] : [],
        placeId: '',
    });

    useEffect(() => {
        if (tournamentId) {
            getPlaces(tournamentId);
        }
    }, [tournamentId, getPlaces]);

    useEffect(() => {
        if (tournamentId) {
            setTeam(prev => ({ ...prev, tournaments: [tournamentId] }));
        }
    }, [tournamentId]);

    function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
        const { name, value } = event.target;

        setTeam((prevTeam) => ({
            ...prevTeam,
            [name]: value,
        }));
    }

    function handleSelectChange(event: ChangeEvent<HTMLSelectElement>): void {
        const selectedOptions = Array.from(event.target.options)
            .filter(option => option.selected)
            .map(option => option.value);

        setTeam((prevTeam) => ({
            ...prevTeam,
            tournaments: selectedOptions,
        }));
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        const targetTournamentId = tournamentId || team.tournaments[0];

        if (!targetTournamentId) {
            notify.warning(t("selectTournamentAlert"));
            return;
        }

        notify.promise(
            createTeam({ tournamentId: targetTournamentId, team: { ...team, id: crypto.randomUUID() } }),
            {
                loading: t("creating"),
                success: t("success"),
                error: (err) => err instanceof Error ? err.message : t("error"),
            },
        )
            .then(() => {
                setTeam(prev => ({
                    ...prev,
                    id: '',
                    name: '',
                    placeId: '',
                }));
            })
            .catch(() => {});
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-card border border-border">
            <h2 className="display-title text-xl text-foreground tracking-tight mb-4">{t('title')}</h2>
            <label className="block mb-4">
                <span className="text-sm font-semibold text-foreground">{t('name')}</span>
                <input
                    type="text"
                    name="name"
                    value={team.name}
                    onChange={handleChange}
                    required
                    className="border border-input rounded-lg px-3 py-2 mt-1 w-full bg-white text-foreground focus:ring-2 focus:ring-ring outline-none"
                    placeholder={t('namePlaceholder')}
                />
            </label>

            <label className="block mb-4">
                <span className="text-sm font-semibold text-foreground">{t('venue')}</span>
                <select
                    name="placeId"
                    value={team.placeId}
                    onChange={handleChange}
                    className="border border-input rounded-lg px-3 py-2 mt-1 w-full bg-white text-foreground focus:ring-2 focus:ring-ring outline-none"
                >
                    <option value="">{t('selectPlace')}</option>
                    {places.map((place) => (
                        <option key={place.id} value={place.id}>
                            {place.name}
                        </option>
                    ))}
                </select>
            </label>

            {!tournamentId && (
                <label className="block mb-4">
                    <span className="text-sm font-semibold text-foreground">{t('tournaments')}</span>
                    <select
                        multiple
                        name="tournament"
                        onChange={handleSelectChange}
                        className="bg-neutral-50 border border-input text-foreground text-sm rounded-lg focus:ring-2 focus:ring-ring block w-full p-2.5"
                    >
                        {tournaments.map((tournament) => (
                            <option key={tournament.id} value={tournament.id}>
                                {tournament.name}
                            </option>
                        ))}
                    </select>
                </label>
            )}

            <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 shadow-card">
                {t('submit')}
            </button>
        </form>
    );
};

export default CreateTeamForm;