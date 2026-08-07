import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { PlacesSection } from "@/components/PlacesSection";

const useTournamentContextMock = vi.hoisted(() => vi.fn());
const useAuthMock = vi.hoisted(() => vi.fn());
const getAllMock = vi.hoisted(() => vi.fn());
const saveMock = vi.hoisted(() => vi.fn());

vi.mock("@/sections/tournaments/tournaments-context", () => ({
  useTournamentContext: useTournamentContextMock,
}));

vi.mock("@/sections/tournaments/auth-context", () => ({
  useAuth: useAuthMock,
  UserRole: { SUPER_ADMIN: "SUPER_ADMIN" },
}));

vi.mock("@/modules/places/infrastructure/api-place-repository", () => ({
  createApiPlaceRepository: () => ({ getAll: getAllMock, save: saveMock }),
}));

const tournaments = [
  { id: "t1", name: "Torneo A", ownerId: "user-1", location: "", startDate: "", endDate: "" },
];

const places = [
  { id: "place-1", name: "Estadio Central", tournamentId: "t1", location: "Centro", capacity: 5000 },
];

beforeEach(() => {
  getAllMock.mockReset();
  saveMock.mockReset();
  useAuthMock.mockReset();
  useTournamentContextMock.mockReset();
  useTournamentContextMock.mockReturnValue({ tournaments });
});

describe("PlacesSection", () => {
  it("shows the venues list", async () => {
    getAllMock.mockResolvedValueOnce(places);
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: "user-1", role: "TOURNAMENT_ADMIN" },
    });
    render(<PlacesSection tournamentId="t1" />);

    expect(await screen.findByText("Estadio Central")).toBeInTheDocument();
  });

  it("shows the registration form for an owner", async () => {
    getAllMock.mockResolvedValueOnce([]);
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: "user-1", role: "TOURNAMENT_ADMIN" },
    });
    render(<PlacesSection tournamentId="t1" />);

    expect(await screen.findByText("Places.register")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("CreatePlaceForm.namePlaceholder"),
    ).toBeInTheDocument();
  });

  it("hides the registration form without permission", async () => {
    getAllMock.mockResolvedValueOnce([]);
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: "other", role: "PLAYER" },
    });
    render(<PlacesSection tournamentId="t1" />);

    await screen.findByText("Places.title");
    expect(screen.queryByText("Places.register")).not.toBeInTheDocument();
  });
});
