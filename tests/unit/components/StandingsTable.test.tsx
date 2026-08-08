import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import StandingsTable from "@/components/StandingsTable";
import type { TeamStats } from "@/modules/tournament/domain/standings";

const standings: TeamStats[] = [
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
  {
    teamId: "3",
    teamName: "Los Dragones",
    played: 2,
    won: 0,
    drawn: 1,
    lost: 1,
    goalsFor: 1,
    goalsAgainst: 1,
    goalDifference: 0,
    points: 1,
  },
];

describe("StandingsTable", () => {
  it("renders one row per team", () => {
    render(<StandingsTable standings={standings} />);
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(standings.length + 1);
  });

  it("shows the team names and points", () => {
    render(<StandingsTable standings={standings} />);
    expect(screen.getByText("Los Rayos")).toBeInTheDocument();
    expect(screen.getByText("Las Águilas")).toBeInTheDocument();
    expect(screen.getByText("Los Dragones")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
  });

  it("displays positive goal difference with a plus sign", () => {
    render(<StandingsTable standings={standings} />);
    expect(screen.getByText("+4")).toBeInTheDocument();
  });

  it("displays negative goal difference without a plus sign", () => {
    render(<StandingsTable standings={standings} />);
    expect(screen.getByText("-1")).toBeInTheDocument();
  });

  it("renders the empty state when there are no standings", () => {
    render(<StandingsTable standings={[]} />);
    expect(screen.getByText("Standings.empty")).toBeInTheDocument();
  });

  it("numbers teams starting from 1", () => {
    render(<StandingsTable standings={standings} />);
    const rows = screen.getAllByRole("row");
    const firstCellOf = (row: HTMLElement) =>
      within(row).getAllByRole("cell")[0];
    expect(firstCellOf(rows[1])).toHaveTextContent("1");
    expect(firstCellOf(rows[2])).toHaveTextContent("2");
    expect(firstCellOf(rows[3])).toHaveTextContent("3");
  });
});
