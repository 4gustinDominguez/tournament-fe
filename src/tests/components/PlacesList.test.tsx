import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PlacesList } from "@/components/PlacesList";

const useTournamentContextMock = vi.hoisted(() => vi.fn());
const useAuthMock = vi.hoisted(() => vi.fn());
const getAllMock = vi.hoisted(() => vi.fn());
const deletePlaceMock = vi.hoisted(() => vi.fn());

vi.mock("@/sections/tournaments/tournaments-context", () => ({
  useTournamentContext: useTournamentContextMock,
}));

vi.mock("@/sections/tournaments/auth-context", () => ({
  useAuth: useAuthMock,
  UserRole: { SUPER_ADMIN: "SUPER_ADMIN" },
}));

vi.mock("@/modules/places/infrastructure/api-place-repository", () => ({
  createApiPlaceRepository: () => ({ getAll: getAllMock, save: vi.fn() }),
}));

const places = [
  { id: "place-1", name: "Estadio Central", tournamentId: "t1", location: "Centro", capacity: 5000 },
  { id: "place-2", name: "Parque Este", tournamentId: "t1", location: "Este", capacity: 0 },
];

const tournaments = [
  { id: "t1", name: "Torneo A", ownerId: "user-1", location: "", startDate: "", endDate: "" },
];

beforeEach(() => {
  getAllMock.mockReset();
  deletePlaceMock.mockReset();
  useAuthMock.mockReset();
  useTournamentContextMock.mockReset();
  useTournamentContextMock.mockReturnValue({
    deletePlace: deletePlaceMock,
    tournaments,
  });
});

describe("PlacesList", () => {
  it("loads and shows the venues", async () => {
    getAllMock.mockResolvedValueOnce(places);
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: "user-1", role: "TOURNAMENT_ADMIN" },
    });
    render(<PlacesList refreshTrigger={0} tournamentId="t1" />);

    expect(getAllMock).toHaveBeenCalledWith("t1");
    expect(await screen.findByText("Estadio Central")).toBeInTheDocument();
    expect(screen.getByText("Parque Este")).toBeInTheDocument();
    expect(screen.getByText("Centro")).toBeInTheDocument();
    expect(screen.getByText("Places.spectators")).toBeInTheDocument();
  });

  it("shows the empty state", async () => {
    getAllMock.mockResolvedValueOnce([]);
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: "user-1", role: "TOURNAMENT_ADMIN" },
    });
    render(<PlacesList refreshTrigger={0} tournamentId="t1" />);

    expect(await screen.findByText("Places.emptyTitle")).toBeInTheDocument();
  });

  it("deletes a venue after confirming", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    getAllMock.mockResolvedValueOnce(places);
    deletePlaceMock.mockResolvedValueOnce(undefined);
    getAllMock.mockResolvedValueOnce([places[1]]);
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: "user-1", role: "TOURNAMENT_ADMIN" },
    });
    render(<PlacesList refreshTrigger={0} tournamentId="t1" />);

    await screen.findByText("Estadio Central");
    await user.click(screen.getAllByRole("button", { name: "Common.delete" })[0]);

    expect(confirmSpy).toHaveBeenCalledWith("Places.deleteConfirm");
    expect(deletePlaceMock).toHaveBeenCalledWith({
      placeId: "place-1",
      tournamentId: "t1",
    });
  });

  it("does not show the delete button without permission", async () => {
    getAllMock.mockResolvedValueOnce(places);
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: "other", role: "REFEREE" },
    });
    render(<PlacesList refreshTrigger={0} tournamentId="t1" />);

    await screen.findByText("Estadio Central");
    expect(screen.queryByRole("button", { name: "Common.delete" })).not.toBeInTheDocument();
  });
});
