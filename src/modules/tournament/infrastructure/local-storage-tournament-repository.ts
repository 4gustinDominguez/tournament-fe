import { Match } from "../domain/match";
import { Player } from "../domain/player";
import { Round } from "../domain/round";
import { Team } from "../domain/team";
import { Tournament } from "../domain/tournament";
import { TournamentRepository } from "../domain/tournament-repository";

export function createLocalStorageTournamentRepository(): TournamentRepository {
    return {
        save,
        get,
        getAll,
        saveTeam,
        getAllTeamsByTournamentId,
        savePlayer,
        saveMatch,
        updateMatch,
        deleteMatch,
        getMatchesByTournamentId: async () => [],
        saveRound,
        getRoundsByTournamentId,
        generateFixtures: async () => { },
        getStandings: async () => [],
        updateTeam: async () => { },
        updatePlayer: async () => { },
        addMatchResult: async () => { },
        addMatchIncident: async () => { },
        deleteMatchIncident: async () => { },
        getPlacesByTournamentId: async () => [],
        getRefereesByTournamentId: async () => [],
        getAllReferees: async () => [],
        getRefereeMe: async () => null,
        saveReferee: async () => { },
        updateReferee: async () => { },
        getMyTournaments: async () => [],
        getMatchesByRefereeId: async () => [],
        generateScenario: async () => ({ tournamentId: "" }),
    }

    // save tournament 
    async function save(tournament: Tournament) {
        const tournaments = getAllFromLocalStorage();

        tournaments.set(tournament.id, tournament);
        localStorage.setItem("tournaments", JSON.stringify(Array.from(tournaments.entries())));

        await Promise.resolve();
    }

    async function get(id: string) {
        const tournaments = getAllFromLocalStorage();
        const tournament = tournaments.get(id);

        if (!tournament) {
            return Promise.resolve(null);
        }

        return Promise.resolve(tournament);
    }

    // get all tournaments
    async function getAll() {
        const tournaments = getAllFromLocalStorage();

        return Promise.resolve(Array.from(tournaments.values()));
    }

    async function getAllTeamsByTournamentId(tournamentId: string) {
        const teams = getAllTeamFromLocalStorage();

        let filterTeams = new Map<string, Team>();
        teams.forEach((team) => {
            if (team.tournaments.includes(tournamentId)) {
                filterTeams.set(team.id, team);
            }
        });

        return Promise.resolve(Array.from(filterTeams.values()));
    }

    async function saveTeam({ tournamentId, team }: { tournamentId: string, team: Team }) {
        const tournaments = getAllFromLocalStorage();
        const teams = getAllTeamFromLocalStorage();
        const tournament = tournaments.get(tournamentId);

        if (!tournament) {
            throw new Error(`Tournament with id ${tournamentId} not found`);
        }

        teams.set(team.id, team);
        localStorage.setItem("teams", JSON.stringify(Array.from(teams.entries())));

        tournament.teams?.push(team.id);
        localStorage.setItem("tournaments", JSON.stringify(Array.from(tournaments.entries())));

        await Promise.resolve();
    }

    async function savePlayer({ teamId, player }: { teamId: string, player: Player }) {
        const teams = getAllTeamFromLocalStorage();
        const team = teams.get(teamId);

        if (!team) {
            throw new Error(`Team with id ${teamId} not found`);
        }

        if (!team.player) {
            team.player = [];
        }

        team.player.push(player);
        teams.set(teamId, team);
        localStorage.setItem("teams", JSON.stringify(Array.from(teams.entries())));

        await Promise.resolve();
    }

    function getAllFromLocalStorage(): Map<string, Tournament> {
        const tournaments = localStorage.getItem("tournaments");

        if (tournaments === null) {
            return new Map();
        }

        const map = new Map(JSON.parse(tournaments) as Iterable<[string, Tournament]>);

        return map;
    }

    function getAllTeamFromLocalStorage(): Map<string, Team> {
        const teams = localStorage.getItem("teams");

        if (teams === null) {
            return new Map();
        }

        const map = new Map(JSON.parse(teams) as Iterable<[string, Team]>);

        return map;
    }

    async function saveMatch({ tournamentId, match }: { tournamentId: string, match: Match }) {
        console.log("Saving match in local storage", tournamentId, match);
        await Promise.resolve();
    }

    async function updateMatch(match: Match) {
        console.log("Updating match in local storage", match);
        await Promise.resolve();
    }

    async function saveRound({ tournamentId, round }: { tournamentId: string, round: Round }) {
        console.log("Saving round in local storage", tournamentId, round);
        await Promise.resolve();
    }

    async function getRoundsByTournamentId(tournamentId: string): Promise<Round[]> {
        console.log("Getting rounds from local storage", tournamentId);
        return Promise.resolve([]);
    }

    async function deleteMatch(matchId: string) {
        console.log("Deleting match in local storage", matchId);
        await Promise.resolve();
    }
}