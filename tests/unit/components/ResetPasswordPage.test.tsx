import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ResetPasswordPage from "@/app/[locale]/(auth)/reset-password/page";

const fetchMock = vi.fn();
const searchParamsMock = vi.hoisted(() => ({ current: "token=valid-token" }));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(searchParamsMock.current),
}));

beforeEach(() => {
  fetchMock.mockReset();
  searchParamsMock.current = "token=valid-token";
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ResetPasswordPage", () => {
  it("shows the invalid link state when the token is missing", () => {
    searchParamsMock.current = "";
    render(<ResetPasswordPage />);

    expect(screen.getByText("Auth.resetPasswordInvalid")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects passwords that do not match", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordPage />);

    await user.type(screen.getByLabelText("Auth.newPassword"), "password1");
    await user.type(screen.getByLabelText("Auth.confirmPassword"), "password2");
    await user.click(screen.getByRole("button", { name: "Auth.resetPasswordSubmit" }));

    expect(await screen.findByText("Auth.resetPasswordMismatch")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("resets the password with a valid token", async () => {
    fetchMock.mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    render(<ResetPasswordPage />);

    await user.type(screen.getByLabelText("Auth.newPassword"), "password1");
    await user.type(screen.getByLabelText("Auth.confirmPassword"), "password1");
    await user.click(screen.getByRole("button", { name: "Auth.resetPasswordSubmit" }));

    expect(await screen.findByText("Auth.resetPasswordSuccess")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/auth/reset-password"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ token: "valid-token", newPassword: "password1" }),
      })
    );
  });

  it("shows the API error when the token is invalid", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Invalid or expired token" }),
    });
    const user = userEvent.setup();
    render(<ResetPasswordPage />);

    await user.type(screen.getByLabelText("Auth.newPassword"), "password1");
    await user.type(screen.getByLabelText("Auth.confirmPassword"), "password1");
    await user.click(screen.getByRole("button", { name: "Auth.resetPasswordSubmit" }));

    expect(await screen.findByText("Invalid or expired token")).toBeInTheDocument();
  });
});
