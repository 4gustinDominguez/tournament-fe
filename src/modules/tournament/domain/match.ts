export interface MatchResult {
    scoreA: number;
    scoreB: number;
}

export interface MatchIncident {
    id: string;
    type: 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION';
    playerId: string;
    minute: number;
    teamId: string;
    details?: string;
}

export interface Match {
    id: string;
    tournamentId: string;
    roundId: string;
    teamAId: string;
    teamBId: string;
    result: MatchResult | null;
    status: 'scheduled' | 'live' | 'completed';
    date: Date;
    placeId?: string;
    refereeId?: string;
    incidents: MatchIncident[];
    notes?: string;
    presentPlayerIds?: string[];
}
