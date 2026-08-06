import { Round } from "../../domain/round";
import { TournamentRepository } from "../../domain/tournament-repository";

export async function createRound(
    repository: TournamentRepository,
    tournamentId: string,
    round: Round
) {
    return repository.saveRound({ tournamentId, round });
}
