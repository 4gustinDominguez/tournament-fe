import { Match } from "../../domain/match";
import { TournamentRepository } from "../../domain/tournament-repository";

export async function getAllMatches(
    repository: TournamentRepository,
    tournamentId: string
): Promise<Match[]> {
    return repository.getMatchesByTournamentId(tournamentId);
}
