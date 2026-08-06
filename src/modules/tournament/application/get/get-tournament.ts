import { Tournament } from "../../domain/tournament";
import { TournamentRepository } from "../../domain/tournament-repository";

export async function getTournament(
	tournamentRepository: TournamentRepository,
	tournamentId: string
): Promise<Tournament | null> {
	return tournamentRepository.get(tournamentId);
}
