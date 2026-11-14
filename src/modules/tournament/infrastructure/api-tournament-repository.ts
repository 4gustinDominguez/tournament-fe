import { Match } from "../domain/match";
import { Player } from "../domain/player";
import { Round } from "../domain/round";
import { Team } from "../domain/team";
import { Tournament } from "../domain/tournament";
import { TeamStats } from "../domain/standings";
import { DashboardStats } from "../domain/dashboard-stats";
import { Place } from "../../places/domain/place";
import { Referee } from "../../referees/domain/referee";
import { TournamentRepository } from "../domain/tournament-repository";
import { API_BASE_URL as baseUrl } from "@/config/api";

export function createApiTournamentRepository(): TournamentRepository {
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

    async function errorMessage(response: Response, fallback: string): Promise<Error> {
        try {
            const data = await response.json();
            if (data?.message) {
                return new Error(data.message);
            }
        } catch { /* ignore */ }
        return new Error(fallback);
    }

    async function save(tournament: Tournament): Promise<Tournament> {
        const response = await fetch(`${baseUrl}/tournaments`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
                ...tournament,
                location: tournament.location || ""
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to save tournament");
        }

        return response.json();
    }

    async function get(id: string): Promise<Tournament | null> {
        const response = await fetch(`${baseUrl}/tournaments/${id}`);

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            throw new Error(`Failed to get tournament with id ${id}`);
        }

        return response.json();
    }

    async function getBySlug(slug: string): Promise<Tournament | null> {
        const response = await fetch(`${baseUrl}/tournaments/slug/${slug}`);

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            throw new Error(`Failed to get tournament with slug ${slug}`);
        }

        return response.json();
    }

    async function getAll(): Promise<Tournament[]> {
        const response = await fetch(`${baseUrl}/tournaments`);

        if (!response.ok) {
            throw new Error("Failed to get tournaments");
        }

        return response.json();
    }

    async function getMyTournaments(): Promise<Tournament[]> {
        const response = await fetch(`${baseUrl}/tournaments/me`, {
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error("Failed to get my tournaments");
        }

        return response.json();
    }

    async function getDashboardStats(): Promise<DashboardStats> {
        const response = await fetch(`${baseUrl}/dashboard/stats`, {
            headers: getHeaders()
        });

        if (!response.ok) {
            throw await errorMessage(response, `Failed to get dashboard stats`);
        }

        return response.json();
    }

    async function deleteTournament(tournamentId: string) {
        const response = await fetch(`${baseUrl}/tournaments/${tournamentId}`, {
            method: "DELETE",
            headers: getHeaders(),
        });

        if (!response.ok) {
            throw await errorMessage(response, `Failed to delete tournament with id ${tournamentId}`);
        }
    }

    async function deleteTeam(teamId: string) {
        const response = await fetch(`${baseUrl}/teams/${teamId}`, {
            method: "DELETE",
            headers: getHeaders(),
        });

        if (!response.ok) {
            throw await errorMessage(response, `Failed to delete team with id ${teamId}`);
        }
    }

    async function getTeamPublicInfo(teamId: string): Promise<{ team: Team; players: Array<{ id: string; name: string; nickname: string; dorsal?: number; registered: boolean }> } | null> {
        const response = await fetch(`${baseUrl}/teams/${teamId}/public`);
        if (response.status === 404) return null;
        if (!response.ok) {
            throw new Error("Failed to fetch team public info");
        }
        return response.json();
    }

    async function claimPlayer(playerId: string): Promise<void> {
        const response = await fetch(`${baseUrl}/teams/claim`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ playerId }),
        });
        if (!response.ok) {
            throw await errorMessage(response, "Failed to claim player");
        }
    }

    async function deletePlayer(playerId: string) {
        const response = await fetch(`${baseUrl}/players/${playerId}`, {
            method: "DELETE",
            headers: getHeaders(),
        });

        if (!response.ok) {
            throw await errorMessage(response, `Failed to delete player with id ${playerId}`);
        }
    }

    async function deletePlace(placeId: string) {
        const response = await fetch(`${baseUrl}/places/${placeId}`, {
            method: "DELETE",
            headers: getHeaders(),
        });

        if (!response.ok) {
            throw await errorMessage(response, `Failed to delete place with id ${placeId}`);
        }
    }

    async function updatePlace(placeId: string, place: Partial<Omit<import("../../places/domain/place").Place, "id" | "tournamentId">>) {
        const response = await fetch(`${baseUrl}/places/${placeId}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(place),
        });

        if (!response.ok) {
            throw await errorMessage(response, `Failed to update place with id ${placeId}`);
        }
    }

    async function deleteRound(roundId: string) {
        const response = await fetch(`${baseUrl}/rounds/${roundId}`, {
            method: "DELETE",
            headers: getHeaders(),
        });

        if (!response.ok) {
            throw await errorMessage(response, `Failed to delete round with id ${roundId}`);
        }
    }

    async function deleteReferee(refereeId: string) {
        const response = await fetch(`${baseUrl}/referees/${refereeId}`, {
            method: "DELETE",
            headers: getHeaders(),
        });

        if (!response.ok) {
            throw await errorMessage(response, `Failed to delete referee with id ${refereeId}`);
        }
    }

    async function getAllTeamsByTournamentId(tournamentId: string): Promise<Team[]> {
        const response = await fetch(`${baseUrl}/teams?tournamentId=${tournamentId}`);

        if (!response.ok) {
            throw new Error(`Failed to get teams for tournament ${tournamentId}`);
        }

        return response.json();
    }

    async function saveTeam({ tournamentId, team }: { tournamentId: string; team: Team }) {
        const response = await fetch(`${baseUrl}/teams`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
                ...team,
                tournamentId
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to save team");
        }
    }

    async function updateTeam(team: Team) {
        const response = await fetch(`${baseUrl}/teams/${team.id}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify({
                name: team.name,
                placeId: team.placeId,
                coach: team.coach,
                crestUrl: team.crestUrl,
                kitPattern: team.kitPattern,
                kitColors: team.kitColors,
                formation: team.formation,
                publicRegistration: team.publicRegistration,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to update team");
        }
    }

    async function savePlayer({ teamId, player }: { teamId: string; player: Player }) {
        const response = await fetch(`${baseUrl}/players`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
                ...player,
                teamId
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to save player");
        }
    }

    async function saveRound({ tournamentId, round }: { tournamentId: string; round: Round }) {
        const response = await fetch(`${baseUrl}/tournaments/${tournamentId}/rounds`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
                name: round.name,
                startDate: round.startDate ? round.startDate.toISOString() : undefined,
                endDate: round.endDate ? round.endDate.toISOString() : undefined
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to save round");
        }
    }

    async function getRoundsByTournamentId(tournamentId: string): Promise<Round[]> {
        const response = await fetch(`${baseUrl}/tournaments/${tournamentId}/rounds`);
        if (!response.ok) {
            throw new Error("Failed to fetch rounds");
        }
        return response.json();
    }

    async function saveMatch({ tournamentId, match }: { tournamentId: string; match: Match }) {
        const matchDate = typeof match.date === 'string' ? new Date(match.date) : match.date;
        const response = await fetch(`${baseUrl}/rounds/${match.roundId}/matches`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
                teamAId: match.teamAId,
                teamBId: match.teamBId,
                date: matchDate.toISOString(),
                placeId: match.placeId,
                refereeId: match.refereeId,
                status: match.status,
                result: match.result,
                incidents: match.incidents,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to save match");
        }
    }

    async function updateMatch(match: Match) {
        const matchDate = typeof match.date === 'string' ? new Date(match.date) : match.date;

        const response = await fetch(`${baseUrl}/matches/${match.id}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify({
                teamAId: match.teamAId,
                teamBId: match.teamBId,
                date: matchDate.toISOString(),
                placeId: match.placeId,
                refereeId: match.refereeId,
                status: match.status,
                result: match.result,
                incidents: match.incidents,
                notes: match.notes,
                presentPlayerIds: match.presentPlayerIds ?? [],
                timerElapsedSeconds: match.timerElapsedSeconds ?? 0,
                timerRunning: match.timerRunning ?? false,
                timerStartedAt: match.timerStartedAt ?? null,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to update match with id ${match.id}`);
        }
    }

    async function deleteMatch(matchId: string) {
        const response = await fetch(`${baseUrl}/matches/${matchId}`, {
            method: "DELETE",
            headers: getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Failed to delete match with id ${matchId}`);
        }
    }

    async function getMatchesByTournamentId(tournamentId: string): Promise<Match[]> {
        const response = await fetch(`${baseUrl}/tournaments/${tournamentId}/matches`);
        if (!response.ok) {
            throw new Error("Failed to fetch matches");
        }
        const matches = await response.json();
        return matches.map((m: any) => ({
            ...m,
            date: new Date(m.date)
        }));
    }

    async function getMatchesByRefereeId(refereeId: string): Promise<Match[]> {
        const response = await fetch(`${baseUrl}/referees/${refereeId}/matches`, {
            headers: getHeaders(),
            cache: 'no-store'
        });
        if (!response.ok) {
            throw new Error("Failed to fetch matches for referee");
        }
        const matches = await response.json();
        return matches.map((m: any) => ({
            ...m,
            date: new Date(m.date)
        }));
    }
    async function getMatchById(id: string): Promise<Match | null> {
        const response = await fetch(`${baseUrl}/matches/${id}`, {
            headers: getHeaders(),
            cache: 'no-store',
        });
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error("Failed to fetch match");
        }
        const m = await response.json();
        return { ...m, date: new Date(m.date) };
    }
    async function addMatchResult(matchId: string, result: { scoreA: number; scoreB: number }) {
        const response = await fetch(`${baseUrl}/matches/${matchId}/result`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(result),
        });

        if (!response.ok) {
            throw new Error(`Failed to add result to match with id ${matchId}`);
        }
    }

    async function addMatchIncident(
        matchId: string,
        incident: Omit<Match["incidents"][0], "id">
    ) {
        const response = await fetch(`${baseUrl}/matches/${matchId}/incidents`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(incident),
        });

        if (!response.ok) {
            throw new Error(`Failed to add incident to match with id ${matchId}`);
        }
    }

    async function deleteMatchIncident(matchId: string, incidentId: string) {
        const response = await fetch(`${baseUrl}/matches/${matchId}/incidents/${incidentId}`, {
            method: "DELETE",
            headers: getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Failed to delete incident from match with id ${matchId}`);
        }
    }


    async function getPlacesByTournamentId(tournamentId: string): Promise<Place[]> {
        const response = await fetch(`${baseUrl}/places?tournamentId=${tournamentId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch places");
        }
        return response.json();
    }

    async function getRefereesByTournamentId(tournamentId: string): Promise<Referee[]> {
        const response = await fetch(`${baseUrl}/referees?tournamentId=${tournamentId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch referees");
        }
        return response.json();
    }

    async function getRefereeMe(): Promise<Referee | null> {
        const response = await fetch(`${baseUrl}/referees/me`, {
            headers: getHeaders()
        });
        if (response.status === 404) return null;
        if (!response.ok) {
            throw new Error("Failed to fetch current referee profile");
        }
        return response.json();
    }

    async function getPlayerMe(): Promise<Player | null> {
        const response = await fetch(`${baseUrl}/players/me`, {
            headers: getHeaders()
        });
        if (response.status === 404) return null;
        if (!response.ok) {
            throw new Error("Failed to fetch current player profile");
        }
        return response.json();
    }

    async function getMyTeams(): Promise<Team[]> {
        const response = await fetch(`${baseUrl}/players/me/teams`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error("Failed to fetch player teams");
        }
        return response.json();
    }

    async function getMyMatches(): Promise<Match[]> {
        const response = await fetch(`${baseUrl}/players/me/matches`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error("Failed to fetch player matches");
        }
        return response.json();
    }

    async function getMyStats(): Promise<Record<string, { team: Team; statistics: Player["statistics"] }>> {
        const response = await fetch(`${baseUrl}/players/me/stats`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error("Failed to fetch player stats");
        }
        return response.json();
    }

    async function saveReferee({ tournamentId, referee }: { tournamentId: string; referee: Referee }) {
        const response = await fetch(`${baseUrl}/referees`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
                ...referee,
                tournamentIds: [tournamentId]
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to save referee");
        }
    }

    async function getStandings(tournamentId: string): Promise<TeamStats[]> {
        const response = await fetch(`${baseUrl}/tournaments/${tournamentId}/standings`);
        if (!response.ok) {
            throw new Error("Failed to fetch standings");
        }
        return response.json();
    }

    async function generateFixtures(tournamentId: string): Promise<void> {
        const response = await fetch(`${baseUrl}/tournaments/${tournamentId}/fixtures/generate`, {
            method: 'POST',
            headers: getHeaders(),
        });
        if (!response.ok) {
            throw new Error("Failed to generate fixtures");
        }
    }

    async function generateScenario(params: any): Promise<{ tournamentId: string; tournament: Tournament }> {
        const response = await fetch(`${baseUrl}/scenarios/generate`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(params),
        });

        const contentType = response.headers.get("content-type");
        if (!response.ok) {
            let errorMessage = "Failed to generate scenario";
            if (contentType && contentType.includes("application/json")) {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } else {
                errorMessage = await response.text();
            }
            throw new Error(errorMessage);
        }

        if (contentType && contentType.includes("application/json")) {
            try {
                return await response.json();
            } catch (jsonErr) {
                const text = await response.text();
                console.error("JSON parse error. Raw response:", text);
                throw new Error(`Invalid JSON response from server: ${text.substring(0, 100)}`);
            }
        }
        throw new Error("Unexpected response from server");
    }

    async function getAllReferees(): Promise<Referee[]> {
        const response = await fetch(`${baseUrl}/referees/all`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error("Failed to fetch all referees");
        }
        return response.json();
    }

    async function updateReferee(referee: Referee): Promise<void> {
        const response = await fetch(`${baseUrl}/referees/${referee.id}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(referee),
        });

        if (!response.ok) {
            throw new Error("Failed to update referee");
        }
    }

    async function updatePlayer(player: Player) {
        const response = await fetch(`${baseUrl}/players/${player.id}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(player),
        });

        if (!response.ok) {
            throw new Error(`Failed to update player with id ${player.id}`);
        }
    }

    async function updateTournament(tournament: Tournament): Promise<Tournament> {
        const response = await fetch(`${baseUrl}/tournaments/${tournament.id}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify({
                name: tournament.name,
                location: tournament.location,
                startDate: typeof tournament.startDate === 'string' ? tournament.startDate : tournament.startDate.toISOString().split('T')[0],
                endDate: typeof tournament.endDate === 'string' ? tournament.endDate : tournament.endDate.toISOString().split('T')[0],
                matchDurationMinutes: tournament.matchDurationMinutes ?? undefined,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to update tournament with id ${tournament.id}`);
        }
        return response.json();
    }

    return {
        save,
        get,
        getBySlug,
        getAll,
        getMyTournaments,
        getDashboardStats,
        deleteTournament,
        deleteTeam,
        getTeamPublicInfo,
        claimPlayer,
        deletePlayer,
        deletePlace,
        updatePlace,
        deleteRound,
        deleteReferee,
        saveTeam,
        updateTeam,
        getAllTeamsByTournamentId,
        savePlayer,
        updatePlayer,
        saveRound,
        getRoundsByTournamentId,
        saveMatch,
        updateMatch,
        deleteMatch,
        getMatchesByTournamentId,
        getMatchesByRefereeId,
        getMatchById,
        addMatchResult,
        addMatchIncident,
        deleteMatchIncident,
        getPlacesByTournamentId,
        getRefereesByTournamentId,
        getAllReferees,
        getRefereeMe,
        getPlayerMe,
        getMyTeams,
        getMyMatches,
        getMyStats,
        saveReferee,
        updateReferee,
        updateTournament,
        getStandings,
        generateFixtures,
        generateScenario,
    };
}
