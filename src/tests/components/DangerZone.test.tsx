import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DangerZone } from "@/components/DangerZone";

const useAuthMock = vi.hoisted(() => vi.fn());
const useTournamentContextMock = vi.hoisted(() => vi.fn());
const pushMock = vi.hoisted(() => vi.fn());
const deleteTournamentMock = vi.hoisted(() => vi.fn());

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
  useTournamentContext: useTournamentContextMock,
}));

vi.mock("@/navigation", () => ({
  Link: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
  useRouter: () => ({ push: pushMock, replace: vi.fn(), refresh: vi.fn() }),
}));

const tournament = {
  id: "t1",
  name: "Torneo",
  location: "",
  startDate: "",
  endDate: "",
  ownerId: "owner-1",
};

const CONSEQUENCE_COUNT = 5;

function renderAsOwner() {
  useAuthMock.mockReturnValue({
    user: { id: "owner-1", role: "TOURNAMENT_ADMIN" },
    isAuthenticated: true,
  });
}

beforeEach(() => {
  deleteTournamentMock.mockReset();
  pushMock.mockReset();
  useAuthMock.mockReset();
  useTournamentContextMock.mockReset();
  useTournamentContextMock.mockReturnValue({
    tournaments: [tournament],
    deleteTournament: deleteTournamentMock,
  });
});

describe("DangerZone", () => {
  it("renders nothing when the user is not authenticated", () => {
    useAuthMock.mockReturnValue({ user: null, isAuthenticated: false });
    render(<DangerZone tournamentId="t1" />);
    expect(
      screen.queryByText("TournamentDetail.dangerZone.title"),
    ).not.toBeInTheDocument();
  });

  it("renders nothing when the user is not the owner nor a super admin", () => {
    useAuthMock.mockReturnValue({
      user: { id: "someone-else", role: "TOURNAMENT_ADMIN" },
      isAuthenticated: true,
    });
    render(<DangerZone tournamentId="t1" />);
    expect(
      screen.queryByText("TournamentDetail.dangerZone.title"),
    ).not.toBeInTheDocument();
  });

  it("renders the danger zone for the tournament owner", () => {
    renderAsOwner();
    render(<DangerZone tournamentId="t1" />);
    expect(
      screen.getByText("TournamentDetail.dangerZone.title"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "TournamentDetail.dangerZone.deleteButton",
      }),
    ).toBeInTheDocument();
  });

  it("renders the danger zone for a super admin even if not the owner", () => {
    useAuthMock.mockReturnValue({
      user: { id: "admin", role: "SUPER_ADMIN" },
      isAuthenticated: true,
    });
    render(<DangerZone tournamentId="t1" />);
    expect(
      screen.getByText("TournamentDetail.dangerZone.title"),
    ).toBeInTheDocument();
  });

  it("keeps the delete button disabled until every checkbox is checked", async () => {
    const user = userEvent.setup();
    renderAsOwner();
    render(<DangerZone tournamentId="t1" />);

    await user.click(
      screen.getByRole("button", {
        name: "TournamentDetail.dangerZone.deleteButton",
      }),
    );

    const dialog = screen.getByRole("dialog");
    const confirm = within(dialog).getByRole("button", {
      name: "TournamentDetail.dangerZone.confirm",
    });
    expect(confirm).toBeDisabled();

    const checkboxes = within(dialog).getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(CONSEQUENCE_COUNT);

    for (const checkbox of checkboxes) {
      await user.click(checkbox);
    }

    expect(confirm).toBeEnabled();
  });

  it("deletes the tournament and navigates back to the list", async () => {
    const user = userEvent.setup();
    deleteTournamentMock.mockResolvedValueOnce(undefined);
    renderAsOwner();
    render(<DangerZone tournamentId="t1" />);

    await user.click(
      screen.getByRole("button", {
        name: "TournamentDetail.dangerZone.deleteButton",
      }),
    );

    const dialog = screen.getByRole("dialog");
    for (const checkbox of within(dialog).getAllByRole("checkbox")) {
      await user.click(checkbox);
    }

    await user.click(
      within(dialog).getByRole("button", {
        name: "TournamentDetail.dangerZone.confirm",
      }),
    );

    await waitFor(() => {
      expect(deleteTournamentMock).toHaveBeenCalledWith("t1");
    });
    expect(pushMock).toHaveBeenCalledWith("/manage/my-tournaments");
  });

  it("shows an error message and does not navigate when deletion fails", async () => {
    const user = userEvent.setup();
    deleteTournamentMock.mockRejectedValueOnce(new Error("boom"));
    renderAsOwner();
    render(<DangerZone tournamentId="t1" />);

    await user.click(
      screen.getByRole("button", {
        name: "TournamentDetail.dangerZone.deleteButton",
      }),
    );

    const dialog = screen.getByRole("dialog");
    for (const checkbox of within(dialog).getAllByRole("checkbox")) {
      await user.click(checkbox);
    }

    await user.click(
      within(dialog).getByRole("button", {
        name: "TournamentDetail.dangerZone.confirm",
      }),
    );

    expect(await screen.findByText("boom")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
