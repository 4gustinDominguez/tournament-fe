import { Place } from "./place";

export interface PlaceRepository {
    save(place: Omit<Place, "id">): Promise<void>;
    getAll(tournamentId?: string): Promise<Place[]>;
    update(id: string, place: Partial<Omit<Place, "id" | "tournamentId">>): Promise<void>;
}
