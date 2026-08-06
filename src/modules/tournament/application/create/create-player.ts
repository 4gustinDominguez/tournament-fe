import { Player } from "../../domain/player";
import { TournamentRepository } from "../../domain/tournament-repository";

export async function createPlayer(
    tournamentRepository: TournamentRepository,
    teamId: string,
    player: Player
): Promise<void> {
    // ensureTournamentIsValid(course);

    await tournamentRepository.savePlayer({ teamId, player });
}