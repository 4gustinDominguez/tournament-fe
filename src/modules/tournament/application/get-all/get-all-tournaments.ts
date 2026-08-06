import { Tournament } from "../../domain/tournament";
import { TournamentRepository } from "../../domain/tournament-repository";

export async function getAllTournaments(tournamentRepository: TournamentRepository): Promise<Tournament[]> {
	return tournamentRepository.getAll();
}
