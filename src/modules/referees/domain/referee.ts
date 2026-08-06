export interface Referee {
    id: string;
    name: string;
    email?: string;
    tournamentIds: string[];
    userId?: string;
}
