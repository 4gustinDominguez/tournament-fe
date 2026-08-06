'use client';

import { useTournamentContext } from '@/sections/tournaments/tournaments-context';
import React, { useState, useEffect } from 'react';
import { Match } from '@/modules/tournament/domain/match';
import IncidentEditor from './IncidentEditor';
import { CalendarDays, Radio, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface MatchFormProps {
    tournamentId: string;
    roundId?: string;
    initialValues?: Match;
    onSubmit?: () => void;
    title?: string;
    submitLabel?: string;
}

const MatchForm: React.FC<MatchFormProps> = ({
    tournamentId,
    roundId,
    initialValues,
    onSubmit,
    title,
    submitLabel,
}) => {
    const t = useTranslations('MatchForm');
    const tCommon = useTranslations('Common');
    const { teams, getTeams, createMatch, updateMatch, places, getPlaces, referees, getReferees } = useTournamentContext();
    const [match, setMatch] = useState<Partial<Match>>({
        teamAId: '',
        teamBId: '',
        date: new Date(),
        placeId: '',
        refereeId: '',
        status: 'scheduled',
        result: null,
        incidents: [],
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getTeams(tournamentId);
        getPlaces(tournamentId);
        getReferees(tournamentId);
    }, [tournamentId, getTeams, getPlaces, getReferees]);

    useEffect(() => {
        if (initialValues) {
            setMatch({
                teamAId: initialValues.teamAId,
                teamBId: initialValues.teamBId,
                date: new Date(initialValues.date),
                placeId: initialValues.placeId || '',
                refereeId: initialValues.refereeId || '',
                status: initialValues.status || 'scheduled',
                result: initialValues.result || null,
                incidents: initialValues.incidents || [],
            });
        }
    }, [initialValues]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!match.teamAId || !match.teamBId || match.teamAId === match.teamBId) {
            alert(t("sameTeamsAlert"));
            return;
        }

        setLoading(true);
        try {
            if (initialValues) {
                // Update mode
                const updatedMatch: Match = {
                    ...initialValues,
                    teamAId: match.teamAId!,
                    teamBId: match.teamBId!,
                    date: match.date || new Date(),
                    placeId: match.placeId,
                    refereeId: match.refereeId,
                    status: match.status as any || 'scheduled',
                    result: match.result || null,
                    incidents: match.incidents || [],
                    // roundId preserved
                };
                await updateMatch(updatedMatch);
            } else {
                if (!roundId) {
                    alert(t("noRoundAlert"));
                    setLoading(false);
                    return;
                }
                // Create mode
                const newMatch: Match = {
                    id: crypto.randomUUID(),
                    tournamentId,
                    roundId,
                    teamAId: match.teamAId!,
                    teamBId: match.teamBId!,
                    date: match.date || new Date(),
                    placeId: match.placeId === '' ? undefined : match.placeId,
                    refereeId: match.refereeId === '' ? undefined : match.refereeId,
                    status: 'scheduled',
                    result: null,
                    incidents: [],
                };
                await createMatch({ tournamentId, match: newMatch });
            }

            if (onSubmit) {
                onSubmit();
            }

            if (!initialValues) {
                // Reset form only in create mode
                // Don't reset roundId as it comes from props
                setMatch({
                    teamAId: '',
                    teamBId: '',
                    date: new Date(),
                    placeId: '',
                    refereeId: '',
                    status: 'scheduled',
                    result: null,
                    incidents: [],
                });
            }
        } catch (error) {
            console.error("Error saving match:", error);
            alert(t("saveError"));
        } finally {
            setLoading(false);
        }
    };

    const fieldClass = "w-full rounded-md border border-input bg-white px-3 py-2.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors";
    const labelClass = "block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1.5";

    const statusConfig: Record<string, { label: string; Icon: typeof Radio }> = {
        scheduled: { label: tCommon('status.scheduled'), Icon: CalendarDays },
        live: { label: tCommon('status.live'), Icon: Radio },
        completed: { label: tCommon('status.completed'), Icon: CheckCircle2 },
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-border shadow-card">
            {title == null ? (
                <h3 className="display-title text-2xl text-foreground tracking-tight mb-6">{t('defaultTitle')}</h3>
            ) : title ? (
                <h3 className="display-title text-2xl text-foreground tracking-tight mb-6">{title}</h3>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className={labelClass}>{t('teamA')}</label>
                    <select
                        value={match.teamAId}
                        onChange={(e) => setMatch({ ...match, teamAId: e.target.value })}
                        className={fieldClass}
                        required
                    >
                        <option value="">{t('selectTeam')}</option>
                        {teams.map(team => (
                            <option key={team.id} value={team.id}>{team.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className={labelClass}>{t('teamB')}</label>
                    <select
                        value={match.teamBId}
                        onChange={(e) => setMatch({ ...match, teamBId: e.target.value })}
                        className={fieldClass}
                        required
                    >
                        <option value="">{t('selectTeam')}</option>
                        {teams.map(team => (
                            <option key={team.id} value={team.id}>{team.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="mb-4">
                <label className={labelClass}>{t('venue')}</label>
                <select
                    value={match.placeId}
                    onChange={(e) => setMatch({ ...match, placeId: e.target.value })}
                    className={fieldClass}
                >
                    <option value="">{t('selectPlace')}</option>
                    {places.map(place => (
                        <option key={place.id} value={place.id}>{place.name}</option>
                    ))}
                </select>
            </div>

            <div className="mb-4">
                <label className={labelClass}>{t('referee')}</label>
                <select
                    value={match.refereeId}
                    onChange={(e) => setMatch({ ...match, refereeId: e.target.value })}
                    className={fieldClass}
                >
                    <option value="">{t('selectReferee')}</option>
                    {referees.map(referee => (
                        <option key={referee.id} value={referee.id}>{referee.name}</option>
                    ))}
                </select>
            </div>

            <div className="mb-4">
                <label className={labelClass}>{t('dateTime')}</label>
                <input
                    type="datetime-local"
                    value={match.date ? new Date(match.date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setMatch({ ...match, date: new Date(e.target.value) })}
                    className={fieldClass}
                    required
                />
            </div>

            {initialValues && (
                <div className="mb-6 p-5 bg-brand-50/40 rounded-xl border border-brand-100">
                    <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-3 text-center">{t('resultTitle')}</label>
                    <div className="flex items-center justify-center gap-6">
                        <div className="flex flex-col items-center">
                            <label className="text-[10px] text-muted-foreground mb-1 uppercase font-black tracking-wider">{t('goalsA')}</label>
                            <input
                                type="number"
                                min="0"
                                value={match.result?.scoreA ?? ''}
                                onChange={(e) => setMatch({
                                    ...match,
                                    result: {
                                        scoreA: parseInt(e.target.value) || 0,
                                        scoreB: match.result?.scoreB || 0
                                    }
                                })}
                                className="w-20 text-center font-display text-3xl font-black tabular-nums p-2 border-2 border-border rounded-lg bg-white focus:border-brand-500 focus:ring-0 focus:outline-none transition-colors"
                            />
                        </div>

                        <span className="font-display text-brand-600 font-black tracking-widest text-xl mt-5">VS</span>

                        <div className="flex flex-col items-center">
                            <label className="text-[10px] text-muted-foreground mb-1 uppercase font-black tracking-wider">{t('goalsB')}</label>
                            <input
                                type="number"
                                min="0"
                                value={match.result?.scoreB ?? ''}
                                onChange={(e) => setMatch({
                                    ...match,
                                    result: {
                                        scoreA: match.result?.scoreA || 0,
                                        scoreB: parseInt(e.target.value) || 0
                                    }
                                })}
                                className="w-20 text-center font-display text-3xl font-black tabular-nums p-2 border-2 border-border rounded-lg bg-white focus:border-brand-500 focus:ring-0 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>
                </div>
            )}

            {initialValues && (
                <div className="mb-4">
                    <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1.5">{t('status')}</label>
                    <div className="flex gap-2">
                        {(['scheduled', 'live', 'completed'] as const).map((s) => {
                            const active = match.status === s;
                            const { label, Icon } = statusConfig[s];
                            return (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setMatch({ ...match, status: s })}
                                    className={`flex-1 py-2 px-2 rounded-lg border text-sm font-bold transition-all inline-flex items-center justify-center gap-1.5 ${active
                                        ? 'bg-brand-600 border-brand-600 text-white shadow-glow'
                                        : 'bg-white border-border text-muted-foreground hover:bg-neutral-50'
                                        }`}
                                >
                                    <Icon className={`h-4 w-4 ${s === 'live' && active ? 'animate-pulse' : ''}`} />
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {initialValues && match.teamAId && match.teamBId && (() => {
                const teamA = teams.find(t => t.id === match.teamAId);
                const teamB = teams.find(t => t.id === match.teamBId);
                return teamA && teamB ? (
                    <div className="mb-6">
                        <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-3">{t('incidentsTitle')}</label>
                        <IncidentEditor
                            teamA={teamA}
                            teamB={teamB}
                            incidents={match.incidents || []}
                            onChange={(newIncidents) => setMatch({ ...match, incidents: newIncidents })}
                        />
                    </div>
                ) : null;
            })()}

            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all active:scale-95 ${loading ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 text-white shadow-glow'
                        }`}
                >
                    {loading ? t('saving') : submitLabel}
                </button>
            </div>

        </form>
    );
};

export default MatchForm;
