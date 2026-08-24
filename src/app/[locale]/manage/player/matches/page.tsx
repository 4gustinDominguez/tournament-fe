"use client";

import { useEffect, useState } from "react";
import { useAuth, UserRole } from "@/sections/tournaments/auth-context";
import { useTournamentContext } from "@/sections/tournaments/tournaments-context";
import { Match } from "@/modules/tournament/domain/match";
import { Team } from "@/modules/tournament/domain/team";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";

export default function PlayerMatchesPage() {
  const t = useTranslations("PlayerMatches");
  const tCommon = useTranslations("Common");
  const { user, isAuthenticated } = useAuth();
  const { getMyMatches, getMyTeams, getTeams } = useTournamentContext();

  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
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
        const [myTeams, myMatches] = await Promise.all([
          getMyTeams(),
          getMyMatches(),
        ]);

        const tournamentIds = [...new Set(myMatches.map((m) => m.tournamentId))];
        const allTeamsNested = await Promise.all(
          tournamentIds.map((tid) => getTeams(tid)),
        );
        const allTeams = allTeamsNested.flat();
        const mergedTeams = [
          ...allTeams,
          ...myTeams.filter((mt) => !allTeams.some((t) => t.id === mt.id)),
        ];

        setTeams(mergedTeams);
        setMatches(myMatches);
      } catch (err) {
        console.error("Error loading player matches:", err);
        setError(tCommon("error"));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, user]);

  const getTeamName = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId);
    return team?.name || t("unknownTeam");
  };

  const formatDate = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {t("scheduled")}
          </span>
        );
      case "live":
        return (
          <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-1 rounded-full animate-pulse">
            {t("live")}
          </span>
        );
      case "completed":
        return (
          <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">
            {t("completed")}
          </span>
        );
      default:
        return null;
    }
  };

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

  const upcomingMatches = matches.filter((m) => m.status === "scheduled");
  const liveMatches = matches.filter((m) => m.status === "live");
  const completedMatches = matches.filter((m) => m.status === "completed");

  return (
    <div className="py-8">
      <h1 className="font-display text-2xl font-black text-foreground mb-6">
        {t("title")}
      </h1>

      {matches.length === 0 ? (
        <div className="bg-white rounded-xl shadow-card border border-border p-8 text-center">
          <p className="text-muted-foreground">{t("noMatches")}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {liveMatches.length > 0 && (
            <div>
              <h2 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                {t("liveMatches")}
              </h2>
              <div className="space-y-3">
                {liveMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    getTeamName={getTeamName}
                    formatDate={formatDate}
                    getStatusBadge={getStatusBadge}
                  />
                ))}
              </div>
            </div>
          )}

          {upcomingMatches.length > 0 && (
            <div>
              <h2 className="font-display text-lg font-bold text-foreground mb-3">
                {t("upcomingMatches")}
              </h2>
              <div className="space-y-3">
                {upcomingMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    getTeamName={getTeamName}
                    formatDate={formatDate}
                    getStatusBadge={getStatusBadge}
                  />
                ))}
              </div>
            </div>
          )}

          {completedMatches.length > 0 && (
            <div>
              <h2 className="font-display text-lg font-bold text-foreground mb-3">
                {t("completedMatches")}
              </h2>
              <div className="space-y-3">
                {completedMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    getTeamName={getTeamName}
                    formatDate={formatDate}
                    getStatusBadge={getStatusBadge}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MatchCard({
  match,
  getTeamName,
  formatDate,
  getStatusBadge,
}: {
  match: Match;
  getTeamName: (id: string) => string;
  formatDate: (date: string | Date) => string;
  getStatusBadge: (status: string) => React.ReactNode;
}) {
  return (
    <Link
      href={`/manage/player/matches/${match.id}`}
      className="block bg-white rounded-xl shadow-card border border-border p-4 hover:shadow-elevated hover:border-brand-300 transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{formatDate(match.date)}</span>
        {getStatusBadge(match.status)}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1 text-right">
          <p className="font-bold text-foreground">{getTeamName(match.teamAId)}</p>
        </div>

        <div className="mx-4 flex items-center gap-2">
          {match.result ? (
            <span className="font-display text-xl font-black text-foreground">
              {match.result.scoreA} - {match.result.scoreB}
            </span>
          ) : (
            <span className="text-muted-foreground text-sm">vs</span>
          )}
        </div>

        <div className="flex-1 text-left">
          <p className="font-bold text-foreground">{getTeamName(match.teamBId)}</p>
        </div>
      </div>
    </Link>
  );
}
