import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import VerifyEmailPage from "@/app/[locale]/(auth)/verify-email/page";

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

describe("VerifyEmailPage", () => {
  it("shows the invalid link state when the token is missing", () => {
    searchParamsMock.current = "";
    render(<VerifyEmailPage />);

    expect(screen.getByText("Auth.verifyEmailInvalid")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("verifies the token on load", async () => {
    fetchMock.mockResolvedValue({ ok: true });
    render(<VerifyEmailPage />);

    expect(await screen.findByText("Auth.verifyEmailSuccess")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/auth/verify-email"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ token: "valid-token" }),
      })
    );
  });

  it("shows the API error when the token is invalid", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Invalid verification token" }),
    });
    render(<VerifyEmailPage />);

    expect(await screen.findByText("Invalid verification token")).toBeInTheDocument();
  });
});
