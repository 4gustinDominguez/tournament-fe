import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MatchForm from "@/components/MatchForm";

const useTournamentContextMock = vi.hoisted(() => vi.fn());

vi.mock("@/sections/tournaments/tournaments-context", () => ({
  useTournamentContext: useTournamentContextMock,
}));

const teams = [
  { id: "team-a", name: "Alpha FC", tournamentId: "t1" },
  { id: "team-b", name: "Beta SC", tournamentId: "t1" },
];
const places = [{ id: "place-1", name: "Estadio Central", tournamentId: "t1" }];
const referees = [{ id: "ref-1", name: "Ana Pérez", tournamentIds: ["t1"] }];

const getTeams = vi.fn();
const getPlaces = vi.fn();
const getReferees = vi.fn();
const createMatch = vi.fn();
const updateMatch = vi.fn();

beforeEach(() => {
  getTeams.mockReset();
  getPlaces.mockReset();
  getReferees.mockReset();
  createMatch.mockReset();
  updateMatch.mockReset();
  useTournamentContextMock.mockReset();
  useTournamentContextMock.mockReturnValue({
    teams,
    places,
    referees,
    getTeams,
    getPlaces,
    getReferees,
    createMatch,
    updateMatch,
  });
});

describe("MatchForm", () => {
  it("loads teams, places and referees on mount", () => {
    render(<MatchForm tournamentId="t1" roundId="r1" submitLabel="Save" />);
    expect(getTeams).toHaveBeenCalledWith("t1");
    expect(getPlaces).toHaveBeenCalledWith("t1");
    expect(getReferees).toHaveBeenCalledWith("t1");
  });

  it("alerts when both teams are the same", async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    render(<MatchForm tournamentId="t1" roundId="r1" submitLabel="Save" />);

    const selects = screen.getAllByRole("combobox");
    await user.selectOptions(selects[0], "team-a");
    await user.selectOptions(selects[1], "team-a");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(alertSpy).toHaveBeenCalledWith("MatchForm.sameTeamsAlert");
    expect(createMatch).not.toHaveBeenCalled();
  });

  it("alerts when no round is provided in create mode", async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    render(<MatchForm tournamentId="t1" submitLabel="Save" />);

    const selects = screen.getAllByRole("combobox");
    await user.selectOptions(selects[0], "team-a");
    await user.selectOptions(selects[1], "team-b");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(alertSpy).toHaveBeenCalledWith("MatchForm.noRoundAlert");
    expect(createMatch).not.toHaveBeenCalled();
  });

  it("creates the match within the round", async () => {
    const user = userEvent.setup();
    createMatch.mockResolvedValueOnce(undefined);
    render(<MatchForm tournamentId="t1" roundId="r1" submitLabel="Save" />);

    const selects = screen.getAllByRole("combobox");
    await user.selectOptions(selects[0], "team-a");
    await user.selectOptions(selects[1], "team-b");
    await user.selectOptions(selects[2], "place-1");
    await user.selectOptions(selects[3], "ref-1");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(createMatch).toHaveBeenCalledTimes(1);
    const { tournamentId, match } = createMatch.mock.calls[0][0];
    expect(tournamentId).toBe("t1");
    expect(match).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        ),
        tournamentId: "t1",
        roundId: "r1",
        teamAId: "team-a",
        teamBId: "team-b",
        placeId: "place-1",
        refereeId: "ref-1",
        status: "scheduled",
        result: null,
        incidents: [],
      }),
    );
  });

  it("updates the match when initialValues are provided", async () => {
    const user = userEvent.setup();
    updateMatch.mockResolvedValueOnce(undefined);
    const initialValues = {
      id: "match-1",
      tournamentId: "t1",
      roundId: "r1",
      teamAId: "team-a",
      teamBId: "team-b",
      date: new Date("2026-08-15T18:00:00"),
      placeId: "place-1",
      refereeId: "ref-1",
      status: "live",
      result: null,
      incidents: [],
    };
    render(
      <MatchForm
        tournamentId="t1"
        roundId="r1"
        initialValues={initialValues}
        submitLabel="Save"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(updateMatch).toHaveBeenCalledTimes(1);
    const updated = updateMatch.mock.calls[0][0];
    expect(updated.id).toBe("match-1");
    expect(updated.teamAId).toBe("team-a");
    expect(updated.teamBId).toBe("team-b");
    expect(createMatch).not.toHaveBeenCalled();
  });
});
