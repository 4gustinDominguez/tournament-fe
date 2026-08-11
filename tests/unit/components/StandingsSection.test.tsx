import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import StandingsSection from "@/components/StandingsSection";

const useTournamentContextMock = vi.hoisted(() => vi.fn());
const getStandingsMock = vi.hoisted(() => vi.fn());

vi.mock("@/sections/tournaments/tournaments-context", () => ({
  useTournamentContext: useTournamentContextMock,
}));

const standings = [
  {
    teamId: "1",
    teamName: "Los Rayos",
    played: 2,
    won: 2,
    drawn: 0,
    lost: 0,
    goalsFor: 5,
    goalsAgainst: 1,
    goalDifference: 4,
    points: 6,
  },
  {
    teamId: "2",
    teamName: "Las Águilas",
    played: 2,
    won: 0,
    drawn: 1,
    lost: 1,
    goalsFor: 2,
    goalsAgainst: 3,
    goalDifference: -1,
    points: 1,
  },
];

beforeEach(() => {
  getStandingsMock.mockReset();
  useTournamentContextMock.mockReset();
});

describe("StandingsSection", () => {
  it("shows a loading skeleton and then the empty state", async () => {
    getStandingsMock.mockResolvedValueOnce(undefined);
    useTournamentContextMock.mockReturnValue({
      getStandings: getStandingsMock,
      standings: [],
    });
    const { container } = render(<StandingsSection tournamentId="t1" />);

    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
    expect(getStandingsMock).toHaveBeenCalledWith("t1");

    expect(await screen.findByText("Standings.empty")).toBeInTheDocument();
  });

  it("highlights the leader, top scorer and best defense", async () => {
    getStandingsMock.mockResolvedValueOnce(undefined);
    useTournamentContextMock.mockReturnValue({
      getStandings: getStandingsMock,
      standings,
      teams: [
        { id: "1", name: "Los Rayos", tournaments: [] },
        { id: "2", name: "Las Águilas", tournaments: [] },
      ],
    });
    render(<StandingsSection tournamentId="t1" />);

    const leader = await screen.findAllByText("Los Rayos");
    expect(leader.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Las Águilas")).toBeInTheDocument();
  });
});
