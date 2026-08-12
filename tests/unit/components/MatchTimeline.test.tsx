import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import MatchTimeline from "@/components/MatchTimeline";
import type { MatchIncident } from "@/modules/tournament/domain/match";
import type { Team } from "@/modules/tournament/domain/team";

const teamA: Team = {
  id: "team-a",
  name: "Los Rayos",
  tournaments: ["t1"],
  player: [
    { id: "p1", name: "Juan", nickname: "Juan", tournaments: ["t1"], fullRegistered: false },
  ],
};

const teamB: Team = {
  id: "team-b",
  name: "Las Águilas",
  tournaments: ["t1"],
  player: [
    { id: "p2", name: "Carlos", nickname: "Carlos", tournaments: ["t1"], fullRegistered: false },
  ],
};

const incidents: MatchIncident[] = [
  { id: "i1", type: "GOAL", playerId: "p1", minute: 10, teamId: "team-a" },
  { id: "i2", type: "YELLOW_CARD", playerId: "p2", minute: 5, teamId: "team-b" },
  { id: "i3", type: "RED_CARD", playerId: "p1", minute: 80, teamId: "team-a" },
];

describe("MatchTimeline", () => {
  it("returns null when there are no incidents", () => {
    const { container } = render(
      <MatchTimeline incidents={[]} teamA={teamA} teamB={teamB} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("returns null when incidents is undefined", () => {
    const { container } = render(
      <MatchTimeline incidents={undefined as unknown as MatchIncident[]} teamA={teamA} teamB={teamB} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("sorts incidents by minute ascending", () => {
    render(<MatchTimeline incidents={incidents} teamA={teamA} teamB={teamB} />);
    const minutes = screen
      .getAllByText(/'\s*$/)
      .map((node) => Number(node.textContent?.replace("'", "")));
    expect(minutes).toEqual([5, 10, 80]);
  });

  it("shows the player names of each incident", () => {
    render(<MatchTimeline incidents={incidents} teamA={teamA} teamB={teamB} />);
    expect(screen.getAllByText("Juan")).toHaveLength(2);
    expect(screen.getByText("Carlos")).toBeInTheDocument();
  });

  it("marks the team side with (A) or (B)", () => {
    render(<MatchTimeline incidents={incidents} teamA={teamA} teamB={teamB} />);
    expect(screen.getAllByText("(A)")).toHaveLength(2);
    expect(screen.getByText("(B)")).toBeInTheDocument();
  });

  it("falls back to 'Jugador' when the player is not found", () => {
    const orphanIncidents: MatchIncident[] = [
      { id: "i9", type: "GOAL", playerId: "ghost", minute: 20, teamId: "team-a" },
    ];
    render(
      <MatchTimeline
        incidents={orphanIncidents}
        teamA={teamA}
        teamB={teamB}
      />,
    );
    expect(screen.getByText("Jugador")).toBeInTheDocument();
  });
});
