import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ForgotPasswordPage from "@/app/[locale]/(auth)/forgot-password/page";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ForgotPasswordPage", () => {
  it("renders the request form", () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByText("Auth.forgotPasswordTitle")).toBeInTheDocument();
    expect(screen.getByLabelText("Auth.email")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Auth.forgotPasswordSubmit" })
    ).toBeInTheDocument();
  });

  it("shows the sent state after a successful request", async () => {
    fetchMock.mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    render(<ForgotPasswordPage />);

    await user.type(screen.getByLabelText("Auth.email"), "user@test.com");
    await user.click(screen.getByRole("button", { name: "Auth.forgotPasswordSubmit" }));

    expect(await screen.findByText("Auth.forgotPasswordSent")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/auth/forgot-password"),
      expect.objectContaining({ method: "POST" })
    );
  });

  it("shows the API error when the request fails", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ message: "boom" }),
    });
    const user = userEvent.setup();
    render(<ForgotPasswordPage />);

    await user.type(screen.getByLabelText("Auth.email"), "user@test.com");
    await user.click(screen.getByRole("button", { name: "Auth.forgotPasswordSubmit" }));

    expect(await screen.findByText("boom")).toBeInTheDocument();
  });
});
