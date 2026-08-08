import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MatchesSection from "@/components/MatchesSection";

const useTournamentContextMock = vi.hoisted(() => vi.fn());
const useAuthMock = vi.hoisted(() => vi.fn());

vi.mock("@/sections/tournaments/tournaments-context", () => ({
  useTournamentContext: useTournamentContextMock,
}));

vi.mock("@/sections/tournaments/auth-context", () => ({
  useAuth: useAuthMock,
  UserRole: { SUPER_ADMIN: "SUPER_ADMIN", TOURNAMENT_ADMIN: "TOURNAMENT_ADMIN" },
}));

const getMatches = vi.fn();
const getRounds = vi.fn();
const getTeams = vi.fn();
const getPlaces = vi.fn();
const getReferees = vi.fn();
const deleteMatch = vi.fn();
const deleteRound = vi.fn();
const generateFixtures = vi.fn();

const rounds = [{ id: "r1", name: "Jornada 1", tournamentId: "t1" }];
const teams = [
  { id: "team-a", name: "Alpha FC", tournamentId: "t1", player: [] },
  { id: "team-b", name: "Beta SC", tournamentId: "t1", player: [] },
];
const places = [{ id: "place-1", name: "Estadio Central", tournamentId: "t1" }];
const referees = [{ id: "ref-1", name: "Ana Pérez", tournamentIds: ["t1"] }];
const tournaments = [
  { id: "t1", name: "Torneo A", ownerId: "user-1", location: "", startDate: "", endDate: "" },
];
const matches = [
  {
    id: "m1",
    tournamentId: "t1",
    roundId: "r1",
    teamAId: "team-a",
    teamBId: "team-b",
    date: new Date("2026-08-15T18:00:00"),
    placeId: "place-1",
    refereeId: "ref-1",
    status: "scheduled",
    result: null,
    incidents: [],
  },
];

const baseContext = () => ({
  getMatches,
  matches,
  teams,
  getTeams,
  deleteMatch,
  deleteRound,
  getRounds,
  rounds,
  places,
  getPlaces,
  referees,
  getReferees,
  generateFixtures,
  tournaments,
});

beforeEach(() => {
  getMatches.mockReset();
  getRounds.mockReset();
  getTeams.mockReset();
  getPlaces.mockReset();
  getReferees.mockReset();
  deleteMatch.mockReset();
  deleteRound.mockReset();
  generateFixtures.mockReset();
  useAuthMock.mockReset();
  useTournamentContextMock.mockReset();
  getMatches.mockResolvedValue(undefined);
  getRounds.mockResolvedValue(undefined);
  getTeams.mockResolvedValue(undefined);
  getPlaces.mockResolvedValue(undefined);
  getReferees.mockResolvedValue(undefined);
  useAuthMock.mockReturnValue({
    isAuthenticated: true,
    user: { id: "user-1", role: "TOURNAMENT_ADMIN" },
  });
});

describe("MatchesSection", () => {
  it("shows the rounds and their matches", async () => {
    useTournamentContextMock.mockReturnValue(baseContext());
    render(<MatchesSection tournamentId="t1" />);

    expect(await screen.findByText("Jornada 1")).toBeInTheDocument();
    expect(screen.getByText("Alpha FC")).toBeInTheDocument();
    expect(screen.getByText("Beta SC")).toBeInTheDocument();
    expect(screen.getByText("Estadio Central")).toBeInTheDocument();
    expect(screen.getByText("Ana Pérez")).toBeInTheDocument();
    expect(getMatches).toHaveBeenCalledWith("t1");
    expect(getRounds).toHaveBeenCalledWith("t1");
  });

  it("generates fixtures when confirming from the empty state", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    useTournamentContextMock.mockReturnValue({
      ...baseContext(),
      rounds: [],
      matches: [],
    });
    render(<MatchesSection tournamentId="t1" />);

    await screen.findByText("Matches.emptyTitle");
    await user.click(screen.getByRole("button", { name: "Matches.generate" }));

    expect(confirmSpy).toHaveBeenCalledWith("Matches.generateConfirm");
    expect(generateFixtures).toHaveBeenCalledWith("t1");
  });

  it("deletes a match after confirming", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    useTournamentContextMock.mockReturnValue(baseContext());
    render(<MatchesSection tournamentId="t1" />);

    await screen.findByText("Jornada 1");
    await user.click(screen.getByRole("button", { name: "Common.delete" }));

    expect(confirmSpy).toHaveBeenCalledWith("Matches.deleteConfirm");
    expect(deleteMatch).toHaveBeenCalledWith({ matchId: "m1", tournamentId: "t1" });
  });

  it("opens the edit form when clicking the edit button on a match", async () => {
    const user = userEvent.setup();
    useTournamentContextMock.mockReturnValue(baseContext());
    render(<MatchesSection tournamentId="t1" />);

    await screen.findByText("Jornada 1");

    const editButtons = screen.getAllByRole("button", { name: /Common.edit/i });
    await user.click(editButtons[0]);

    expect(screen.getByText("Matches.editMatch")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Common.cancel" })).toBeInTheDocument();
  });

  it("closes the edit form when cancel is clicked", async () => {
    const user = userEvent.setup();
    useTournamentContextMock.mockReturnValue(baseContext());
    render(<MatchesSection tournamentId="t1" />);

    await screen.findByText("Jornada 1");

    const editButtons = screen.getAllByRole("button", { name: /Common.edit/i });
    await user.click(editButtons[0]);
    expect(screen.getByText("Matches.editMatch")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Common.cancel" }));
    expect(screen.queryByText("Matches.editMatch")).not.toBeInTheDocument();
  });

  it("deletes a round after confirming when the round has no matches", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const roundWithNoMatches = [
      { id: "r-empty", name: "Jornada vacía", tournamentId: "t1" },
    ];
    const matchesEmpty = [] as typeof matches;
    useTournamentContextMock.mockReturnValue({
      ...baseContext(),
      rounds: roundWithNoMatches,
      matches: matchesEmpty,
    });
    render(<MatchesSection tournamentId="t1" />);

    await screen.findByText("Jornada vacía");

    const deleteRoundButtons = screen.getAllByRole("button", { name: /Matches.deleteRound/i });
    await user.click(deleteRoundButtons[deleteRoundButtons.length - 1]);

    expect(confirmSpy).toHaveBeenCalledWith("Matches.deleteRoundConfirm");
    expect(deleteRound).toHaveBeenCalledWith({ roundId: "r-empty", tournamentId: "t1" });
  });

  it("toggles the add match form when clicking add match in a round", async () => {
    const user = userEvent.setup();
    useTournamentContextMock.mockReturnValue(baseContext());
    render(<MatchesSection tournamentId="t1" />);

    await screen.findByText("Jornada 1");

    const addMatchButton = screen.getAllByRole("button", { name: /Matches.addMatch/i })[0];
    await user.click(addMatchButton);

    expect(screen.getByText("Matches.addMatchToRound")).toBeInTheDocument();

    await user.click(addMatchButton);
    expect(screen.queryByText("Matches.addMatchToRound")).not.toBeInTheDocument();
  });
});
