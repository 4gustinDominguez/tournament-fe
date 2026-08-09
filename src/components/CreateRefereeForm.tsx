'use client';

import React, { useState } from 'react';
import { useTournamentContext } from '@/sections/tournaments/tournaments-context';
import { Referee } from '@/modules/referees/domain/referee';
import { useTranslations } from 'next-intl';
import { PhotoUpload } from '@/components/PhotoUpload';

interface CreateRefereeFormProps {
    tournamentId: string;
}

const CreateRefereeForm: React.FC<CreateRefereeFormProps> = ({ tournamentId }) => {
    const t = useTranslations('CreateRefereeForm');
    const { createReferee } = useTournamentContext();
    const [name, setName] = useState('');
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            const newReferee: Referee = {
                id: crypto.randomUUID(),
                name: name.trim(),
                tournamentIds: [tournamentId],
                photoUrl: photoUrl || undefined,
            };
            await createReferee({ tournamentId, referee: newReferee });
            setName('');
        } catch (error) {
            console.error("Error creating referee:", error);
            alert(t("error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-3">{t('title')}</h3>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('namePlaceholder')}
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                    required
                />
                <button
                    type="submit"
                    disabled={loading || !name}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
                >
                    {loading ? t('adding') : t('add')}
                </button>
            </div>
            <div className="mt-3">
                <PhotoUpload
                    value={photoUrl || undefined}
                    onChange={setPhotoUrl}
                    folder="referees"
                />
            </div>
        </form>
    );
};

export default CreateRefereeForm;
