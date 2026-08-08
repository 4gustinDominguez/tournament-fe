import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import DashboardHeader from "@/components/DashboardHeader";

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

describe("DashboardHeader", () => {
  it("renders the user name and role", () => {
    useAuthMock.mockReturnValue({
      user: { firstName: "Ana", lastName: "Pérez", role: "TOURNAMENT_ADMIN" },
      logout: vi.fn(),
    });
    render(<DashboardHeader />);
    expect(screen.getByText("Ana Pérez")).toBeInTheDocument();
    expect(screen.getByText("TOURNAMENT ADMIN")).toBeInTheDocument();
  });

  it("renders the avatar fallback initial", () => {
    useAuthMock.mockReturnValue({
      user: { firstName: "Ana", lastName: "Pérez", role: "TOURNAMENT_ADMIN" },
      logout: vi.fn(),
    });
    render(<DashboardHeader />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });
});
