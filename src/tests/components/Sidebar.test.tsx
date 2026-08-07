import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Sidebar from "@/components/Sidebar";

const useAuthMock = vi.hoisted(() => vi.fn());

vi.mock("@/sections/tournaments/auth-context", () => ({
  useAuth: useAuthMock,
  UserRole: {
    SUPER_ADMIN: "SUPER_ADMIN",
    TOURNAMENT_ADMIN: "TOURNAMENT_ADMIN",
    REFEREE: "REFEREE",
  },
}));

beforeEach(() => {
  useAuthMock.mockReset();
});

describe("Sidebar", () => {
  it("shows no navigation items when not authenticated", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      user: null,
    });
    render(<Sidebar />);
    expect(screen.queryByText("Menu.myTournaments")).not.toBeInTheDocument();
    expect(screen.queryByText("Menu.referee")).not.toBeInTheDocument();
  });

  it("shows the tournaments link for an admin", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: "u1", role: "TOURNAMENT_ADMIN" },
    });
    render(<Sidebar />);
    expect(screen.getByText("Menu.myTournaments")).toHaveAttribute(
      "href",
      "/manage/my-tournaments",
    );
    expect(screen.queryByText("Menu.referee")).not.toBeInTheDocument();
  });

  it("shows the referee link for a referee", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: "u1", role: "REFEREE" },
    });
    render(<Sidebar />);
    expect(screen.getByText("Menu.referee")).toHaveAttribute(
      "href",
      "/manage/referee",
    );
    expect(screen.queryByText("Menu.myTournaments")).not.toBeInTheDocument();
  });

  it("runs onNavigate when a link is clicked", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const preventNav = (e: Event) => e.preventDefault();
    document.addEventListener("click", preventNav);
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: "u1", role: "TOURNAMENT_ADMIN" },
    });
    render(<Sidebar onNavigate={onNavigate} />);

    await user.click(screen.getByText("Menu.myTournaments"));
    document.removeEventListener("click", preventNav);
    expect(onNavigate).toHaveBeenCalled();
  });
});
