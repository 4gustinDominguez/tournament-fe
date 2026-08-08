import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { TournamentList } from "@/components/TournamentList";
import type { Tournament } from "@/modules/tournament/domain/tournament";

const useTournamentContextMock = vi.hoisted(() => vi.fn());

vi.mock("@/sections/tournaments/tournaments-context", () => ({
  useTournamentContext: useTournamentContextMock,
}));

const dayInMs = 24 * 60 * 60 * 1000;
const now = Date.now();

const upcoming: Tournament = {
  id: "t-upcoming",
  name: "Torneo Futuro",
  location: "Madrid",
  startDate: new Date(now + 10 * dayInMs).toISOString(),
  endDate: new Date(now + 20 * dayInMs).toISOString(),
};

const ongoing: Tournament = {
  id: "t-ongoing",
  name: "Torneo En Curso",
  location: "Buenos Aires",
  startDate: new Date(now - 5 * dayInMs).toISOString(),
  endDate: new Date(now + 5 * dayInMs).toISOString(),
};

const finished: Tournament = {
  id: "t-finished",
  name: "Torneo Terminado",
  location: "Lima",
  startDate: new Date(now - 20 * dayInMs).toISOString(),
  endDate: new Date(now - 10 * dayInMs).toISOString(),
};

describe("TournamentList", () => {
  it("shows the empty state when there are no tournaments", () => {
    useTournamentContextMock.mockReturnValue({ tournaments: [] });
    render(<TournamentList />);
    expect(screen.getByText("Tournaments.noTournaments")).toBeInTheDocument();
  });

  it("renders one card per tournament with name and location", () => {
    useTournamentContextMock.mockReturnValue({ tournaments: [upcoming, ongoing] });
    render(<TournamentList />);
    expect(screen.getByText("Torneo Futuro")).toBeInTheDocument();
    expect(screen.getByText("Madrid")).toBeInTheDocument();
    expect(screen.getByText("Torneo En Curso")).toBeInTheDocument();
    expect(screen.getByText("Buenos Aires")).toBeInTheDocument();
  });

  it("links each card to its tournament detail page", () => {
    useTournamentContextMock.mockReturnValue({ tournaments: [upcoming] });
    render(<TournamentList />);
    const link = screen.getByRole("link", { name: /Torneo Futuro/ });
    expect(link).toHaveAttribute(
      "href",
      `/manage/my-tournaments/${upcoming.id}`,
    );
  });

  it("labels a future tournament as upcoming", () => {
    useTournamentContextMock.mockReturnValue({ tournaments: [upcoming] });
    render(<TournamentList />);
    const card = screen.getByText("Torneo Futuro").closest("div");
    expect(within(card!).getByText("Common.status.upcoming")).toBeInTheDocument();
  });

  it("labels a tournament running now as ongoing", () => {
    useTournamentContextMock.mockReturnValue({ tournaments: [ongoing] });
    render(<TournamentList />);
    const card = screen.getByText("Torneo En Curso").closest("div");
    expect(within(card!).getByText("Common.status.ongoing")).toBeInTheDocument();
  });

  it("labels a finished tournament as finished", () => {
    useTournamentContextMock.mockReturnValue({ tournaments: [finished] });
    render(<TournamentList />);
    const card = screen.getByText("Torneo Terminado").closest("div");
    expect(within(card!).getByText("Common.status.finished")).toBeInTheDocument();
  });
});
