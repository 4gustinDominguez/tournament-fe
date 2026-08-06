import { TournamentRepository } from "../../domain/tournament-repository";

export async function getAllRounds(
    repository: TournamentRepository,
    tournamentId: string
) {
    return repository.getRoundsByTournamentId(tournamentId);
}
