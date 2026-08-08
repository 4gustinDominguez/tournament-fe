import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CreateTournamentForm from "@/components/CreateTournamentForm";

const useAuthMock = vi.hoisted(() => vi.fn());
const createTournamentMock = vi.hoisted(() => vi.fn());

vi.mock("@/sections/tournaments/auth-context", () => ({
  useAuth: useAuthMock,
  UserRole: {
    SUPER_ADMIN: "SUPER_ADMIN",
    TOURNAMENT_ADMIN: "TOURNAMENT_ADMIN",
    REFEREE: "REFEREE",
    PLAYER: "PLAYER",
  },
}));

vi.mock("@/sections/tournaments/tournaments-context", () => ({
  useTournamentContext: () => ({ createTournament: createTournamentMock }),
}));

function renderAsAdmin() {
  useAuthMock.mockReturnValue({
    user: { id: "u1", role: "TOURNAMENT_ADMIN" },
    isAuthenticated: true,
  });
}

beforeEach(() => {
  createTournamentMock.mockReset();
  useAuthMock.mockReset();
});

describe("CreateTournamentForm", () => {
  it("renders nothing for a non-admin user", () => {
    useAuthMock.mockReturnValue({
      user: { id: "u1", role: "REFEREE" },
      isAuthenticated: true,
    });
    render(<CreateTournamentForm />);
    expect(
      screen.queryByText("CreateTournamentForm.name"),
    ).not.toBeInTheDocument();
  });

  it("renders nothing when not authenticated", () => {
    useAuthMock.mockReturnValue({ user: null, isAuthenticated: false });
    render(<CreateTournamentForm />);
    expect(
      screen.queryByText("CreateTournamentForm.name"),
    ).not.toBeInTheDocument();
  });

  it("renders the form fields for an admin", () => {
    renderAsAdmin();
    render(<CreateTournamentForm />);
    expect(screen.getByLabelText("CreateTournamentForm.name")).toBeInTheDocument();
    expect(screen.getByLabelText("CreateTournamentForm.startDate")).toBeInTheDocument();
    expect(screen.getByLabelText("CreateTournamentForm.endDate")).toBeInTheDocument();
    expect(screen.getByLabelText("CreateTournamentForm.location")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "CreateTournamentForm.submit" }),
    ).toBeInTheDocument();
  });

  it("submits the tournament and resets the form", async () => {
    const user = userEvent.setup();
    createTournamentMock.mockResolvedValueOnce(undefined);
    renderAsAdmin();
    render(<CreateTournamentForm />);

    await user.type(
      screen.getByLabelText("CreateTournamentForm.name"),
      "Torneo Nuevo",
    );
    await user.type(
      screen.getByLabelText("CreateTournamentForm.startDate"),
      "2026-08-10",
    );
    await user.type(
      screen.getByLabelText("CreateTournamentForm.endDate"),
      "2026-08-20",
    );
    await user.type(
      screen.getByLabelText("CreateTournamentForm.location"),
      "Madrid",
    );
    await user.click(
      screen.getByRole("button", { name: "CreateTournamentForm.submit" }),
    );

    expect(createTournamentMock).toHaveBeenCalledTimes(1);
    const submitted = createTournamentMock.mock.calls[0][0];
    expect(submitted).toEqual(
      expect.objectContaining({
        name: "Torneo Nuevo",
        startDate: "2026-08-10",
        endDate: "2026-08-20",
        location: "Madrid",
      }),
    );
    expect(submitted.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );

    expect(screen.getByLabelText("CreateTournamentForm.name")).toHaveValue("");
    expect(screen.getByLabelText("CreateTournamentForm.location")).toHaveValue("");
  });

  it("calls onCreated after a successful submit", async () => {
    const user = userEvent.setup();
    createTournamentMock.mockResolvedValueOnce(undefined);
    const onCreated = vi.fn();
    renderAsAdmin();
    render(<CreateTournamentForm onCreated={onCreated} />);

    await user.type(
      screen.getByLabelText("CreateTournamentForm.name"),
      "Torneo",
    );
    await user.type(
      screen.getByLabelText("CreateTournamentForm.startDate"),
      "2026-08-10",
    );
    await user.type(
      screen.getByLabelText("CreateTournamentForm.endDate"),
      "2026-08-20",
    );
    await user.type(
      screen.getByLabelText("CreateTournamentForm.location"),
      "Lima",
    );
    await user.click(
      screen.getByRole("button", { name: "CreateTournamentForm.submit" }),
    );

    expect(onCreated).toHaveBeenCalledTimes(1);
  });
});
