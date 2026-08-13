"use client";

import { useEffect, useState } from "react";
import { useAuth, UserRole } from "@/sections/tournaments/auth-context";
import { useTournamentContext } from "@/sections/tournaments/tournaments-context";
import { Team } from "@/modules/tournament/domain/team";
import { Player } from "@/modules/tournament/domain/player";
import { useTranslations } from "next-intl";
import { TeamCrest } from "@/components/TeamCrest";

export default function PlayerTeamsPage() {
  const t = useTranslations("PlayerTeams");
  const tCommon = useTranslations("Common");
  const { user, isAuthenticated } = useAuth();
  const { getMyTeams, getPlayerMe } = useTournamentContext();

  const [teams, setTeams] = useState<Team[]>([]);
  const [player, setPlayer] = useState<Player | null>(null);
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

        const myTeams = await getMyTeams();
        setTeams(myTeams);
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
      <div className="py-8">
        <h1 className="font-display text-2xl font-black text-foreground mb-4">
          {t("title")}
        </h1>
        <div className="bg-white rounded-xl shadow-card border border-border p-8 text-center">
          <p className="text-muted-foreground">{t("noTeams")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="font-display text-2xl font-black text-foreground mb-6">
        {t("title")}
      </h1>

      <div className="space-y-4">
        {teams.map((team) => (
          <div
            key={team.id}
            className="bg-white rounded-xl shadow-card border border-border p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <TeamCrest crestId={team.crestUrl} teamName={team.name} size={56} />
              <div>
                <h2 className="font-display text-xl font-black text-foreground">
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
              <div className="mt-3">
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
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-4">
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
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
