import { describe, expect, it, vi } from "vitest";

import { createMatch } from "@/modules/tournament/application/create/create-match";
import { createPlayer } from "@/modules/tournament/application/create/create-player";
import { createRound } from "@/modules/tournament/application/create/create-round";
import { createTeam } from "@/modules/tournament/application/create/create-team";
import { createTournament } from "@/modules/tournament/application/create/create-tournament";
import { getAllMatches } from "@/modules/tournament/application/get-all/get-all-matches";
import { getAllRounds } from "@/modules/tournament/application/get-all/get-all-rounds";
import { getAllTeams } from "@/modules/tournament/application/get-all/get-all-teams";
import { getAllTournaments } from "@/modules/tournament/application/get-all/get-all-tournaments";
import { getTournament } from "@/modules/tournament/application/get/get-tournament";
import type { Match } from "@/modules/tournament/domain/match";
import type { Player } from "@/modules/tournament/domain/player";
import type { Round } from "@/modules/tournament/domain/round";
import type { Team } from "@/modules/tournament/domain/team";
import type { Tournament } from "@/modules/tournament/domain/tournament";
import type { TournamentRepository } from "@/modules/tournament/domain/tournament-repository";

const repo = {
  save: vi.fn(),
  get: vi.fn(),
  getAll: vi.fn(),
  getMyTournaments: vi.fn(),
  getDashboardStats: vi.fn(),
  deleteTournament: vi.fn(),
  deleteTeam: vi.fn(),
  deletePlayer: vi.fn(),
  deletePlace: vi.fn(),
  deleteRound: vi.fn(),
  deleteReferee: vi.fn(),
  saveTeam: vi.fn(),
  updateTeam: vi.fn(),
  getAllTeamsByTournamentId: vi.fn(),
  savePlayer: vi.fn(),
  updatePlayer: vi.fn(),
  saveRound: vi.fn(),
  getRoundsByTournamentId: vi.fn(),
  saveMatch: vi.fn(),
  updateMatch: vi.fn(),
  deleteMatch: vi.fn(),
  getMatchesByTournamentId: vi.fn(),
  getMatchesByRefereeId: vi.fn(),
  addMatchResult: vi.fn(),
  addMatchIncident: vi.fn(),
  deleteMatchIncident: vi.fn(),
  getPlacesByTournamentId: vi.fn(),
  getRefereesByTournamentId: vi.fn(),
  getAllReferees: vi.fn(),
  getRefereeMe: vi.fn(),
  saveReferee: vi.fn(),
  updateReferee: vi.fn(),
  getStandings: vi.fn(),
  generateFixtures: vi.fn(),
  generateScenario: vi.fn(),
} as unknown as TournamentRepository;

const tournament: Tournament = {
  id: "t1",
  name: "Torneo",
  location: "",
  startDate: "",
  endDate: "",
};
const team: Team = { id: "team-1", name: "Los Rayos", tournaments: ["t1"] };
const player: Player = { id: "p1", name: "Juan", nickname: "Juan", tournaments: ["t1"] };
const round: Round = { id: "r1", name: "Jornada 1", tournamentId: "t1" };
const match: Match = {
  id: "m1",
  tournamentId: "t1",
  roundId: "r1",
  teamAId: "a",
  teamBId: "b",
  result: null,
  status: "scheduled",
  date: new Date(),
  incidents: [],
};

describe("tournament application cases", () => {
  it("createTournament delegates to repository.save", async () => {
    await createTournament(repo, tournament);
    expect(repo.save).toHaveBeenCalledWith(tournament);
  });

  it("getAllTournaments returns the repository result", async () => {
    vi.mocked(repo.getAll).mockResolvedValueOnce([tournament]);
    await expect(getAllTournaments(repo)).resolves.toEqual([tournament]);
  });

  it("getTournament returns the tournament by id", async () => {
    vi.mocked(repo.get).mockResolvedValueOnce(tournament);
    await expect(getTournament(repo, "t1")).resolves.toEqual(tournament);
    expect(repo.get).toHaveBeenCalledWith("t1");
  });

  it("createTeam delegates with tournamentId and team", async () => {
    await createTeam(repo, "t1", team);
    expect(repo.saveTeam).toHaveBeenCalledWith({ tournamentId: "t1", team });
  });

  it("getAllTeams returns the teams of the tournament", async () => {
    vi.mocked(repo.getAllTeamsByTournamentId).mockResolvedValueOnce([team]);
    await expect(getAllTeams(repo, "t1")).resolves.toEqual([team]);
  });

  it("createPlayer delegates with teamId and player", async () => {
    await createPlayer(repo, "team-1", player);
    expect(repo.savePlayer).toHaveBeenCalledWith({ teamId: "team-1", player });
  });

  it("createMatch delegates with tournamentId and match", async () => {
    await createMatch(repo, "t1", match);
    expect(repo.saveMatch).toHaveBeenCalledWith({ tournamentId: "t1", match });
  });

  it("getAllMatches returns the matches of the tournament", async () => {
    vi.mocked(repo.getMatchesByTournamentId).mockResolvedValueOnce([match]);
    await expect(getAllMatches(repo, "t1")).resolves.toEqual([match]);
  });

  it("createRound delegates with tournamentId and round", async () => {
    await createRound(repo, "t1", round);
    expect(repo.saveRound).toHaveBeenCalledWith({ tournamentId: "t1", round });
  });

  it("getAllRounds returns the rounds of the tournament", async () => {
    vi.mocked(repo.getRoundsByTournamentId).mockResolvedValueOnce([round]);
    await expect(getAllRounds(repo, "t1")).resolves.toEqual([round]);
  });
});
