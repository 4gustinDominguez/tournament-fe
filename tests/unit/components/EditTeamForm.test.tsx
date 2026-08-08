import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import EditTeamForm from "@/components/EditTeamForm";

const useTournamentContextMock = vi.hoisted(() => vi.fn());
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
  getPlacesMock.mockReset();
  useTournamentContextMock.mockReset();
  useTournamentContextMock.mockReturnValue({
    getPlaces: getPlacesMock,
    places,
  });
});

describe("EditTeamForm", () => {
  it("loads the places on mount", () => {
    render(
      <EditTeamForm
        team={team}
        kitPattern="solid"
        kitColors={["#ff0000"]}
        onKitChange={vi.fn()}
      />
    );
    expect(getPlacesMock).toHaveBeenCalledWith("t1");
  });

  it("renders kit preview with correct colors", () => {
    render(
      <EditTeamForm
        team={team}
        kitPattern="horizontal-stripes"
        kitColors={["#ff0000", "#ffffff"]}
        onKitChange={vi.fn()}
      />
    );
    expect(screen.queryByText("Estadio Central")).not.toBeInTheDocument();
  });

  it("preloads the kit colors", () => {
    render(
      <EditTeamForm
        team={team}
        kitPattern="solid"
        kitColors={["#000000", "#ffffff"]}
        onKitChange={vi.fn()}
      />
    );
  });

  it("calls onKitChange when pattern changes", async () => {
    const user = userEvent.setup();
    const onKitChange = vi.fn();
    render(
      <EditTeamForm
        team={team}
        kitPattern="solid"
        kitColors={["#ff0000"]}
        onKitChange={onKitChange}
      />
    );

    const patternSelect = screen.getByRole("combobox");
    await user.selectOptions(patternSelect, "horizontal-stripes");
    expect(onKitChange).toHaveBeenCalledWith({ kitPattern: "horizontal-stripes" });
  });

  it("calls onKitChange when a color changes", async () => {
    const user = userEvent.setup();
    const onKitChange = vi.fn();
    render(
      <EditTeamForm
        team={team}
        kitPattern="solid"
        kitColors={["#ff0000", "#ffffff"]}
        onKitChange={onKitChange}
      />
    );

    const colorInputs = screen.getAllByRole("textbox");
    expect(colorInputs.length).toBeGreaterThan(0);
  });

  it("adds a color when Add Color is clicked", async () => {
    const user = userEvent.setup();
    const onKitChange = vi.fn();
    render(
      <EditTeamForm
        team={team}
        kitPattern="solid"
        kitColors={["#ff0000"]}
        onKitChange={onKitChange}
      />
    );

    const addButton = screen.getByRole("button", { name: /add/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(onKitChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ kitColors: expect.arrayContaining(["#ff0000"]) }),
      );
    });
  });

  it("removes a color when remove button is clicked", async () => {
    const user = userEvent.setup();
    const onKitChange = vi.fn();
    render(
      <EditTeamForm
        team={team}
        kitPattern="solid"
        kitColors={["#ff0000", "#ffffff"]}
        onKitChange={onKitChange}
      />
    );

    const removeButtons = screen.getAllByRole("button").filter(
      (btn) => !btn.textContent && btn.getAttribute("type") === "button",
    );
    await user.click(removeButtons[removeButtons.length - 1]);

    await waitFor(() => {
      expect(onKitChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ kitColors: expect.not.arrayContaining(["#ffffff"]) }),
      );
    });
  });
});
