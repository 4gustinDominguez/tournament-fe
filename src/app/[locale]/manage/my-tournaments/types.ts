export type Tournament = {
    id: number;
    name: string;
    date: string;
    location: string;
};

export type TournamentsPageProps = {
    tournaments: Tournament[];
};