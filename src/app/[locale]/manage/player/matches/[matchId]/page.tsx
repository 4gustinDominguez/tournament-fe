"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/sections/tournaments/auth-context";
import { useTournamentContext } from "@/sections/tournaments/tournaments-context";
import { Match } from "@/modules/tournament/domain/match";
import { Team } from "@/modules/tournament/domain/team";
import MatchTimeline from "@/components/MatchTimeline";
import { PlaceLink } from "@/components/PlaceLink";
import { getPlace } from "@/lib/places";
import { ArrowLeft, MapPin, User, StickyNote } from "lucide-react";
import { useTranslations } from "next-intl";

export default function PlayerMatchDetailPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const router = useRouter();
  const t = useTranslations("PlayerMatchDetail");
  const tCommon = useTranslations("Common");
  const { user, isAuthenticated } = useAuth();
  const { getMatchById, getTeams, places } = useTournamentContext();

  const [match, setMatch] = useState<Match | null>(null);
  const [teamA, setTeamA] = useState<Team | null>(null);
  const [teamB, setTeamB] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const foundMatch = await getMatchById(matchId);
      if (!foundMatch) {
        setError(t("notFound"));
        return;
      }
      setMatch(foundMatch);

      const allTeams = await getTeams(foundMatch.tournamentId);
      setTeamA(allTeams.find((t) => t.id === foundMatch.teamAId) || null);
      setTeamB(allTeams.find((t) => t.id === foundMatch.teamBId) || null);
    } catch (err) {
      console.error("Error loading match:", err);
      setError(tCommon("error"));
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== UserRole.PLAYER) {
      setLoading(false);
      return;
    }
    loadData();
  }, [isAuthenticated, user]);

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
          <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
            {t("scheduled")}
          </span>
        );
      case "live":
        return (
          <span className="text-xs font-semibold bg-red-100 text-red-700 px-2.5 py-1 rounded-full animate-pulse">
            {t("live")}
          </span>
        );
      case "completed":
        return (
          <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
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

  if (error || !match) {
    return (
      <div className="py-8">
        <button
          onClick={() => router.push("/manage/player/matches")}
          className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> {t("back")}
        </button>
        <div className="bg-status-danger-soft border border-status-danger text-status-danger px-4 py-3 rounded-lg">
          {error || t("notFound")}
        </div>
      </div>
    );
  }

  const hasIncidents = match.incidents && match.incidents.length > 0;
  const hasNotes = match.notes && match.notes.trim().length > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <button
        onClick={() => router.push("/manage/player/matches")}
        className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" /> {t("back")}
      </button>

      {/* Score header */}
      <div className="bg-white rounded-2xl shadow-card border border-border p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <span className="text-sm text-muted-foreground">{formatDate(match.date)}</span>
          {getStatusBadge(match.status)}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0 text-right">
            <p className="font-bold text-foreground text-lg truncate">{teamA?.name || t("teamA")}</p>
          </div>

          <div className="mx-4 flex items-center gap-3 flex-shrink-0">
            {match.result ? (
              <span className="font-display text-3xl font-black text-foreground">
                {match.result.scoreA} - {match.result.scoreB}
              </span>
            ) : (
              <span className="text-muted-foreground text-lg font-semibold">vs</span>
            )}
          </div>

          <div className="flex-1 min-w-0 text-left">
            <p className="font-bold text-foreground text-lg truncate">{teamB?.name || t("teamB")}</p>
          </div>
        </div>
      </div>

      {/* Match info */}
      <div className="bg-white rounded-2xl shadow-card border border-border p-6 space-y-3">
        <PlaceLink place={getPlace(match.placeId, places)} />
        {match.refereeId && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{t("referee")}</span>
          </div>
        )}
      </div>

      {/* Incidents */}
      {hasIncidents && teamA && teamB && (
        <div className="bg-white rounded-2xl shadow-card border border-border p-6">
          <h2 className="font-display text-sm font-bold text-foreground mb-3 uppercase tracking-wider">
            {t("incidents")}
          </h2>
          <MatchTimeline incidents={match.incidents} teamA={teamA} teamB={teamB} />
        </div>
      )}

      {/* Notes */}
      {hasNotes && (
        <div className="bg-white rounded-2xl shadow-card border border-border p-6">
          <div className="flex items-center gap-2 mb-2">
            <StickyNote className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-display text-sm font-bold text-foreground uppercase tracking-wider">
              {t("notes")}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{match.notes}</p>
        </div>
      )}
    </div>
  );
}
