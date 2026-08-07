import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import EditPlayerForm from "@/components/EditPlayerForm";

const useTournamentContextMock = vi.hoisted(() => vi.fn());
const updatePlayerMock = vi.hoisted(() => vi.fn());

vi.mock("@/sections/tournaments/tournaments-context", () => ({
  useTournamentContext: useTournamentContextMock,
}));

const basePlayer = {
  id: "p1",
  teamId: "team-1",
  name: "Martín Díaz",
  nickname: "Tino",
  position: "Midfielder",
  photoUrl: "",
  tournaments: ["t1"],
};

beforeEach(() => {
  updatePlayerMock.mockReset();
  useTournamentContextMock.mockReset();
  useTournamentContextMock.mockReturnValue({ updatePlayer: updatePlayerMock });
});

describe("EditPlayerForm", () => {
  it("preloads the player values", () => {
    render(
      <EditPlayerForm teamId="team-1" tournamentId="t1" player={{ ...basePlayer }} />,
    );
    expect(screen.getByPlaceholderText("EditPlayerForm.namePlaceholder")).toHaveValue("Martín Díaz");
    expect(screen.getByPlaceholderText("EditPlayerForm.nicknamePlaceholder")).toHaveValue("Tino");
    expect(screen.getByRole("combobox")).toHaveValue("Midfielder");
  });

  it("updates the player and calls onSuccess", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    updatePlayerMock.mockResolvedValueOnce(undefined);
    render(
      <EditPlayerForm
        teamId="team-1"
        tournamentId="t1"
        player={{ ...basePlayer }}
        onSuccess={onSuccess}
      />,
    );

    await user.clear(screen.getByPlaceholderText("EditPlayerForm.namePlaceholder"));
    await user.type(screen.getByPlaceholderText("EditPlayerForm.namePlaceholder"), "Martín D.");
    await user.click(screen.getByRole("button", { name: "EditPlayerForm.saveChanges" }));

    expect(updatePlayerMock).toHaveBeenCalledTimes(1);
    const { tournamentId, player } = updatePlayerMock.mock.calls[0][0];
    expect(tournamentId).toBe("t1");
    expect(player.name).toBe("Martín D.");
    expect(onSuccess).toHaveBeenCalled();
  });

  it("converts height and weight to numbers", async () => {
    const user = userEvent.setup();
    updatePlayerMock.mockResolvedValueOnce(undefined);
    render(
      <EditPlayerForm teamId="team-1" tournamentId="t1" player={{ ...basePlayer }} />,
    );

    const spinbuttons = screen.getAllByRole("spinbutton");
    await user.type(spinbuttons[0], "182");
    await user.type(spinbuttons[1], "74");
    await user.click(screen.getByRole("button", { name: "EditPlayerForm.saveChanges" }));

    const { player } = updatePlayerMock.mock.calls[0][0];
    expect(player.height).toBe(182);
    expect(player.weight).toBe(74);
  });

  it("updates social media fields", async () => {
    const user = userEvent.setup();
    updatePlayerMock.mockResolvedValueOnce(undefined);
    render(
      <EditPlayerForm teamId="team-1" tournamentId="t1" player={{ ...basePlayer }} />,
    );

    await user.type(
      screen.getByPlaceholderText("EditPlayerForm.instagramPlaceholder"),
      "@tino",
    );
    await user.click(screen.getByRole("button", { name: "EditPlayerForm.saveChanges" }));

    const { player } = updatePlayerMock.mock.calls[0][0];
    expect(player.socialMedia.instagram).toBe("@tino");
  });

  it("updates the quick stats", async () => {
    const user = userEvent.setup();
    updatePlayerMock.mockResolvedValueOnce(undefined);
    render(
      <EditPlayerForm teamId="team-1" tournamentId="t1" player={{ ...basePlayer }} />,
    );

    const spinbuttons = screen.getAllByRole("spinbutton");
    await user.type(spinbuttons[2], "3");
    await user.click(screen.getByRole("button", { name: "EditPlayerForm.saveChanges" }));

    const { player } = updatePlayerMock.mock.calls[0][0];
    expect(player.statistics.goals).toBe(3);
  });
});
