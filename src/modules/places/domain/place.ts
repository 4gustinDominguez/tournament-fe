export interface Place {
    id: string;
    name: string;
    tournamentId: string;
    location?: string;
    capacity?: number;
    latitude?: number;
    longitude?: number;
}
