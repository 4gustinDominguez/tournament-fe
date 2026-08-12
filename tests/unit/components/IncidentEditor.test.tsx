import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import IncidentEditor from "@/components/IncidentEditor";
import { notify } from "@/lib/notify";

vi.mock("@/lib/notify", () => ({
  notify: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

const teamA = {
  id: "team-a",
  name: "Alpha FC",
  tournaments: ["t1"],
  player: [
    { id: "p-a1", name: "Lucas A", nickname: "Luc", tournaments: ["t1"], teamId: "team-a", fullRegistered: false },
    { id: "p-a2", name: "Pedro A", nickname: "Ped", tournaments: ["t1"], teamId: "team-a", fullRegistered: false },
  ],
};

const teamB = {
  id: "team-b",
  name: "Beta SC",
  tournaments: ["t1"],
  player: [
    { id: "p-b1", name: "Juan B", nickname: "Juan", tournaments: ["t1"], teamId: "team-b", fullRegistered: false },
  ],
};

describe("IncidentEditor", () => {
  it("shows the players of both teams as options", async () => {
    const user = userEvent.setup();
    render(<IncidentEditor teamA={teamA} teamB={teamB} incidents={[]} />);
    expect(screen.getByText("Lucas A")).toBeInTheDocument();
    expect(screen.getByText("Pedro A")).toBeInTheDocument();
    expect(screen.queryByText("Juan B")).not.toBeInTheDocument();

    await user.selectOptions(screen.getAllByRole("combobox")[0], "team-b");
    expect(screen.getByText("Juan B")).toBeInTheDocument();
  });

  it("warns when trying to add an incident without a player", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <IncidentEditor teamA={teamA} teamB={teamB} incidents={[]} onChange={onChange} />,
    );

    await user.click(screen.getByRole("button", { name: "IncidentEditor.add" }));

    expect(notify.warning).toHaveBeenCalledWith("IncidentEditor.incompleteAlert");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("adds an incident with the selected player", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <IncidentEditor teamA={teamA} teamB={teamB} incidents={[]} onChange={onChange} />,
    );

    await user.selectOptions(screen.getAllByRole("combobox")[2], "p-a1");
    await user.click(screen.getByRole("button", { name: "IncidentEditor.add" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const [incidents] = onChange.mock.calls[0];
    expect(incidents).toHaveLength(1);
    expect(incidents[0]).toEqual({
      type: "GOAL",
      minute: 1,
      teamId: "team-a",
      playerId: "p-a1",
      id: expect.any(String),
    });
  });

  it("removes an incident", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const incidents: { id: string; type: "GOAL" | "YELLOW_CARD" | "RED_CARD" | "SUBSTITUTION"; minute: number; teamId: string; playerId: string }[] = [
      { id: "i1", type: "GOAL", minute: 10, teamId: "team-a", playerId: "p-a1" },
      { id: "i2", type: "YELLOW_CARD", minute: 20, teamId: "team-b", playerId: "p-b1" },
    ];
    render(
      <IncidentEditor teamA={teamA} teamB={teamB} incidents={incidents} onChange={onChange} />,
    );

    const removeButtons = screen.getAllByRole("button");
    await user.click(removeButtons[removeButtons.length - 1]);

    expect(onChange).toHaveBeenCalledTimes(1);
    const [remaining] = onChange.mock.calls[0];
    expect(remaining.map((i: { id: string }) => i.id)).toEqual(["i1"]);
  });
});
