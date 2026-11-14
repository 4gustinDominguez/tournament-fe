import { Tournament } from "../../domain/tournament";
import { TournamentRepository } from "../../domain/tournament-repository";

export async function createTournament(
    tournamentRepository: TournamentRepository,
    tournament: Tournament
): Promise<void> {
    await tournamentRepository.save(tournament);
}