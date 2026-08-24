"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, UserRole } from "@/sections/tournaments/auth-context";
import { useTournamentContext } from "@/sections/tournaments/tournaments-context";
import { Team } from "@/modules/tournament/domain/team";
import { Player, PlayerStatistics } from "@/modules/tournament/domain/player";
import { Match } from "@/modules/tournament/domain/match";
import { useTranslations } from "next-intl";
import { TeamCrest } from "@/components/TeamCrest";
import { Button } from "@/components/ui/button";

type TeamStats = { team: Team; statistics: PlayerStatistics };

const EMPTY_STATS: PlayerStatistics = {
  matchesPlayed: 0,
  goals: 0,
  assists: 0,
  yellowCards: 0,
  redCards: 0,
  minutesPlayed: 0,
};

export default function PlayerDashboardPage() {
  const t = useTranslations("PlayerDashboard");
  const tCommon = useTranslations("Common");
  const { user, isAuthenticated } = useAuth();
  const { getPlayerMe, getMyTeams, getMyMatches, getMyStats } = useTournamentContext();

  const [player, setPlayer] = useState<Player | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [stats, setStats] = useState<Record<string, TeamStats>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== UserRole.PLAYER) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const playerProfile = await getPlayerMe();
        if (!playerProfile) {
          setError(t("noProfile"));
          return;
        }
        setPlayer(playerProfile);

        const [myTeams, myMatches, myStats] = await Promise.all([
          getMyTeams(),
          getMyMatches(),
          getMyStats(),
        ]);
        setTeams(myTeams);
        setMatches(myMatches);
        const normalized: Record<string, TeamStats> = {};
        for (const [teamId, entry] of Object.entries(myStats)) {
          normalized[teamId] = {
            team: entry.team,
            statistics: entry.statistics ?? EMPTY_STATS,
          };
        }
        setStats(normalized);
      } catch (err) {
        console.error("Error loading player dashboard:", err);
        setError(tCommon("error"));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, user]);

  const totalStats = Object.values(stats).reduce<PlayerStatistics>(
    (acc, { statistics }) => ({
      matchesPlayed: acc.matchesPlayed + statistics.matchesPlayed,
      goals: acc.goals + statistics.goals,
      assists: acc.assists + statistics.assists,
      yellowCards: acc.yellowCards + statistics.yellowCards,
      redCards: acc.redCards + statistics.redCards,
      minutesPlayed: acc.minutesPlayed + statistics.minutesPlayed,
    }),
    EMPTY_STATS,
  );

  const upcomingMatches = matches
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const getTeamName = (teamId: string) => {
    return teams.find((t) => t.id === teamId)?.name || t("unknownTeam");
  };

  if (!isAuthenticated || user?.role !== UserRole.PLAYER) {
    return (
      <div className="py-8">
        <div className="bg-status-danger-soft border border-status-danger text-status-danger px-4 py-3 rounded-lg">
          {tCommon("denyAccess")}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{tCommon("loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <div className="bg-status-danger-soft border border-status-danger text-status-danger px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-black text-foreground">
          {t("title")}
        </h1>
        <Link href="/manage/player/profile">
          <Button variant="outline">{t("editProfile")}</Button>
        </Link>
      </div>

      {player && (
        <div className="bg-white rounded-xl border border-border shadow-card p-6">
          <div className="flex items-center gap-4">
            {player.photoUrl ? (
              <img
                src={player.photoUrl}
                alt={player.name}
                className="h-16 w-16 rounded-xl object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-display font-bold text-2xl">
                {player.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                {player.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {player.nickname}
                {player.dorsal && ` · #${player.dorsal}`}
                {player.position && ` · ${player.position}`}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryStat label={t("statTeams")} value={teams.length} icon="⚽" />
        <SummaryStat label={t("statMatches")} value={totalStats.matchesPlayed} icon="🏟️" />
        <SummaryStat label={t("statGoals")} value={totalStats.goals} icon="⚽" />
        <SummaryStat label={t("statAssists")} value={totalStats.assists} icon="🅰️" />
        <SummaryStat label={t("statUpcoming")} value={upcomingMatches.length} icon="📅" />
        <SummaryStat label={t("statCards")} value={totalStats.yellowCards + totalStats.redCards} icon="🟨" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold text-foreground">
              {t("myTeams")}
            </h3>
            {teams.length > 0 && (
              <Link
                href="/manage/player/teams"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                {t("viewAll")}
              </Link>
            )}
          </div>
          {teams.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noTeams")}</p>
          ) : (
            <ul className="space-y-3">
              {teams.slice(0, 3).map((team) => (
                <li key={team.id} className="flex items-center gap-3">
                  <TeamCrest crestId={team.crestUrl} teamName={team.name} size={40} />
                  <div>
                    <p className="font-semibold text-foreground">{team.name}</p>
                    {team.coach && (
                      <p className="text-xs text-muted-foreground">{team.coach}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl border border-border shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold text-foreground">
              {t("upcomingMatches")}
            </h3>
            {matches.length > 0 && (
              <Link
                href="/manage/player/matches"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                {t("viewAll")}
              </Link>
            )}
          </div>
          {upcomingMatches.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noUpcomingMatches")}</p>
          ) : (
            <ul className="space-y-3">
              {upcomingMatches.map((m) => (
                <li key={m.id} className="text-sm">
                  <p className="font-semibold text-foreground">
                    {new Date(m.date).toLocaleDateString()}
                  </p>
                   <p className="text-xs text-muted-foreground">
                     {getTeamName(m.teamAId)} vs {getTeamName(m.teamBId)}
                   </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryStat({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-black text-foreground">{value}</div>
      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}
