import { Tournament } from "../domain/tournament";
import { Match } from "./match";
import { Player } from "./player";
import { Team } from "./team";
import { Round } from "./round";
import { Place } from "../../places/domain/place";
import { Referee } from "../../referees/domain/referee";
import { TeamStats } from "./standings";

export interface TournamentRepository {
  save: (tournament: Tournament) => Promise<void>;
  get: (id: string) => Promise<Tournament | null>;
  getAll: () => Promise<Tournament[]>;
  getMyTournaments: () => Promise<Tournament[]>;

  saveTeam: ({
    tournamentId,
    team,
  }: {
    tournamentId: string;
    team: Team;
  }) => Promise<void>;
  updateTeam: (team: Team) => Promise<void>;
  getAllTeamsByTournamentId: (tournamentId: string) => Promise<Team[]>;
  savePlayer: ({
    teamId,
    player,
  }: {
    teamId: string;
    player: Player;
  }) => Promise<void>;
  updatePlayer: (player: Player) => Promise<void>;

  saveRound: ({
    tournamentId,
    round,
  }: {
    tournamentId: string;
    round: Round;
  }) => Promise<void>;
  getRoundsByTournamentId: (tournamentId: string) => Promise<Round[]>;

  saveMatch: ({
    tournamentId,
    match,
  }: {
    tournamentId: string;
    match: Match;
  }) => Promise<void>;
  updateMatch: (match: Match) => Promise<void>;
  deleteMatch: (matchId: string) => Promise<void>;
  getMatchesByTournamentId: (tournamentId: string) => Promise<Match[]>;
  getMatchesByRefereeId: (refereeId: string) => Promise<Match[]>;
  addMatchResult: (
    matchId: string,
    result: { scoreA: number; scoreB: number },
  ) => Promise<void>;
  addMatchIncident: (
    matchId: string,
    incident: Omit<Match["incidents"][0], "id">,
  ) => Promise<void>;
  deleteMatchIncident: (matchId: string, incidentId: string) => Promise<void>;
  getPlacesByTournamentId: (tournamentId: string) => Promise<Place[]>;
  getRefereesByTournamentId: (tournamentId: string) => Promise<Referee[]>;
  getAllReferees: () => Promise<Referee[]>;
  getRefereeMe: () => Promise<Referee | null>;
  saveReferee: ({
    tournamentId,
    referee,
  }: {
    tournamentId: string;
    referee: Referee;
  }) => Promise<void>;
  updateReferee: (referee: Referee) => Promise<void>;
  getStandings: (tournamentId: string) => Promise<TeamStats[]>;
  generateFixtures: (tournamentId: string) => Promise<void>;
  generateScenario: (params: {
    tournamentName: string;
    startDate: string;
    endDate: string;
    teamsCount: number;
    playersPerTeam: number;
    placesCount: number;
    refereesCount: number;
  }) => Promise<{ tournamentId: string }>;
}
