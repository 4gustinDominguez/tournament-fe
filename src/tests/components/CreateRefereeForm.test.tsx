import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CreateRefereeForm from "@/components/CreateRefereeForm";

const useTournamentContextMock = vi.hoisted(() => vi.fn());
const createRefereeMock = vi.hoisted(() => vi.fn());

vi.mock("@/sections/tournaments/tournaments-context", () => ({
  useTournamentContext: useTournamentContextMock,
}));

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

beforeEach(() => {
  createRefereeMock.mockReset();
  useTournamentContextMock.mockReset();
  useTournamentContextMock.mockReturnValue({ createReferee: createRefereeMock });
});

describe("CreateRefereeForm", () => {
  it("creates the referee for the tournament", async () => {
    const user = userEvent.setup();
    createRefereeMock.mockResolvedValueOnce(undefined);
    render(<CreateRefereeForm tournamentId="t1" />);

    await user.type(
      screen.getByPlaceholderText("CreateRefereeForm.namePlaceholder"),
      "Ana Pérez",
    );
    await user.click(screen.getByRole("button", { name: "CreateRefereeForm.add" }));

    expect(createRefereeMock).toHaveBeenCalledTimes(1);
    const { tournamentId, referee } = createRefereeMock.mock.calls[0][0];
    expect(tournamentId).toBe("t1");
    expect(referee).toEqual({
      id: expect.stringMatching(UUID_REGEX),
      name: "Ana Pérez",
      tournamentIds: ["t1"],
    });
  });

  it("resets the name after a successful submit", async () => {
    const user = userEvent.setup();
    createRefereeMock.mockResolvedValueOnce(undefined);
    render(<CreateRefereeForm tournamentId="t1" />);

    await user.type(
      screen.getByPlaceholderText("CreateRefereeForm.namePlaceholder"),
      "Ana Pérez",
    );
    await user.click(screen.getByRole("button", { name: "CreateRefereeForm.add" }));

    expect(screen.getByPlaceholderText("CreateRefereeForm.namePlaceholder")).toHaveValue("");
  });

  it("does not submit while the name is empty", async () => {
    const user = userEvent.setup();
    render(<CreateRefereeForm tournamentId="t1" />);

    const button = screen.getByRole("button", { name: "CreateRefereeForm.add" });
    expect(button).toBeDisabled();

    await user.click(button);
    expect(createRefereeMock).not.toHaveBeenCalled();
  });
});
