import { Team } from "../../domain/team";
import { TournamentRepository } from "../../domain/tournament-repository";

export async function createTeam(
    tournamentRepository: TournamentRepository,
    tournamentId: string,
    team: Team
): Promise<void> {
    // ensureTournamentIsValid(course);

    await tournamentRepository.saveTeam({ tournamentId, team });
}