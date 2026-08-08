import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import TournamentItem from "@/components/TournamentItem";

const useTournamentContextMock = vi.hoisted(() => vi.fn());

vi.mock("@/sections/tournaments/tournaments-context", () => ({
  useTournamentContext: useTournamentContextMock,
}));

const tournament = {
  id: "t1",
  name: "Copa 2026",
  location: "Rosario",
  startDate: "2026-09-01",
  endDate: "2026-11-30",
  ownerId: "user-1",
};

const teams = [
  { id: "team-a", name: "Alpha FC", tournaments: ["t1"] },
  { id: "team-b", name: "Beta SC", tournaments: ["t1"] },
  { id: "team-c", name: "Gamma", tournaments: ["t2"] },
];

beforeEach(() => {
  useTournamentContextMock.mockReset();
});

describe("TournamentItem", () => {
  it("renders the tournament details and its team count", () => {
    useTournamentContextMock.mockReturnValue({ tournaments: [tournament], teams });
    render(<TournamentItem id="t1" />);

    expect(screen.getByText("Copa 2026")).toBeInTheDocument();
    expect(screen.getByText("Rosario")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Common.official")).toBeInTheDocument();
    expect(screen.getByText("TournamentDetail.publicLink")).toHaveAttribute(
      "href",
      "/t/t1",
    );
  });

  it("returns null when the tournament is not found", () => {
    useTournamentContextMock.mockReturnValue({ tournaments: [], teams: [] });
    const { container } = render(<TournamentItem id="missing" />);
    expect(container).toBeEmptyDOMElement();
  });
});
