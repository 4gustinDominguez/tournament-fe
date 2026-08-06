import { Match } from "../../domain/match";
import { TournamentRepository } from "../../domain/tournament-repository";

export async function createMatch(
    repository: TournamentRepository,
    tournamentId: string,
    match: Match
): Promise<void> {
    return repository.saveMatch({ tournamentId, match });
}
