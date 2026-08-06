import { Place } from "../domain/place";
import { PlaceRepository } from "../domain/place-repository";
import { API_BASE_URL as baseUrl } from "@/config/api";

export function createApiPlaceRepository(): PlaceRepository {
    const getHeaders = (headers: Record<string, string> = {}) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem("auth_token") : null;
        const baseHeaders: Record<string, string> = {
            "Content-Type": "application/json",
            ...headers
        };
        if (token) {
            baseHeaders["Authorization"] = `Bearer ${token}`;
        }
        return baseHeaders;
    };

    return {
        async save(place: Omit<Place, "id">) {
            const response = await fetch(`${baseUrl}/places`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(place),
            });

            if (!response.ok) {
                throw new Error("Failed to save place");
            }
        },

        async getAll(tournamentId?: string): Promise<Place[]> {
            const url = tournamentId
                ? `${baseUrl}/places?tournamentId=${tournamentId}`
                : `${baseUrl}/places`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Failed to get places");
            }

            return response.json();
        },
    };
}
