"use client";

import { useEffect, useState } from "react";
import { useAuth, UserRole } from "@/sections/tournaments/auth-context";
import { useTournamentContext } from "@/sections/tournaments/tournaments-context";
import { Team } from "@/modules/tournament/domain/team";
import { Player } from "@/modules/tournament/domain/player";
import { useTranslations } from "next-intl";
import { TeamCrest } from "@/components/TeamCrest";

type TeamStats = { team: Team; statistics: Player["statistics"] };

export default function PlayerTeamsPage() {
  const t = useTranslations("PlayerTeams");
  const tCommon = useTranslations("Common");
  const { user, isAuthenticated } = useAuth();
  const { getMyTeams, getPlayerMe, getMyStats } = useTournamentContext();

  const [teams, setTeams] = useState<Team[]>([]);
  const [player, setPlayer] = useState<Player | null>(null);
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

        const [myTeams, myStats] = await Promise.all([getMyTeams(), getMyStats()]);
        setTeams(myTeams);
        setStats(myStats);
      } catch (err) {
        console.error("Error loading player teams:", err);
        setError(tCommon("error"));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, user]);

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

  if (teams.length === 0) {
    return (
      <div className="space-y-8">
        <h1 className="display-title text-3xl md:text-4xl text-foreground">
          {t("title")}
        </h1>
        <div className="bg-white rounded-xl shadow-card border border-border p-8 text-center">
          <p className="text-muted-foreground">{t("noTeams")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="display-title text-3xl md:text-4xl text-foreground">
        {t("title")}
      </h1>

      <div className="space-y-4">
        {teams.map((team) => {
          const teamStats = stats[team.id]?.statistics;
          return (
            <div
              key={team.id}
              className="bg-white rounded-xl shadow-card border border-border p-6"
            >
              <div className="flex items-center gap-4 mb-4 min-w-0">
                <TeamCrest crestId={team.crestUrl} teamName={team.name} size={56} />
                <div className="min-w-0">
                  <h2 className="font-display text-xl font-black text-foreground truncate">
                    {team.name}
                  </h2>
                  {team.coach && (
                    <p className="text-sm text-muted-foreground">
                      {t("coach")}: {team.coach}
                    </p>
                  )}
                </div>
              </div>

              {team.tournaments && team.tournaments.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    {t("tournaments")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {team.tournaments.map((tournamentId) => (
                      <span
                        key={tournamentId}
                        className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-full"
                      >
                        {tournamentId.slice(0, 8)}...
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {player && (
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-4 mb-3">
                    {player.photoUrl && (
                      <img
                        src={player.photoUrl}
                        alt={player.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {player.name}
                        {player.dorsal && (
                          <span className="ml-2 text-muted-foreground">
                            #{player.dorsal}
                          </span>
                        )}
                      </p>
                      {player.position && (
                        <p className="text-xs text-muted-foreground">{player.position}</p>
                      )}
                    </div>
                  </div>

                  {teamStats && (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      <StatBox label={t("statMatches")} value={teamStats.matchesPlayed} icon="🏟️" />
                      <StatBox label={t("statGoals")} value={teamStats.goals} icon="⚽" />
                      <StatBox label={t("statAssists")} value={teamStats.assists} icon="🅰️" />
                      <StatBox label={t("statYellow")} value={teamStats.yellowCards} icon="🟨" />
                      <StatBox label={t("statRed")} value={teamStats.redCards} icon="🟥" />
                      <StatBox label={t("statMinutes")} value={teamStats.minutesPlayed} icon="⏱️" />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatBox({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-neutral-50 rounded-lg p-3 text-center border border-border">
      <div className="text-lg mb-1">{icon}</div>
      <div className="text-lg font-black text-foreground">{value}</div>
      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}
