import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Header from "@/components/Header";

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

describe("Header", () => {
  it("renders the main navigation links", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      user: null,
      logout: vi.fn(),
    });
    render(<Header />);
    expect(screen.getAllByText("Menu.home").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Menu.tournaments").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Menu.contact").length).toBeGreaterThan(0);
  });

  it("opens the mobile menu when clicking the burger", async () => {
    const user = userEvent.setup();
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      user: null,
      logout: vi.fn(),
    });
    render(<Header />);

    expect(screen.getByText("Menu.login")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Menu.openMenu" }));

    expect(screen.getAllByText("Menu.home")).toHaveLength(2);
    expect(screen.getAllByText("Menu.login")).toHaveLength(2);
  });

  it("closes the mobile menu when clicking the burger again", async () => {
    const user = userEvent.setup();
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      user: null,
      logout: vi.fn(),
    });
    render(<Header />);

    const burger = screen.getByRole("button", { name: "Menu.openMenu" });
    await user.click(burger);
    expect(screen.getAllByText("Menu.home")).toHaveLength(2);

    await user.click(burger);
    expect(screen.getAllByText("Menu.home")).toHaveLength(1);
  });

  it("closes the mobile menu when a navigation link is clicked", async () => {
    const user = userEvent.setup();
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      user: null,
      logout: vi.fn(),
    });
    render(<Header />);

    await user.click(screen.getByRole("button", { name: "Menu.openMenu" }));
    expect(screen.getAllByText("Menu.home")).toHaveLength(2);

    await user.click(screen.getAllByText("Menu.home")[1]);
    expect(screen.getAllByText("Menu.home")).toHaveLength(1);
  });
});
