import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CreateRoundForm from "@/components/CreateRoundForm";

const useTournamentContextMock = vi.hoisted(() => vi.fn());
const createRoundMock = vi.hoisted(() => vi.fn());

vi.mock("@/sections/tournaments/tournaments-context", () => ({
  useTournamentContext: useTournamentContextMock,
}));

beforeEach(() => {
  createRoundMock.mockReset();
  useTournamentContextMock.mockReset();
  useTournamentContextMock.mockReturnValue({ createRound: createRoundMock });
});

describe("CreateRoundForm", () => {
  it("shows the form after clicking the new round button", async () => {
    const user = userEvent.setup();
    render(<CreateRoundForm tournamentId="t1" />);

    expect(screen.getByRole("button", { name: "CreateRoundForm.newRound" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "CreateRoundForm.newRound" }));

    expect(
      screen.getByPlaceholderText("CreateRoundForm.namePlaceholder"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "CreateRoundForm.create" })).toBeInTheDocument();
  });

  it("creates the round within the tournament and alerts on success", async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    createRoundMock.mockResolvedValueOnce(undefined);
    render(<CreateRoundForm tournamentId="t1" />);
    await user.click(screen.getByRole("button", { name: "CreateRoundForm.newRound" }));

    await user.type(
      screen.getByPlaceholderText("CreateRoundForm.namePlaceholder"),
      "Jornada 1",
    );
    await user.click(screen.getByRole("button", { name: "CreateRoundForm.create" }));

    expect(createRoundMock).toHaveBeenCalledTimes(1);
    const { tournamentId, round } = createRoundMock.mock.calls[0][0];
    expect(tournamentId).toBe("t1");
    expect(round).toEqual({
      id: "",
      name: "Jornada 1",
      tournamentId: "t1",
    });
    expect(alertSpy).toHaveBeenCalledWith("CreateRoundForm.success");
  });

  it("goes back to the button when cancelling", async () => {
    const user = userEvent.setup();
    render(<CreateRoundForm tournamentId="t1" />);
    await user.click(screen.getByRole("button", { name: "CreateRoundForm.newRound" }));

    await user.click(screen.getByRole("button", { name: "Common.cancel" }));

    expect(screen.getByRole("button", { name: "CreateRoundForm.newRound" })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("CreateRoundForm.namePlaceholder")).not.toBeInTheDocument();
  });
});
