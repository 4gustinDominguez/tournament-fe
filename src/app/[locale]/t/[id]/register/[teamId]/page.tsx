"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/sections/tournaments/auth-context";
import { useTournamentContext } from "@/sections/tournaments/tournaments-context";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { notify } from "@/lib/notify";
import { TeamCrest } from "@/components/TeamCrest";

interface PublicPlayer {
  id: string;
  name: string;
  nickname: string;
  dorsal?: number;
  registered: boolean;
}

export default function TeamRegisterPage() {
  const t = useTranslations("TeamRegister");
  const tCommon = useTranslations("Common");
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const { getTeamPublicInfo, claimPlayer } = useTournamentContext();

  const teamId = params.teamId as string;
  const tournamentId = params.id as string;
  const returnPath = `/t/${tournamentId}/register/${teamId}`;

  const [teamName, setTeamName] = useState("");
  const [crestUrl, setCrestUrl] = useState("");
  const [players, setPlayers] = useState<PublicPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const info = await getTeamPublicInfo(teamId);
        if (!info) {
          setError(t("notFound"));
          return;
        }
        setTeamName(info.team.name);
        setCrestUrl(info.team.crestUrl || "");
        setPlayers(info.players);
      } catch (err) {
        console.error("Error loading team info:", err);
        setError(tCommon("error"));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [teamId, isAuthenticated]);

  const handleClaim = async (playerId: string) => {
    if (!isAuthenticated) {
      notify.warning(t("loginRequired"));
      return;
    }

    setClaiming(playerId);
    try {
      await claimPlayer(playerId);
      notify.success(t("claimSuccess"));
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === playerId ? { ...p, registered: true } : p
        )
      );
    } catch (err) {
      notify.error(err instanceof Error ? err.message : t("claimError"));
    } finally {
      setClaiming(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          {tCommon("loading")}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="bg-status-danger-soft border border-status-danger text-status-danger px-4 py-3 rounded-lg max-w-md text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4 max-w-lg">
        <div className="bg-white rounded-2xl shadow-card border border-border p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <TeamCrest crestId={crestUrl} teamName={teamName} size={64} />
            <div>
              <h1 className="font-display text-2xl font-black text-foreground">
                {teamName}
              </h1>
              <p className="text-muted-foreground text-sm">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-border p-6">
          <h2 className="font-display text-lg font-bold text-foreground mb-4">
            {t("playerList")}
          </h2>

          <div className="space-y-3">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-neutral-50"
              >
                <div className="flex items-center gap-3">
                  {player.registered ? (
                    <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-neutral-200 text-neutral-500 flex items-center justify-center font-bold">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-foreground">
                      {player.name}
                      {player.dorsal && (
                        <span className="ml-2 text-sm text-muted-foreground">
                          #{player.dorsal}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {player.nickname}
                    </p>
                  </div>
                </div>

                <div>
                  {player.registered ? (
                    <span className="text-xs text-muted-foreground bg-neutral-100 px-3 py-1 rounded-full">
                      {t("registered")}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleClaim(player.id)}
                      disabled={claiming === player.id}
                      className="text-xs font-bold px-3 py-1 rounded-full transition-colors bg-brand-100 text-brand-700 hover:bg-brand-200 disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed"
                    >
                      {claiming === player.id ? tCommon("loading") : t("thisIsMe")}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!isAuthenticated && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {t("loginToClaim")}
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link
                  href={`/login?redirect=${encodeURIComponent(returnPath)}`}
                  className="text-sm font-bold text-brand-600 hover:text-brand-700"
                >
                  {tCommon("login")}
                </Link>
                <Link
                  href={`/register?role=PLAYER&redirect=${encodeURIComponent(returnPath)}`}
                  className="text-sm font-bold text-brand-600 hover:text-brand-700"
                >
                  {tCommon("register")}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
