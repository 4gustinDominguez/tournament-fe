import React, { useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth-context";

import { createTeam as createTeamCase } from "@/modules/tournament/application/create/create-team";
import { createTournament } from "@/modules/tournament/application/create/create-tournament";
import { getAllTournaments } from "@/modules/tournament/application/get-all/get-all-tournaments";
import { getAllTeams } from "@/modules/tournament/application/get-all/get-all-teams";
import { Match } from "@/modules/tournament/domain/match";
import { Player } from "@/modules/tournament/domain/player";
import { Round } from "@/modules/tournament/domain/round";
import { Team } from "@/modules/tournament/domain/team";
import { Tournament } from "@/modules/tournament/domain/tournament";
import { Place } from "@/modules/places/domain/place";
import { Referee } from "@/modules/referees/domain/referee";
import { TeamStats } from "@/modules/tournament/domain/standings";
import { DashboardStats } from "@/modules/tournament/domain/dashboard-stats";
import { TournamentRepository } from "@/modules/tournament/domain/tournament-repository";

export interface ContextState {
  tournaments: Tournament[];
  teams: Team[];
  matches: Match[];
  rounds: Round[];
  standings: TeamStats[];
  getTournamentById: (id: string) => Promise<Tournament | null>;
  getTeams: (tournamentId: string) => Promise<Team[]>;
  getMatches: (tournamentId: string) => Promise<Match[]>;
  getRounds: (tournamentId: string) => Promise<Round[]>;
  createTournament: (tournament: Tournament) => Promise<void>;
  createTeam: ({
    tournamentId,
    team,
  }: {
    tournamentId: string;
    team: Team;
  }) => Promise<void>;
  updateTeam: ({
    tournamentId,
    team,
  }: {
    tournamentId: string;
    team: Team;
  }) => Promise<void>;
  createPlayer: ({
    teamId,
    player,
    tournamentId,
  }: {
    teamId: string;
    player: Player;
    tournamentId?: string;
  }) => Promise<void>;
  updatePlayer: ({
    player,
    tournamentId,
  }: {
    player: Player;
    tournamentId: string;
  }) => Promise<void>;
  createMatch: ({
    tournamentId,
    match,
  }: {
    tournamentId: string;
    match: Match;
  }) => Promise<void>;
  updateMatch: (match: Match) => Promise<void>;
  addMatchResult: (
    matchId: string,
    result: { scoreA: number; scoreB: number },
  ) => Promise<void>;
  addMatchIncident: (
    matchId: string,
    incident: Omit<Match["incidents"][0], "id">,
  ) => Promise<void>;
  deleteMatchIncident: (matchId: string, incidentId: string) => Promise<void>;
  deleteMatch: ({
    matchId,
    tournamentId,
  }: {
    matchId: string;
    tournamentId: string;
  }) => Promise<void>;
  deleteTeam: ({
    teamId,
    tournamentId,
  }: {
    teamId: string;
    tournamentId: string;
  }) => Promise<void>;
  deletePlayer: ({
    playerId,
    tournamentId,
  }: {
    playerId: string;
    tournamentId: string;
  }) => Promise<void>;
  deletePlace: ({
    placeId,
    tournamentId,
  }: {
    placeId: string;
    tournamentId: string;
  }) => Promise<void>;
  deleteRound: ({
    roundId,
    tournamentId,
  }: {
    roundId: string;
    tournamentId: string;
  }) => Promise<void>;
  deleteReferee: ({
    refereeId,
    tournamentId,
  }: {
    refereeId: string;
    tournamentId: string;
  }) => Promise<void>;
  deleteTournament: (tournamentId: string) => Promise<void>;
  getDashboardStats: () => Promise<DashboardStats>;
  createRound: ({
    tournamentId,
    round,
  }: {
    tournamentId: string;
    round: Round;
  }) => Promise<void>;
  places: Place[];
  getPlaces: (tournamentId: string) => Promise<Place[]>;
  referees: Referee[];
  getReferees: (tournamentId: string) => Promise<Referee[]>;
  getAllReferees: () => Promise<Referee[]>;
  getRefereeMe: () => Promise<Referee | null>;
  getPlayerMe: () => Promise<Player | null>;
  getMatchesByRefereeId: (refereeId: string) => Promise<Match[]>;
  getStandings: (tournamentId: string) => Promise<TeamStats[]>;
  createReferee: ({
    tournamentId,
    referee,
  }: {
    tournamentId: string;
    referee: Referee;
  }) => Promise<void>;
  updateReferee: (referee: Referee) => Promise<void>;
  generateFixtures: (tournamentId: string) => Promise<void>;
  generateScenario: (params: any) => Promise<{ tournamentId: string }>;
}

export const TournamentContext = React.createContext({} as ContextState);

export const TournamentContextProvider = ({
  children,
  repository,
}: React.PropsWithChildren<{ repository: TournamentRepository }>) => {
  const { isAuthenticated } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [referees, setReferees] = useState<Referee[]>([]);
  const [standings, setStandings] = useState<TeamStats[]>([]);

  const getTournaments = useCallback(async () => {
    if (isAuthenticated) {
      return repository.getMyTournaments().then((tournaments) => {
        setTournaments(tournaments);
      });
    }
    return getAllTournaments(repository).then((tournaments) => {
      setTournaments(tournaments);
    });
  }, [repository, isAuthenticated]);

  const create = useCallback(
    async ({ name, location, startDate, endDate }: Tournament) => {
      let id = crypto.randomUUID();

      await createTournament(repository, {
        id,
        name,
        location,
        startDate,
        endDate,
      });
      getTournaments();
    },
    [repository, getTournaments],
  );

  const getTeams = useCallback(
    async (tournamentId: string) => {
      return getAllTeams(repository, tournamentId).then((teams) => {
        setTeams(teams);
        return teams;
      });
    },
    [repository],
  );

  const getMatches = useCallback(
    async (tournamentId: string) => {
      const { getAllMatches } =
        await import("@/modules/tournament/application/get-all/get-all-matches");
      return getAllMatches(repository, tournamentId).then((matches) => {
        setMatches(matches);
        return matches;
      });
    },
    [repository],
  );

  const createTeam = useCallback(
    async ({ tournamentId, team }: { tournamentId: string; team: Team }) => {
      await createTeamCase(repository, tournamentId, team);
      getTeams(tournamentId);
    },
    [repository, getTeams],
  );

  const updateTeam = useCallback(
    async ({ tournamentId, team }: { tournamentId: string; team: Team }) => {
      await repository.updateTeam(team);
      getTeams(tournamentId);
    },
    [repository, getTeams],
  );

  const createPlayer = useCallback(
    async ({
      teamId,
      player,
      tournamentId,
    }: {
      teamId: string;
      player: Player;
      tournamentId?: string;
    }) => {
      const createPlayerCase = (
        await import("@/modules/tournament/application/create/create-player")
      ).createPlayer;
      await createPlayerCase(repository, teamId, player);
      if (tournamentId) {
        getTeams(tournamentId);
      }
    },
    [repository, getTeams],
  );

  const updatePlayer = useCallback(
    async ({
      player,
      tournamentId,
    }: {
      player: Player;
      tournamentId: string;
    }) => {
      await repository.updatePlayer(player);
      getTeams(tournamentId);
    },
    [repository, getTeams],
  );

  const createMatch = useCallback(
    async ({ tournamentId, match }: { tournamentId: string; match: Match }) => {
      const { createMatch: createMatchCase } =
        await import("@/modules/tournament/application/create/create-match");
      await createMatchCase(repository, tournamentId, match);
      getMatches(tournamentId);
    },
    [repository, getMatches],
  );

  const getRounds = useCallback(
    async (tournamentId: string) => {
      const { getAllRounds } =
        await import("@/modules/tournament/application/get-all/get-all-rounds");
      return getAllRounds(repository, tournamentId).then((rounds) => {
        setRounds(rounds);
        return rounds;
      });
    },
    [repository],
  );

  const getPlaces = useCallback(
    async (tournamentId: string) => {
      return repository.getPlacesByTournamentId(tournamentId).then((places) => {
        setPlaces(places);
        return places;
      });
    },
    [repository],
  );

  const getReferees = useCallback(
    async (tournamentId: string) => {
      return repository
        .getRefereesByTournamentId(tournamentId)
        .then((referees) => {
          setReferees(referees);
          return referees;
        });
    },
    [repository],
  );

  const getStandings = useCallback(
    async (tournamentId: string) => {
      return repository.getStandings(tournamentId).then((standings) => {
        setStandings(standings);
        return standings;
      });
    },
    [repository],
  );

  const generateFixtures = useCallback(
    async (tournamentId: string) => {
      await repository.generateFixtures(tournamentId);
      // Refresh everything after generation
      getRounds(tournamentId);
      getMatches(tournamentId);
    },
    [repository, getRounds, getMatches],
  );

  const createReferee = useCallback(
    async ({
      tournamentId,
      referee,
    }: {
      tournamentId: string;
      referee: Referee;
    }) => {
      await repository.saveReferee({ tournamentId, referee });
      getReferees(tournamentId);
    },
    [repository, getReferees],
  );

  const createRound = useCallback(
    async ({ tournamentId, round }: { tournamentId: string; round: Round }) => {
      const { createRound: createRoundCase } =
        await import("@/modules/tournament/application/create/create-round");
      await createRoundCase(repository, tournamentId, round);
      getRounds(tournamentId);
    },
    [repository, getRounds],
  );

  const getTournamentById = useCallback(
    async (id: string) => {
      return repository.get(id);
    },
    [repository],
  );

  useEffect(() => {
    getTournaments();
  }, [getTournaments]);

  return (
    <TournamentContext.Provider
      value={{
        tournaments,
        teams,
        matches,
        rounds,
        places,
        referees,
        standings,
        createTournament: create, // Renamed in ContextState as well
        createTeam,
        updateTeam,
        createPlayer,
        updatePlayer,
        createRound,
        getTeams,
        getMatches,
        getRounds,
        getPlaces,
        getReferees,
        getAllReferees: async () => repository.getAllReferees(),
        getRefereeMe: async () => repository.getRefereeMe(),
        getPlayerMe: async () => repository.getPlayerMe(),
        getMatchesByRefereeId: async (refereeId: string) => {
          const matches = await repository.getMatchesByRefereeId(refereeId);
          setMatches(matches);
          return matches;
        },
        getStandings,
        generateFixtures,
        createReferee,
        updateReferee: async (referee: Referee) => {
          await repository.updateReferee(referee);
          // We might need to refresh referees list if we are in a context where it matters
          // But usually getReferees is called by the component
        },
        createMatch,
        addMatchResult: async (
          matchId: string,
          result: { scoreA: number; scoreB: number },
        ) => {
          await repository.addMatchResult(matchId, result);
        },
        addMatchIncident: async (
          matchId: string,
          incident: Omit<Match["incidents"][0], "id">,
        ) => {
          await repository.addMatchIncident(matchId, incident);
        },
        deleteMatchIncident: async (matchId: string, incidentId: string) => {
          await repository.deleteMatchIncident(matchId, incidentId);
        },
        updateMatch: async (match: Match) => {
          await repository.updateMatch(match);
          const { tournamentId } = match;
          await getMatches(tournamentId);
        },
        generateScenario: async (params: any) => {
          const result = await repository.generateScenario(params);
          await getTournaments();
          return result;
        },
        deleteMatch: async ({
          matchId,
          tournamentId,
        }: {
          matchId: string;
          tournamentId: string;
        }) => {
          await repository.deleteMatch(matchId);
          await getMatches(tournamentId);
        },
        deleteTeam: async ({
          teamId,
          tournamentId,
        }: {
          teamId: string;
          tournamentId: string;
        }) => {
          await repository.deleteTeam(teamId);
          await getTeams(tournamentId);
        },
        deletePlayer: async ({
          playerId,
          tournamentId,
        }: {
          playerId: string;
          tournamentId: string;
        }) => {
          await repository.deletePlayer(playerId);
          await getTeams(tournamentId);
        },
        deletePlace: async ({
          placeId,
          tournamentId,
        }: {
          placeId: string;
          tournamentId: string;
        }) => {
          await repository.deletePlace(placeId);
          await getPlaces(tournamentId);
        },
        deleteRound: async ({
          roundId,
          tournamentId,
        }: {
          roundId: string;
          tournamentId: string;
        }) => {
          await repository.deleteRound(roundId);
          await getRounds(tournamentId);
        },
        deleteReferee: async ({
          refereeId,
          tournamentId,
        }: {
          refereeId: string;
          tournamentId: string;
        }) => {
          await repository.deleteReferee(refereeId);
          await getReferees(tournamentId);
        },
        deleteTournament: async (tournamentId: string) => {
          await repository.deleteTournament(tournamentId);
          await getTournaments();
        },
        getDashboardStats: async () => repository.getDashboardStats(),
        getTournamentById,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournamentContext = () => useContext(TournamentContext);
