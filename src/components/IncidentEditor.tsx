'use client';

import React, { useState } from 'react';
import { MatchIncident } from '@/modules/tournament/domain/match';
import { Team } from '@/modules/tournament/domain/team';
import { Plus, Trash2, CircleDot, Square, ArrowLeftRight, MapPin, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { notify } from '@/lib/notify';

interface IncidentEditorProps {
    teamA: Team;
    teamB: Team;
    incidents: MatchIncident[];
    onChange?: (incidents: MatchIncident[]) => void;
    onAdd?: (incident: Omit<MatchIncident, 'id'>) => Promise<void>;
    onRemove?: (incidentId: string) => Promise<void>;
}

const IncidentEditor: React.FC<IncidentEditorProps> = ({ teamA, teamB, incidents, onChange, onAdd, onRemove }) => {
    const t = useTranslations('IncidentEditor');
    const [newIncident, setNewIncident] = useState<Partial<MatchIncident>>({
        type: 'GOAL',
        minute: 1,
        teamId: teamA.id,
        playerId: '',
    });

    const allPlayers = [
        ...(teamA.player || []).map(p => ({ ...p, teamId: teamA.id, teamName: teamA.name })),
        ...(teamB.player || []).map(p => ({ ...p, teamId: teamB.id, teamName: teamB.name })),
    ];

    const currentTeamPlayers = allPlayers.filter(p => p.teamId === newIncident.teamId);

    const handleAdd = () => {
        if (!newIncident.playerId || !newIncident.minute || !newIncident.type || !newIncident.teamId) {
            notify.warning(t("incompleteAlert"));
            return;
        }

        const incidentData: Omit<MatchIncident, 'id'> = {
            type: newIncident.type as any,
            minute: Number(newIncident.minute),
            teamId: newIncident.teamId,
            playerId: newIncident.playerId,
            details: newIncident.details,
        };

        if (onAdd) {
            onAdd(incidentData).catch(err => {
                console.error("Error adding incident:", err);
                notify.error(err instanceof Error ? err.message : t("addError"));
            });
        }

        if (onChange) {
            const incident: MatchIncident = {
                ...incidentData,
                id: crypto.randomUUID(),
            };
            onChange([...incidents, incident]);
        }

        // Reset only playerId to make adding multiple goals for same team faster
        setNewIncident({ ...newIncident, playerId: '' });
    };

    const handleRemove = (id: string) => {
        if (onRemove) {
            onRemove(id).catch(err => {
                console.error("Error removing incident:", err);
                notify.error(err instanceof Error ? err.message : t("removeError"));
            });
        }
        if (onChange) {
            onChange(incidents.filter(i => i.id !== id));
        }
    };

    const getPlayerName = (id: string) => {
        return allPlayers.find(p => p.id === id)?.name || t('unknownPlayer');
    };

    const IncidentIcon = ({ type }: { type: string }) => {
        switch (type) {
            case 'GOAL': return <CircleDot className="h-4 w-4 text-brand-600" fill="currentColor" />;
            case 'YELLOW_CARD': return <Square className="h-4 w-4 rotate-45 text-amber-400" fill="currentColor" />;
            case 'RED_CARD': return <Square className="h-4 w-4 rotate-45 text-destructive" fill="currentColor" />;
            case 'SUBSTITUTION': return <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />;
            default: return <MapPin className="h-4 w-4 text-muted-foreground" />;
        }
    };

    const fieldClass = "w-full border border-input bg-white rounded-lg px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors";
    const labelClass = "text-[10px] font-black uppercase tracking-wider text-muted-foreground";

    return (
        <div className="space-y-4">
            <div className="bg-brand-50/40 p-4 rounded-xl border border-brand-100">
                <h4 className="text-xs font-black text-brand-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-brand-600" /> {t('title')}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                        <label className={labelClass}>{t('minute')}</label>
                        <input
                            type="number"
                            min="1"
                            max="120"
                            value={newIncident.minute}
                            onChange={e => setNewIncident({ ...newIncident, minute: parseInt(e.target.value) })}
                            className={fieldClass}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className={labelClass}>{t('team')}</label>
                        <select
                            value={newIncident.teamId}
                            onChange={e => setNewIncident({ ...newIncident, teamId: e.target.value, playerId: '' })}
                            className={fieldClass}
                        >
                            <option value={teamA.id}>{teamA.name}</option>
                            <option value={teamB.id}>{teamB.name}</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className={labelClass}>{t('type')}</label>
                        <select
                            value={newIncident.type}
                            onChange={e => setNewIncident({ ...newIncident, type: e.target.value as any })}
                            className={fieldClass}
                        >
                            <option value="GOAL">⚽ {t('goal')}</option>
                            <option value="YELLOW_CARD">🟨 {t('yellowCard')}</option>
                            <option value="RED_CARD">🟥 {t('redCard')}</option>
                            <option value="SUBSTITUTION">🔄 {t('substitution')}</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className={labelClass}>{t('player')}</label>
                        <select
                            value={newIncident.playerId}
                            onChange={e => setNewIncident({ ...newIncident, playerId: e.target.value })}
                            className={fieldClass}
                        >
                            <option value="">{t('selectPlayer')}</option>
                            {currentTeamPlayers.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleAdd}
                    className="mt-4 w-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-black py-2 rounded-lg transition-all shadow-glow active:scale-95 inline-flex items-center justify-center gap-1.5"
                >
                    <Plus className="h-3.5 w-3.5" />
                    {t('add')}
                </button>
            </div>

            {incidents.length > 0 && (
                <div className="border border-border rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-neutral-50 text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-2 text-left">{t('minute')}</th>
                                <th className="px-4 py-2 text-left">{t('team')}</th>
                                <th className="px-4 py-2 text-left">{t('event')}</th>
                                <th className="px-4 py-2 text-left">{t('player')}</th>
                                <th className="px-4 py-2 text-right">{t('action')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {[...incidents].sort((a, b) => a.minute - b.minute).map(incident => (
                                <tr key={incident.id} className="hover:bg-brand-50/30 transition-colors">
                                    <td className="px-4 py-2 font-display font-black tabular-nums text-foreground">{incident.minute}&apos;</td>
                                    <td className="px-4 py-2 text-xs text-muted-foreground font-medium">{incident.teamId === teamA.id ? teamA.name : teamB.name}</td>
                                    <td className="px-4 py-2"><IncidentIcon type={incident.type} /></td>
                                    <td className="px-4 py-2 font-semibold text-foreground">{getPlayerName(incident.playerId)}</td>
                                    <td className="px-4 py-2 text-right">
                                        <button
                                            type="button"
                                            onClick={() => handleRemove(incident.id)}
                                            className="text-destructive hover:text-destructive/80 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default IncidentEditor;
