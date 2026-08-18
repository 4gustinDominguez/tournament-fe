export interface Tournament {
    id: string;
    name: string;
    slug?: string;
    location: string;
    startDate: Date | string;
    endDate: Date | string;
    teams?: string[];
    ownerId?: string;
    status?: string;
    category?: string;
    description?: string;
}