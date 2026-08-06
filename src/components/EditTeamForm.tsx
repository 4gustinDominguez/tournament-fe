'use client';
import React, { ChangeEvent, FormEvent, useState, useEffect } from 'react';
import { Team } from '@/modules/tournament/domain/team';
import { useTournamentContext } from '@/sections/tournaments/tournaments-context';
import { useTranslations } from 'next-intl';

interface EditTeamFormProps {
    team: Team;
    tournamentId: string;
    onSuccess?: () => void;
}

const EditTeamForm: React.FC<EditTeamFormProps> = ({ team, tournamentId, onSuccess }) => {
    const t = useTranslations('EditTeamForm');
    const { updateTeam, places, getPlaces } = useTournamentContext();
    const [formData, setFormData] = useState<Team>(team);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        getPlaces(tournamentId);
    }, [tournamentId, getPlaces]);

    function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        setSubmitting(true);

        try {
            await updateTeam({ tournamentId, team: formData });
            alert(t('success'));
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error updating team:', error);
            alert(t('error'));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="display-title text-xl text-foreground tracking-tight mb-4">{t('title')}</h3>

            <label className="block mb-4">
                <span className="text-sm font-semibold text-foreground">{t('name')}</span>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="border border-input rounded-lg px-3 py-2 mt-1 w-full bg-white text-foreground focus:ring-2 focus:ring-ring outline-none"
                />
            </label>

            <label className="block mb-4">
                <span className="text-sm font-semibold text-foreground">{t('coach')}</span>
                <input
                    type="text"
                    name="coach"
                    value={formData.coach || ''}
                    onChange={handleChange}
                    placeholder={t('coachPlaceholder')}
                    className="border border-input rounded-lg px-3 py-2 mt-1 w-full bg-white text-foreground focus:ring-2 focus:ring-ring outline-none"
                />
            </label>

            <label className="block mb-4">
                <span className="text-sm font-semibold text-foreground">{t('crestUrl')}</span>
                <input
                    type="url"
                    name="crestUrl"
                    value={formData.crestUrl || ''}
                    onChange={handleChange}
                    placeholder={t('crestPlaceholder')}
                    className="border border-input rounded-lg px-3 py-2 mt-1 w-full bg-white text-foreground focus:ring-2 focus:ring-ring outline-none"
                />
            </label>

            <label className="block mb-4">
                <span className="text-sm font-semibold text-foreground">{t('kitColor')}</span>
                <div className="flex gap-2">
                    <input
                        type="color"
                        name="kitColor"
                        value={formData.kitColor || '#000000'}
                        onChange={handleChange}
                        className="h-10 w-16 border border-input rounded-md cursor-pointer bg-white"
                    />
                    <input
                        type="text"
                        name="kitColor"
                        value={formData.kitColor || ''}
                        onChange={handleChange}
                        placeholder="#000000"
                        className="flex-1 border border-input rounded-lg px-3 py-2 bg-white text-foreground focus:ring-2 focus:ring-ring outline-none"
                    />
                </div>
            </label>

            <label className="block mb-4">
                <span className="text-sm font-semibold text-foreground">{t('venue')}</span>
                <select
                    name="placeId"
                    value={formData.placeId || ''}
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

            <button
                type="submit"
                disabled={submitting}
                className={`w-full py-2.5 px-4 rounded-lg text-white font-bold transition duration-200 shadow-card ${submitting
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : 'bg-brand-600 hover:bg-brand-700'
                    }`}
            >
                {submitting ? t('saving') : t('save')}
            </button>
        </form>
    );
};

export default EditTeamForm;
