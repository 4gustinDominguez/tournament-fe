'use client';
import React, { useState } from 'react';
import { useTournamentContext } from "@/sections/tournaments/tournaments-context";
import { Round } from "@/modules/tournament/domain/round";
import { useTranslations } from "next-intl";
import { notify } from "@/lib/notify";

interface CreateRoundFormProps {
    tournamentId: string;
}

const CreateRoundForm: React.FC<CreateRoundFormProps> = ({ tournamentId }) => {
    const t = useTranslations('CreateRoundForm');
    const tCommon = useTranslations('Common');
    const { createRound } = useTournamentContext();
    const [name, setName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createRound({
                tournamentId,
                round: {
                    id: "", // Will be assigned by backend
                    name,
                    tournamentId,
                }
            });
            setName("");
            setIsCreating(false);
            notify.success(t("success"));
        } catch (error) {
            console.error("Error creating round:", error);
            notify.error(t("error"));
        }
    };

    if (!isCreating) {
        return (
            <button
                onClick={() => setIsCreating(true)}
                className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
                {t('newRound')}
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white rounded-lg shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('newRound')}</h3>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('name')}</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    placeholder={t('namePlaceholder')}
                />
            </div>
            <div className="flex gap-2">
                <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                    {t('create')}
                </button>
                <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                    {tCommon('cancel')}
                </button>
            </div>
        </form>
    );
};

export default CreateRoundForm;
