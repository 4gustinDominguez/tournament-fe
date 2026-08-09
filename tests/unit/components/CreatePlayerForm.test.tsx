import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CreatePlayerForm from "@/components/CreatePlayerForm";

const useTournamentContextMock = vi.hoisted(() => vi.fn());
const createPlayerMock = vi.hoisted(() => vi.fn());

vi.mock("@/sections/tournaments/tournaments-context", () => ({
  useTournamentContext: useTournamentContextMock,
}));

vi.mock("@/components/PhotoUpload", () => ({
  PhotoUpload: () => <div data-testid="photo-upload" />,
}));

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

beforeEach(() => {
  createPlayerMock.mockReset();
  useTournamentContextMock.mockReset();
  useTournamentContextMock.mockReturnValue({ createPlayer: createPlayerMock });
});

describe("CreatePlayerForm", () => {
  it("creates the player within the team and tournament", async () => {
    const user = userEvent.setup();
    createPlayerMock.mockResolvedValueOnce(undefined);
    render(<CreatePlayerForm teamId="team-1" tournamentId="t1" />);

    await user.type(
      screen.getByPlaceholderText("CreatePlayerForm.namePlaceholder"),
      "Martín Díaz",
    );
    await user.type(
      screen.getByPlaceholderText("CreatePlayerForm.nicknamePlaceholder"),
      "Tino",
    );
    await user.selectOptions(
      screen.getByRole("combobox"),
      "Midfielder",
    );
    await user.click(screen.getByRole("button", { name: /CreatePlayerForm.addToTeam/ }));

    expect(createPlayerMock).toHaveBeenCalledTimes(1);
    const { teamId, tournamentId, player } = createPlayerMock.mock.calls[0][0];
    expect(teamId).toBe("team-1");
    expect(tournamentId).toBe("t1");
    expect(player).toEqual({
      id: expect.stringMatching(UUID_REGEX),
      name: "Martín Díaz",
      nickname: "Tino",
      position: "Midfielder",
      photoUrl: "",
      tournaments: ["t1"],
    });
  });

  it("adds no tournaments when tournamentId is not provided", async () => {
    const user = userEvent.setup();
    createPlayerMock.mockResolvedValueOnce(undefined);
    render(<CreatePlayerForm teamId="team-1" />);

    await user.type(
      screen.getByPlaceholderText("CreatePlayerForm.namePlaceholder"),
      "Lucía",
    );
    await user.type(
      screen.getByPlaceholderText("CreatePlayerForm.nicknamePlaceholder"),
      "Luchi",
    );
    await user.click(screen.getByRole("button", { name: /CreatePlayerForm.addToTeam/ }));

    const { player } = createPlayerMock.mock.calls[0][0];
    expect(player.tournaments).toEqual([]);
  });

  it("resets the form after a successful submit", async () => {
    const user = userEvent.setup();
    createPlayerMock.mockResolvedValueOnce(undefined);
    render(<CreatePlayerForm teamId="team-1" tournamentId="t1" />);

    await user.type(
      screen.getByPlaceholderText("CreatePlayerForm.namePlaceholder"),
      "Martín Díaz",
    );
    await user.type(
      screen.getByPlaceholderText("CreatePlayerForm.nicknamePlaceholder"),
      "Tino",
    );
    await user.click(screen.getByRole("button", { name: /CreatePlayerForm.addToTeam/ }));

    expect(screen.getByPlaceholderText("CreatePlayerForm.namePlaceholder")).toHaveValue("");
    expect(screen.getByPlaceholderText("CreatePlayerForm.nicknamePlaceholder")).toHaveValue("");
  });
});
