import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import RefereeSection from "@/components/RefereeSection";

const useTournamentContextMock = vi.hoisted(() => vi.fn());
const useAuthMock = vi.hoisted(() => vi.fn());

vi.mock("@/sections/tournaments/tournaments-context", () => ({
  useTournamentContext: useTournamentContextMock,
}));

vi.mock("@/sections/tournaments/auth-context", () => ({
  useAuth: useAuthMock,
  UserRole: { SUPER_ADMIN: "SUPER_ADMIN", TOURNAMENT_ADMIN: "TOURNAMENT_ADMIN" },
}));

const getReferees = vi.fn();
const getAllReferees = vi.fn();
const updateReferee = vi.fn();
const deleteReferee = vi.fn();

const referees = [
  { id: "ref-1", name: "Ana Pérez", email: "ana@ref.com", userId: "u1", tournamentIds: ["t1"] },
  { id: "ref-2", name: "Luis Gómez", email: "", tournamentIds: ["t1"] },
];
const tournaments = [
  { id: "t1", name: "Torneo A", ownerId: "user-1", location: "", startDate: "", endDate: "" },
];

beforeEach(() => {
  getReferees.mockReset();
  getAllReferees.mockReset();
  updateReferee.mockReset();
  deleteReferee.mockReset();
  useAuthMock.mockReset();
  useTournamentContextMock.mockReset();
  getReferees.mockResolvedValue(undefined);
  getAllReferees.mockResolvedValue([]);
  useAuthMock.mockReturnValue({
    isAuthenticated: true,
    user: { id: "user-1", role: "TOURNAMENT_ADMIN" },
  });
});

describe("RefereeSection", () => {
  it("shows the referees after loading", async () => {
    useTournamentContextMock.mockReturnValue({
      getReferees,
      referees,
      tournaments,
      getAllReferees,
      updateReferee,
      deleteReferee,
    });
    render(<RefereeSection tournamentId="t1" />);

    expect(await screen.findByText("Ana Pérez")).toBeInTheDocument();
    expect(screen.getByText("Luis Gómez")).toBeInTheDocument();
    expect(screen.getByText("ana@ref.com")).toBeInTheDocument();
    expect(screen.getByText("Referees.noEmail")).toBeInTheDocument();
  });

  it("shows the empty state", async () => {
    useTournamentContextMock.mockReturnValue({
      getReferees,
      referees: [],
      tournaments,
      getAllReferees,
      updateReferee,
      deleteReferee,
    });
    render(<RefereeSection tournamentId="t1" />);

    expect(await screen.findByText("Referees.emptyTitle")).toBeInTheDocument();
  });

  it("deletes a referee after confirming", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    useTournamentContextMock.mockReturnValue({
      getReferees,
      referees,
      tournaments,
      getAllReferees,
      updateReferee,
      deleteReferee,
    });
    render(<RefereeSection tournamentId="t1" />);

    await screen.findByText("Ana Pérez");
    await user.click(screen.getAllByRole("button", { name: "Common.delete" })[0]);

    expect(confirmSpy).toHaveBeenCalledWith("Referees.deleteConfirm");
    expect(deleteReferee).toHaveBeenCalledWith({
      refereeId: "ref-1",
      tournamentId: "t1",
    });
  });

  it("opens the link modal and loads the available referees", async () => {
    const user = userEvent.setup();
    getAllReferees.mockResolvedValueOnce([
      { id: "ref-3", name: "Marta Sol", email: "marta@ref.com" },
    ]);
    useTournamentContextMock.mockReturnValue({
      getReferees,
      referees,
      tournaments,
      getAllReferees,
      updateReferee,
      deleteReferee,
    });
    render(<RefereeSection tournamentId="t1" />);

    await screen.findByText("Ana Pérez");
    await user.click(screen.getByRole("button", { name: "Referees.linkExisting" }));

    expect(getAllReferees).toHaveBeenCalled();
    expect(await screen.findByText("Referees.linkTitle")).toBeInTheDocument();
  });

  it("shows no available referees when all are already linked", async () => {
    const user = userEvent.setup();
    getAllReferees.mockResolvedValueOnce([
      { id: "ref-1", name: "Ana Pérez", email: "ana@ref.com" },
      { id: "ref-2", name: "Luis Gómez", email: "" },
    ]);
    useTournamentContextMock.mockReturnValue({
      getReferees,
      referees,
      tournaments,
      getAllReferees,
      updateReferee,
      deleteReferee,
    });
    render(<RefereeSection tournamentId="t1" />);

    await screen.findByText("Ana Pérez");
    await user.click(screen.getByRole("button", { name: "Referees.linkExisting" }));

    expect(await screen.findByText("Referees.noAvailable")).toBeInTheDocument();
  });

  it("confirm link button is disabled when no referee is selected", async () => {
    const user = userEvent.setup();
    getAllReferees.mockResolvedValueOnce([
      { id: "ref-3", name: "Marta Sol", email: "marta@ref.com" },
    ]);
    useTournamentContextMock.mockReturnValue({
      getReferees,
      referees,
      tournaments,
      getAllReferees,
      updateReferee,
      deleteReferee,
    });
    render(<RefereeSection tournamentId="t1" />);

    await screen.findByText("Ana Pérez");
    await user.click(screen.getByRole("button", { name: "Referees.linkExisting" }));

    expect(await screen.findByText("Referees.linkTitle")).toBeInTheDocument();
    const confirmButton = screen.getByRole("button", { name: "Referees.confirmLink" });
    expect(confirmButton).toBeDisabled();
  });
});
