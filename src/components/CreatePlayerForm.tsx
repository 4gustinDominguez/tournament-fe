'use client';

import { Player } from '@/modules/tournament/domain/player';
import { useTournamentContext } from '@/sections/tournaments/tournaments-context';
import { notify } from '@/lib/notify';
import React, { ChangeEvent, FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import { PhotoUpload } from '@/components/PhotoUpload';

const CreatePlayerForm: React.FC<{ teamId: string, tournamentId?: string }> = ({ teamId, tournamentId }) => {
    const t = useTranslations('CreatePlayerForm');
    const { createPlayer } = useTournamentContext();
    const [loading, setLoading] = useState(false);

    const [player, setPlayer] = useState<Partial<Player>>({
        name: '',
        nickname: '',
        position: '',
        photoUrl: '',
    });

    function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
        const { name, value } = event.target;

        setPlayer((prevPlayer) => ({
            ...prevPlayer,
            [name]: value,
        }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();

        if (!player.name || !player.nickname) {
            notify.warning(t("alertRequired"));
            return;
        }

        setLoading(true);
        try {
            const newPlayer = {
                ...player,
                id: crypto.randomUUID(),
                tournaments: tournamentId ? [tournamentId] : [],
            } as Player;

            await createPlayer({ teamId, player: newPlayer, tournamentId });

            notify.success(t("success"));
            setPlayer({
                name: '',
                nickname: '',
                position: '',
                photoUrl: '',
            });
        } catch (error) {
            console.error("Could not create player", error);
            notify.error(error instanceof Error ? error.message : t("alertError"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-card border border-border space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">👤</span>
                <h3 className="display-title text-xl text-foreground tracking-tight">{t('title')}</h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase ml-1">{t('fullName')}</label>
                    <input
                        type="text"
                        name="name"
                        value={player.name}
                        onChange={handleChange}
                        placeholder={t('namePlaceholder')}
                        className="w-full border border-input rounded-xl px-4 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring transition-all bg-white"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-muted-foreground uppercase ml-1">{t('nickname')}</label>
                        <input
                            type="text"
                            name="nickname"
                            value={player.nickname}
                            onChange={handleChange}
                            placeholder={t('nicknamePlaceholder')}
                            className="w-full border border-input rounded-xl px-4 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring transition-all bg-white"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-muted-foreground uppercase ml-1">{t('position')}</label>
                        <select
                            name="position"
                            value={player.position}
                            onChange={handleChange}
                            className="w-full border border-input rounded-xl px-4 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring transition-all bg-white appearance-none"
                        >
                            <option value="">{t('position')}</option>
                            <option value="Goalkeeper">{t('goalkeeper')}</option>
                            <option value="Defender">{t('defender')}</option>
                            <option value="Midfielder">{t('midfielder')}</option>
                            <option value="Forward">{t('forward')}</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase ml-1">{t('photoUrl')}</label>
                    <PhotoUpload
                        value={player.photoUrl || undefined}
                        onChange={(url) => setPlayer({ ...player, photoUrl: (typeof url === "string" ? url : "") || '' })}
                        folder="players"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className={`w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold py-3 rounded-xl shadow-card transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {loading ? (
                    <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        {t('adding')}
                    </>
                ) : (
                    <>
                        <span>{t('addToTeam')}</span>
                        <span className="text-lg">＋</span>
                    </>
                )}
            </button>
        </form>
    );
};

export default CreatePlayerForm;
