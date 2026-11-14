import { Player } from "../../domain/player";
import { TournamentRepository } from "../../domain/tournament-repository";

export async function createPlayer(
    tournamentRepository: TournamentRepository,
    teamId: string,
    player: Player
): Promise<void> {
    await tournamentRepository.savePlayer({ teamId, player });
}