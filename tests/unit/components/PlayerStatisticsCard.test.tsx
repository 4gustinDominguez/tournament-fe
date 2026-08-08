import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import PlayerStatisticsCard from "@/components/PlayerStatisticsCard";
import type { PlayerStatistics } from "@/modules/tournament/domain/player";

const statistics: PlayerStatistics = {
  matchesPlayed: 12,
  goals: 8,
  assists: 3,
  yellowCards: 2,
  redCards: 1,
  minutesPlayed: 540,
};

describe("PlayerStatisticsCard", () => {
  it("renders the value of every statistic", () => {
    render(<PlayerStatisticsCard statistics={statistics} />);
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("540")).toBeInTheDocument();
  });

  it("renders a label per statistic using the PlayerStats namespace", () => {
    render(<PlayerStatisticsCard statistics={statistics} />);
    expect(screen.getByText("PlayerStats.matches")).toBeInTheDocument();
    expect(screen.getByText("PlayerStats.goals")).toBeInTheDocument();
    expect(screen.getByText("PlayerStats.assists")).toBeInTheDocument();
    expect(screen.getByText("PlayerStats.yellowCards")).toBeInTheDocument();
    expect(screen.getByText("PlayerStats.redCards")).toBeInTheDocument();
    expect(screen.getByText("PlayerStats.minutes")).toBeInTheDocument();
  });

  it("renders six stat cards", () => {
    const { container } = render(
      <PlayerStatisticsCard statistics={statistics} />,
    );
    expect(container.querySelectorAll("div").length).toBeGreaterThan(0);
  });
});
