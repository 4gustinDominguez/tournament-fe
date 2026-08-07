import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import EditTeamForm from "@/components/EditTeamForm";

const useTournamentContextMock = vi.hoisted(() => vi.fn());
const updateTeamMock = vi.hoisted(() => vi.fn());
const getPlacesMock = vi.hoisted(() => vi.fn());

vi.mock("@/sections/tournaments/tournaments-context", () => ({
  useTournamentContext: useTournamentContextMock,
}));

const team = {
  id: "team-1",
  name: "Alpha FC",
  tournaments: ["t1"],
  coach: "Carlos",
  crestUrl: "",
  kitColor: "#ff0000",
  placeId: "",
};

const places = [
  { id: "place-1", name: "Estadio Central", tournamentId: "t1" },
];

beforeEach(() => {
  updateTeamMock.mockReset();
  getPlacesMock.mockReset();
  useTournamentContextMock.mockReset();
  useTournamentContextMock.mockReturnValue({
    updateTeam: updateTeamMock,
    getPlaces: getPlacesMock,
    places,
  });
});

describe("EditTeamForm", () => {
  it("loads the places on mount", () => {
    render(<EditTeamForm team={team} tournamentId="t1" />);
    expect(getPlacesMock).toHaveBeenCalledWith("t1");
  });

  it("preloads the team values", () => {
    render(<EditTeamForm team={team} tournamentId="t1" />);
    expect(screen.getByLabelText("EditTeamForm.name")).toHaveValue("Alpha FC");
    expect(screen.getByLabelText("EditTeamForm.coach")).toHaveValue("Carlos");
    expect(screen.getByLabelText("EditTeamForm.crestUrl")).toHaveValue("");
  });

  it("updates the team and alerts success", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    updateTeamMock.mockResolvedValueOnce(undefined);
    render(<EditTeamForm team={team} tournamentId="t1" onSuccess={onSuccess} />);

    const nameInput = screen.getByLabelText("EditTeamForm.name");
    await user.clear(nameInput);
    await user.type(nameInput, "Alpha FC II");
    await user.click(screen.getByRole("button", { name: "EditTeamForm.save" }));

    expect(updateTeamMock).toHaveBeenCalledTimes(1);
    const { tournamentId, team: submitted } = updateTeamMock.mock.calls[0][0];
    expect(tournamentId).toBe("t1");
    expect(submitted).toEqual({ ...team, name: "Alpha FC II" });
    expect(alertSpy).toHaveBeenCalledWith("EditTeamForm.success");
    expect(onSuccess).toHaveBeenCalled();
  });

  it("shows the venues as selectable options", () => {
    render(<EditTeamForm team={team} tournamentId="t1" />);
    expect(screen.getByText("Estadio Central")).toBeInTheDocument();
  });
});
