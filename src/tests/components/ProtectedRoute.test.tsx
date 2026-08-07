import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { UserRole } from "@/sections/tournaments/auth-context";

const useAuthMock = vi.hoisted(() => vi.fn());
const pushMock = vi.hoisted(() => vi.fn());

vi.mock("@/sections/tournaments/auth-context", () => ({
  useAuth: useAuthMock,
  UserRole: {
    SUPER_ADMIN: "SUPER_ADMIN",
    TOURNAMENT_ADMIN: "TOURNAMENT_ADMIN",
    REFEREE: "REFEREE",
    PLAYER: "PLAYER",
  },
}));

vi.mock("@/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn(), refresh: vi.fn() }),
}));

beforeEach(() => {
  pushMock.mockReset();
  useAuthMock.mockReset();
});

describe("ProtectedRoute", () => {
  it("shows a loading spinner while isLoading", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: true,
    });
    const { container } = render(
      <ProtectedRoute>Contenido</ProtectedRoute>,
    );
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
    expect(screen.queryByText("Contenido")).not.toBeInTheDocument();
  });

  it("redirects to /login when not authenticated", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
    render(<ProtectedRoute>Contenido</ProtectedRoute>);
    expect(pushMock).toHaveBeenCalledWith("/login");
    expect(screen.queryByText("Contenido")).not.toBeInTheDocument();
  });

  it("redirects to / when the user role is not allowed", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: "u1", role: "PLAYER" },
      isLoading: false,
    });
    render(<ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>Contenido</ProtectedRoute>);
    expect(pushMock).toHaveBeenCalledWith("/");
    expect(screen.queryByText("Contenido")).not.toBeInTheDocument();
  });

  it("renders children when the role is allowed", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: "u1", role: "SUPER_ADMIN" },
      isLoading: false,
    });
    render(<ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>Contenido</ProtectedRoute>);
    expect(pushMock).not.toHaveBeenCalled();
    expect(screen.getByText("Contenido")).toBeInTheDocument();
  });

  it("renders children for any authenticated user when no roles are given", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: "u1", role: "REFEREE" },
      isLoading: false,
    });
    render(<ProtectedRoute>Contenido</ProtectedRoute>);
    expect(screen.getByText("Contenido")).toBeInTheDocument();
  });
});
