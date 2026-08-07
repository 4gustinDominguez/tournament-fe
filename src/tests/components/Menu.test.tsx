import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Menu from "@/components/Menu";

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

describe("Menu", () => {
  it("shows a login link when not authenticated", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      user: null,
      logout: vi.fn(),
    });
    render(<Menu />);
    expect(screen.getByText("Menu.login")).toBeInTheDocument();
    expect(screen.getByText("Menu.login")).toHaveAttribute("href", "/login");
  });

  it("links the dashboard and greets the user when authenticated", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { firstName: "Ana", lastName: "Pérez", role: "TOURNAMENT_ADMIN" },
      logout: vi.fn(),
    });
    render(<Menu />);
    expect(screen.getByText("Menu.dashboard")).toHaveAttribute(
      "href",
      "/manage/my-tournaments",
    );
    expect(screen.getByText("Menu.greeting")).toBeInTheDocument();
  });

  it("links referees to their dashboard", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { firstName: "Luis", lastName: "Gómez", role: "REFEREE" },
      logout: vi.fn(),
    });
    render(<Menu />);
    expect(screen.getByText("Menu.dashboard")).toHaveAttribute(
      "href",
      "/manage/referee",
    );
  });

  it("logs out when clicking the logout button", async () => {
    const user = userEvent.setup();
    const logout = vi.fn();
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { firstName: "Ana", lastName: "Pérez", role: "TOURNAMENT_ADMIN" },
      logout,
    });
    render(<Menu />);

    await user.click(screen.getByRole("button", { name: "Menu.logout" }));
    expect(logout).toHaveBeenCalled();
  });
});
