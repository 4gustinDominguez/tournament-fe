'use client';

import React from 'react';
import { CircleDot, Square, ArrowLeftRight, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MatchIncident } from '@/modules/tournament/domain/match';
import { Team } from '@/modules/tournament/domain/team';

interface MatchTimelineProps {
    incidents: MatchIncident[];
    teamA: Team;
    teamB: Team;
}

const MatchTimeline: React.FC<MatchTimelineProps> = ({ incidents, teamA, teamB }) => {
    if (!incidents || incidents.length === 0) return null;

    const sortedIncidents = [...incidents].sort((a, b) => a.minute - b.minute);

    const IncidentIcon = ({ type, teamId }: { type: string; teamId: string }) => {
        const isA = teamId === teamA.id;
        const sideColor = isA ? 'text-brand-600' : 'text-sky-600';
        switch (type) {
            case 'GOAL':
                return <CircleDot className={cn("h-3.5 w-3.5", sideColor)} fill="currentColor" />;
            case 'YELLOW_CARD':
                return <Square className={cn("h-3.5 w-3.5 rotate-45", "text-amber-400")} fill="currentColor" />;
            case 'RED_CARD':
                return <Square className={cn("h-3.5 w-3.5 rotate-45", "text-destructive")} fill="currentColor" />;
            case 'SUBSTITUTION':
                return <ArrowLeftRight className={cn("h-3.5 w-3.5", sideColor)} />;
            default:
                return <MapPin className="h-3.5 w-3.5 text-muted-foreground" />;
        }
    };

    const getPlayerName = (incident: MatchIncident) => {
        const team = incident.teamId === teamA.id ? teamA : teamB;
        return team.player?.find(p => p.id === incident.playerId)?.name || 'Jugador';
    };

    return (
        <div className="mt-4 px-4 py-3 bg-neutral-50/60 rounded-xl border border-border flex flex-wrap gap-x-6 gap-y-2">
            {sortedIncidents.map((incident) => (
                <div key={incident.id} className="flex items-center gap-1.5 text-xs">
                    <span className="font-display font-bold text-muted-foreground">{incident.minute}&apos;</span>
                    <IncidentIcon type={incident.type} teamId={incident.teamId} />
                    <span className="font-bold text-foreground">{getPlayerName(incident)}</span>
                    <span className="text-[10px] text-muted-foreground">({incident.teamId === teamA.id ? 'A' : 'B'})</span>
                </div>
            ))}
        </div>
    );
};

export default MatchTimeline;
