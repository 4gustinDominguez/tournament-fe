import { Team } from "../../domain/team";
import { Tournament } from "../../domain/tournament";
import { TournamentRepository } from "../../domain/tournament-repository";

export async function getAllTeams(tournamentRepository: TournamentRepository, tournamentId: string): Promise<Team[]> {
	return tournamentRepository.getAllTeamsByTournamentId(tournamentId);
}
